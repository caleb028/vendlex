import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path";
import { apiRouter } from "./routes";
import { checkDatabaseHealth } from "./db";

const app = express();
const PORT = parseInt(process.env.PORT || "5000", 10);
const HOST = "0.0.0.0";

// ============================================================================
// 1. PRODUCTION CORS CONFIGURATION
// ============================================================================
const allowedOrigins = [
  "https://vendlex.vercel.app",
  "https://www.vendlex.vercel.app",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

// Add custom origins from CORS_ORIGIN environment variable if present
if (process.env.CORS_ORIGIN) {
  process.env.CORS_ORIGIN.split(",").forEach((origin) => {
    const trimmed = origin.trim();
    if (trimmed && !allowedOrigins.includes(trimmed)) {
      allowedOrigins.push(trimmed);
    }
  });
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      // Check explicit allowlist or Vercel preview URLs (*.vercel.app)
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        origin.includes("vendlex.vercel.app")
      ) {
        return callback(null, true);
      }

      console.warn(`[CORS Blocked]: Origin "${origin}" not in allowed list`);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    maxAge: 86400, // 24 hours preflight cache
  })
);

// ============================================================================
// 2. SECURITY HEADERS & BODY PARSING
// ============================================================================
app.disable("x-powered-by");

app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

// JSON and URL-encoded body parsing with 10MB limits for documents/uploads
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Simple cookie parser helper
app.use((req: Request, _res: Response, next: NextFunction) => {
  const cookieHeader = req.headers.cookie;
  const cookies: Record<string, string> = {};
  if (cookieHeader) {
    cookieHeader.split(";").forEach((cookie) => {
      const [name, ...rest] = cookie.split("=");
      if (name && rest.length > 0) {
        cookies[name.trim()] = decodeURIComponent(rest.join("=").trim());
      }
    });
  }
  (req as any).cookies = cookies;
  next();
});

// Request logger for production diagnostics
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path !== "/health" && req.path !== "/api/health") {
      console.log(`[API] ${req.method} ${req.path} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// ============================================================================
// 3. ROOT HEALTH CHECKS
// ============================================================================
app.get("/health", async (_req: Request, res: Response) => {
  const dbHealth = await checkDatabaseHealth();
  res.json({
    status: "ok",
    service: "VendLex API (Render)",
    environment: process.env.NODE_ENV || "development",
    version: "2.0.0",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: dbHealth,
  });
});

app.get("/", (_req: Request, res: Response) => {
  res.json({
    service: "VendLex Kenya API",
    status: "online",
    documentation: "https://vendlex.vercel.app",
    healthCheck: "/health",
    version: "2.0.0",
  });
});

// ============================================================================
// 4. MOUNT API ROUTER
// ============================================================================
app.use("/api", apiRouter);

// ============================================================================
// 5. 404 & GLOBAL ERROR HANDLER
// ============================================================================
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found on VendLex API server.",
  });
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[Unhandled Server Error]:", err);
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === "production" ? "Internal server error." : err?.message,
  });
});

// ============================================================================
// 6. SERVER BOOTSTRAP
// ============================================================================
export function startServer(port = PORT, host = HOST) {
  const server = app.listen(port, host, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 VENDLEX KENYA NODE.JS API SERVER LIVE`);
    console.log(`======================================================`);
    console.log(`📍 Host: http://${host}:${port}`);
    console.log(`🩺 Health: http://${host}:${port}/health`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`🔒 Allowed Origins: ${allowedOrigins.join(", ")}`);
    console.log(`======================================================\n`);
  });

  const handleShutdown = (signal: string) => {
    console.log(`\n[Server] Received ${signal}. Gracefully closing HTTP server...`);
    server.close(() => {
      console.log("[Server] HTTP server closed. Process exiting cleanly.");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => handleShutdown("SIGTERM"));
  process.on("SIGINT", () => handleShutdown("SIGINT"));

  return server;
}

if (process.env.NODE_ENV !== "test" && !process.env.VENDLEX_TEST_RUNNER) {
  startServer();
}

export default app;

