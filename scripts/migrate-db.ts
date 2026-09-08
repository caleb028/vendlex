import { Pool } from "pg";
import fs from "fs";
import path from "path";

async function runMigration() {
  const connectionString = process.env.DATABASE_URL;

  console.log("\n=======================================================");
  console.log("🚀 VENDLEX KENYA — POSTGRESQL PRODUCTION MIGRATION RUNNER");
  console.log("=======================================================\n");

  if (!connectionString) {
    console.log("ℹ️ DATABASE_URL not detected in environment.");
    console.log("ℹ️ Server will utilize resilient in-memory / file persistence.");
    console.log("ℹ️ When connecting PostgreSQL (Render, Supabase, Neon), set DATABASE_URL to run full schema sync.\n");
    return;
  }

  console.log("🔄 Connecting to PostgreSQL database...");
  const isProduction = process.env.NODE_ENV === "production";
  const useSsl = connectionString.includes("sslmode=require") || isProduction;

  const pool = new Pool({
    connectionString,
    ssl: useSsl ? { rejectUnauthorized: false } : undefined,
    connectionTimeoutMillis: 10000,
  });

  try {
    const client = await pool.connect();
    console.log("✓ Connected successfully to PostgreSQL database.");

    // Load DATABASE_SCHEMA.sql
    const sqlPath = path.join(process.cwd(), "DATABASE_SCHEMA.sql");
    if (fs.existsSync(sqlPath)) {
      console.log("📄 Reading DATABASE_SCHEMA.sql...");
      const schemaSql = fs.readFileSync(sqlPath, "utf-8");

      // Execute migration in transaction
      await client.query("BEGIN");

      // Create support tables if not yet in sql schema
      const additionalTablesSql = `
        CREATE TABLE IF NOT EXISTS support_tickets (
          id VARCHAR(64) PRIMARY KEY,
          ticket_number VARCHAR(32) UNIQUE NOT NULL,
          user_id VARCHAR(64),
          user_name VARCHAR(120) NOT NULL,
          user_email VARCHAR(120) NOT NULL,
          user_phone VARCHAR(30) NOT NULL,
          user_role VARCHAR(30) DEFAULT 'CUSTOMER',
          category VARCHAR(60) NOT NULL,
          subject VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          priority VARCHAR(20) DEFAULT 'MEDIUM',
          status VARCHAR(20) DEFAULT 'OPEN',
          order_number VARCHAR(60),
          assigned_to VARCHAR(120),
          resolution_notes TEXT,
          messages JSONB DEFAULT '[]'::jsonb,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS marketing_campaigns (
          id VARCHAR(64) PRIMARY KEY,
          seller_id VARCHAR(64) NOT NULL,
          seller_name VARCHAR(120) NOT NULL,
          name VARCHAR(255) NOT NULL,
          platform VARCHAR(30) NOT NULL,
          objective VARCHAR(30) NOT NULL,
          budget_amount DECIMAL(12,2) NOT NULL,
          daily_budget DECIMAL(12,2) NOT NULL,
          status VARCHAR(30) DEFAULT 'ACTIVE',
          metrics JSONB DEFAULT '{}'::jsonb,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS verified_documents (
          id VARCHAR(64) PRIMARY KEY,
          public_id VARCHAR(64) UNIQUE NOT NULL,
          type VARCHAR(40) NOT NULL,
          verification_code VARCHAR(32) NOT NULL,
          file_hash VARCHAR(128) NOT NULL,
          status VARCHAR(20) DEFAULT 'VALID',
          metadata JSONB DEFAULT '{}'::jsonb,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `;

      try {
        await client.query(schemaSql);
        console.log("✓ Core marketplace schema applied.");
      } catch (err: any) {
        // Table or type might already exist
        console.log("ℹ️ Base schema exists or partially applied:", err?.message);
      }

      await client.query(additionalTablesSql);
      console.log("✓ Support tickets, marketing campaigns, and verified documents tables verified.");

      await client.query("COMMIT");
      console.log("\n=======================================================");
      console.log("✅ DATABASE MIGRATION COMPLETED SUCCESSFULLY");
      console.log("=======================================================\n");
    } else {
      console.warn("⚠️ DATABASE_SCHEMA.sql not found at:", sqlPath);
    }

    client.release();
  } catch (err: any) {
    console.error("❌ Migration failed:", err?.message);
    throw err;
  } finally {
    await pool.end();
  }
}

runMigration().catch((err) => {
  console.error("Fatal error during database migration:", err);
  process.exit(1);
});
