import { Router, Request, Response } from "express";
import { serverDB, hashPassword, verifyPassword, hashToken, normalizeKenyanPhone } from "../lib/server-db";
import { DocumentService } from "../lib/documents/service";
import { VendLexPDFEngine } from "../lib/documents/pdf-engine";
import { VendLexMarketingEngine } from "../lib/marketing/engine";
import { ProductFeedEngine } from "../lib/marketing/feed-engine";
import { GoogleAdapter } from "../lib/marketing/adapters/google";
import { MetaAdapter } from "../lib/marketing/adapters/meta";
import { checkDatabaseHealth } from "./db";
import { sanitizeInput, checkRateLimit } from "../lib/security";
import { MOCK_PRODUCTS } from "../lib/data/kenya-data";

export const apiRouter = Router();

// ============================================================================
// 1. HEALTH & DIAGNOSTICS ENDPOINTS
// ============================================================================
apiRouter.get("/health", async (_req: Request, res: Response) => {
  const dbHealth = await checkDatabaseHealth();
  res.json({
    status: "ok",
    service: "VendLex Kenya API",
    environment: process.env.NODE_ENV || "development",
    version: "2.0.0",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: dbHealth,
  });
});

// ============================================================================
// 2. AUTHENTICATION ENDPOINTS
// ============================================================================
apiRouter.post("/auth/login", async (req: Request, res: Response) => {
  try {
    const ip = (req.ip || req.socket.remoteAddress || "local") as string;
    const rateCheck = checkRateLimit(`login:${ip}`, 10, 60 * 1000);
    if (!rateCheck.allowed) {
      return res.status(429).json({ success: false, error: "Too many login attempts. Please slow down." });
    }

    const { identifier, email, password, rememberMe } = req.body;
    const loginIdentifier = (identifier || email || "").trim();

    if (!loginIdentifier || !password) {
      return res.status(400).json({ success: false, error: "Identifier and password are required." });
    }

    const user = serverDB.findUserByIdentifier(loginIdentifier);
    if (!user) {
      return res.status(401).json({ success: false, error: "Invalid email/phone or password." });
    }

    if (user.lockedUntil && Date.now() < user.lockedUntil) {
      const minutesLeft = Math.ceil((user.lockedUntil - Date.now()) / 60000);
      return res.status(423).json({ success: false, error: `Account locked. Try again in ${minutesLeft} minute(s).` });
    }

    const isValid = verifyPassword(password, user.passwordHash, user.salt);
    if (!isValid) {
      const attempts = (user.loginAttempts || 0) + 1;
      const updates: Record<string, any> = { loginAttempts: attempts };
      if (attempts >= 5) {
        updates.lockedUntil = Date.now() + 15 * 60 * 1000;
      }
      serverDB.updateUser(user.id, updates);
      return res.status(401).json({ success: false, error: "Invalid email/phone or password." });
    }

    serverDB.updateUser(user.id, { loginAttempts: 0, lockedUntil: undefined });
    const session = serverDB.createSession(user.id, user.role, {
      rememberMe: rememberMe === true,
      ipAddress: ip,
      userAgent: req.headers["user-agent"],
    });

    const maxAge = rememberMe ? 30 * 24 * 3600 * 1000 : 72 * 3600 * 1000;
    res.cookie("vendlex_session", session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge,
      path: "/",
    });

    return res.json({
      success: true,
      message: "Sign in successful.",
      token: session.token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        businessId: user.businessId,
        businessSlug: user.businessSlug,
        businessName: user.businessName,
        isVerified: user.isVerified,
      },
    });
  } catch (err: any) {
    console.error("[Login Error]:", err);
    return res.status(500).json({ success: false, error: "Internal server error during login." });
  }
});

apiRouter.post("/auth/register", async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password, role, businessName } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ success: false, error: "All required registration fields must be provided." });
    }

    if (serverDB.findUserByEmail(email)) {
      return res.status(409).json({ success: false, error: "An account with this email already exists." });
    }

    const normalizedPhone = normalizeKenyanPhone(phone);
    if (normalizedPhone && serverDB.findUserByPhone(normalizedPhone)) {
      return res.status(409).json({ success: false, error: "An account with this phone already exists." });
    }

    const newUser = serverDB.createUser({
      name: sanitizeInput(name, 80),
      email: email.toLowerCase().trim(),
      phone: sanitizeInput(phone, 20),
      password,
      role: role || "CUSTOMER",
      businessName: businessName ? sanitizeInput(businessName, 100) : undefined,
    });

    const session = serverDB.createSession(newUser.id, newUser.role, {
      ipAddress: (req.ip || "local") as string,
      userAgent: req.headers["user-agent"],
    });

    res.cookie("vendlex_session", session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 72 * 3600 * 1000,
      path: "/",
    });

    return res.json({
      success: true,
      message: "Account created successfully.",
      token: session.token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        avatar: newUser.avatar,
        businessId: newUser.businessId,
        businessSlug: newUser.businessSlug,
        businessName: newUser.businessName,
        isVerified: newUser.isVerified,
      },
    });
  } catch (err: any) {
    console.error("[Register Error]:", err);
    return res.status(500).json({ success: false, error: "Registration failed." });
  }
});

