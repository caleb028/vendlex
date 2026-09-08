import { Pool, QueryResult, QueryResultRow } from "pg";

let pool: Pool | null = null;

export function getDatabasePool(): Pool | null {
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return null;
  }

  try {
    const isProduction = process.env.NODE_ENV === "production";
    const useSsl = connectionString.includes("sslmode=require") || isProduction;

    pool = new Pool({
      connectionString,
      ssl: useSsl ? { rejectUnauthorized: false } : undefined,
      max: parseInt(process.env.DB_POOL_MAX || "10", 10),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    pool.on("error", (err) => {
      console.error("[PostgreSQL Pool Error]: Unexpected error on idle client", err);
    });

    return pool;
  } catch (err: any) {
    console.error("[PostgreSQL Pool Initialization Error]:", err?.message);
    return null;
  }
}

export async function query<R extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<R> | null> {
  const p = getDatabasePool();
  if (!p) return null;

  const start = Date.now();
  try {
    const res = await p.query<R>(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === "development") {
      console.log(`[SQL Executed] Duration: ${duration}ms | Query: ${text.slice(0, 80)}...`);
    }
    return res;
  } catch (err: any) {
    console.error("[PostgreSQL Query Error]:", {
      message: err?.message,
      query: text,
      params,
    });
    throw err;
  }
}

export async function checkDatabaseHealth(): Promise<{
  connected: boolean;
  type: "POSTGRESQL" | "IN_MEMORY_FILE";
  latencyMs?: number;
  error?: string;
}> {
  const p = getDatabasePool();
  if (!p) {
    return {
      connected: true,
      type: "IN_MEMORY_FILE",
    };
  }

  const start = Date.now();
  try {
    await p.query("SELECT 1 AS health_check");
    const latencyMs = Date.now() - start;
    return {
      connected: true,
      type: "POSTGRESQL",
      latencyMs,
    };
  } catch (err: any) {
    return {
      connected: false,
      type: "POSTGRESQL",
      error: err?.message || "Connection failed",
    };
  }
}