apiRouter.get("/auth/me", (req: Request, res: Response) => {
  const token = req.cookies?.vendlex_session || req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    return res.json({ authenticated: false, user: null });
  }

  const session = serverDB.getSession(token);
  if (!session) {
    return res.json({ authenticated: false, user: null });
  }

  const user = serverDB.findUserById(session.userId);
  if (!user) {
    return res.json({ authenticated: false, user: null });
  }

  return res.json({
    authenticated: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      businessId: user.businessId,
      businessSlug: user.businessSlug,
      businessName: user.businessName,
      isVerified: user.isVerified,
    },
  });
});

apiRouter.post("/auth/logout", (req: Request, res: Response) => {
  const token = req.cookies?.vendlex_session || req.headers.authorization?.replace("Bearer ", "");
  if (token) {
    serverDB.deleteSession(token);
  }
  res.clearCookie("vendlex_session", { path: "/" });
  return res.json({ success: true, message: "Logged out successfully." });
});

// ============================================================================
// 3. PRODUCTS & CATALOG
// ============================================================================
apiRouter.get("/products", (req: Request, res: Response) => {
  const { category, county, search, sellerId } = req.query;
  let products = serverDB.getProducts ? serverDB.getProducts() : MOCK_PRODUCTS;

  if (category && category !== "ALL") {
    products = products.filter((p: any) => p.category?.toLowerCase() === String(category).toLowerCase());
  }
  if (county && county !== "ALL") {
    products = products.filter((p: any) => p.county?.toLowerCase() === String(county).toLowerCase());
  }
  if (sellerId) {
    products = products.filter((p: any) => p.sellerId === String(sellerId));
  }
  if (search) {
    const q = String(search).toLowerCase().trim();
    products = products.filter(
      (p: any) =>
        p.title?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
    );
  }

  return res.json({
    success: true,
    count: products.length,
    products,
  });
});

apiRouter.get("/products/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const products = serverDB.getProducts ? serverDB.getProducts() : MOCK_PRODUCTS;
  const product = products.find((p: any) => p.id === id || p.slug === id);
  if (!product) {
    return res.status(404).json({ success: false, error: "Product not found." });
  }
  return res.json({ success: true, product });
});

// ============================================================================
// 4. ORDERS & ESCROW
// ============================================================================
apiRouter.get("/orders", (req: Request, res: Response) => {
  const { customerId, sellerId, status } = req.query;
  let orders = serverDB.getOrders();

  if (customerId) {
    orders = serverDB.getCustomerOrders(String(customerId));
  } else if (sellerId) {
    orders = serverDB.getSellerOrders(String(sellerId));
  }

  if (status && status !== "ALL") {
    orders = orders.filter((o) => o.status === status);
  }

  return res.json({ success: true, count: orders.length, orders });
});

apiRouter.post("/orders", (req: Request, res: Response) => {
  try {
    const orderData = req.body;
    if (!orderData.items || orderData.items.length === 0) {
      return res.status(400).json({ success: false, error: "Order must contain at least one item." });
    }

    const order = serverDB.createOrder(orderData);
    return res.status(201).json({ success: true, order });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || "Failed to create order." });
  }
});

// ============================================================================
// 5. SAFARICOM DARAJA & M-PESA
// ============================================================================
apiRouter.post("/daraja/stkpush", async (req: Request, res: Response) => {
  try {
    const { phone, amount, orderNumber, reference } = req.body;
    if (!phone || !amount) {
      return res.status(400).json({ success: false, error: "Phone number and amount are required." });
    }

    const normalizedPhone = normalizeKenyanPhone(phone) || phone;
    const checkoutRequestId = `ws_CO_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // STK Push Dispatch
    return res.json({
      success: true,
      CheckoutRequestID: checkoutRequestId,
      MerchantRequestID: `MR_${Date.now()}`,
      ResponseCode: "0",
      ResponseDescription: "Success. Request accepted for processing",
      CustomerMessage: `Please check your phone ${normalizedPhone} and enter your M-Pesa PIN to complete payment of KSh ${amount}.`,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: "Daraja STK Push failed." });
  }
});

apiRouter.post("/daraja/callback", async (req: Request, res: Response) => {
  try {
    const callbackData = req.body;
    console.log("[Daraja Callback Received]:", JSON.stringify(callbackData, null, 2));

    const stkCallback = callbackData?.Body?.stkCallback;
    const resultCode = stkCallback?.ResultCode;

    if (resultCode === 0) {
      const items = stkCallback?.CallbackMetadata?.Item || [];
      const mpesaReceipt = items.find((i: any) => i.Name === "MpesaReceiptNumber")?.Value || `QKH${Date.now()}`;
      const amount = items.find((i: any) => i.Name === "Amount")?.Value || 0;

      // Track verified conversion
      await VendLexMarketingEngine.trackEvent({
        eventType: "purchase",
        orderId: `ord-${Date.now()}`,
        value: amount,
        metadata: { mpesaReceipt },
      });
    }

    return res.json({ ResultCode: 0, ResultDesc: "Callback processed successfully" });
  } catch (err: any) {
    console.error("[Daraja Callback Error]:", err);
    return res.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }
});

// ============================================================================
// 6. VERIFIED DOCUMENTS & STAMPS
// ============================================================================
apiRouter.get("/documents", (req: Request, res: Response) => {
  const { type, status, search } = req.query;
  const docs = DocumentService.listDocuments(undefined, {
    type: type ? String(type) : undefined,
    status: status ? String(status) : undefined,
    search: search ? String(search) : undefined,
  });
  return res.json({ success: true, count: docs.length, documents: docs });
});

apiRouter.get("/documents/:id/pdf", async (req: Request, res: Response) => {
  try {
    const docId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const docResult = DocumentService.getDocument(docId);
    if (!docResult.success || !docResult.document) {
      return res.status(404).json({ success: false, error: docResult.error || "Document not found." });
    }

    const pdfResult = await VendLexPDFEngine.renderDocumentPDF(docResult.document);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${docResult.document.publicDocumentId}.pdf"`);
    return res.send(Buffer.from(pdfResult.pdfBytes));
  } catch (err: any) {
    console.error("[PDF Render Error]:", err);
    return res.status(500).json({ success: false, error: "Failed to generate document PDF." });
  }
});

apiRouter.get("/documents/verify", (req: Request, res: Response) => {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ success: false, error: "Document identifier is required." });
  }
  const result = DocumentService.verifyDocument(String(id));
  return res.json({ success: true, verification: result });
});

// ============================================================================
// 7. HELP & SUPPORT TICKETS
// ============================================================================
apiRouter.get("/support/tickets", (req: Request, res: Response) => {
  const { status, category, userId, search, ticketNumber } = req.query;
  if (ticketNumber) {
    const ticket = serverDB.findSupportTicketById(String(ticketNumber));
    if (!ticket) {
      return res.status(404).json({ success: false, error: "Ticket not found." });
    }
    return res.json({ success: true, ticket });
  }

  const tickets = serverDB.getSupportTickets({
    status: status ? String(status) : undefined,
    category: category ? String(category) : undefined,
    userId: userId ? String(userId) : undefined,
    search: search ? String(search) : undefined,
  });
  return res.json({ success: true, count: tickets.length, tickets });
});

apiRouter.post("/support/tickets", (req: Request, res: Response) => {
  try {
    const ticket = serverDB.createSupportTicket(req.body);
    return res.status(201).json({ success: true, ticket });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err?.message || "Failed to create support ticket." });
  }
});

apiRouter.post("/support/tickets/:id/reply", (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { message, senderName, senderRole, senderId } = req.body;
    const updated = serverDB.addSupportTicketMessage(id, {
      message: sanitizeInput(message, 2000),
      senderName: sanitizeInput(senderName || "Customer", 80),
      senderRole: senderRole || "CUSTOMER",
      senderId,
    });
    if (!updated) {
      return res.status(404).json({ success: false, error: "Ticket not found." });
    }
    return res.json({ success: true, ticket: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: "Failed to post message reply." });
  }
});

// ============================================================================
// 8. MARKETING, FEEDS & ADVERTISING
// ============================================================================
apiRouter.get("/feeds/google-merchant.xml", (_req: Request, res: Response) => {
  const xml = ProductFeedEngine.generateGoogleFeed();
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  return res.send(xml);
});

apiRouter.get("/feeds/meta-catalog.csv", (_req: Request, res: Response) => {
  const csv = ProductFeedEngine.generateMetaFeed();
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="meta-catalog.csv"');
  return res.send(csv);
});

apiRouter.get("/advertising/status", async (_req: Request, res: Response) => {
  const google = GoogleAdapter.getConnectionStatus();
  const meta = MetaAdapter.getConnectionStatus();
  return res.json({
    success: true,
    connections: { google, meta },
  });
});
