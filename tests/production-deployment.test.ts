process.env.VENDLEX_TEST_RUNNER = "true";
process.env.NODE_ENV = "test";

import http from "http";
import app from "../server/index";
import { checkDatabaseHealth } from "../server/db";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedCount++;
  } else {
    console.error(`  ✗ FAIL: ${testName}${detail ? ` -> ${detail}` : ""}`);
    failedCount++;
  }
}

async function runProductionDeploymentTests() {
  console.log("\n=======================================================");
  console.log("🚀 STARTING VENDLEX PRODUCTION DEPLOYMENT TEST SUITE");
  console.log("=======================================================\n");

  const TEST_PORT = 5099;
  let serverInstance: http.Server;

  // 1. SERVER STARTUP & HEALTH CHECK
  console.log("1. Standalone Backend Server & Health Check Tests:");
  await new Promise<void>((resolve) => {
    serverInstance = app.listen(TEST_PORT, "127.0.0.1", () => {
      assert(true, `Server booted successfully on port ${TEST_PORT}`);
      resolve();
    });
  });

  try {
    // Test GET /health
    const healthRes = await fetch(`http://127.0.0.1:${TEST_PORT}/health`);
    assert(healthRes.status === 200, "GET /health returns HTTP 200 OK");
    const healthData = await healthRes.json();
    assert(healthData.status === "ok", "Health status is 'ok'");
    assert(healthData.service.includes("VendLex"), "Service name identifies VendLex");
    assert(typeof healthData.uptimeSeconds === "number", "Uptime is tracked in seconds");
    assert(Boolean(healthData.database), "Database health is reported");

    // 2. DATABASE ADAPTER
    console.log("\n2. Database Connectivity & Fallback Tests:");
    const dbHealth = await checkDatabaseHealth();
    assert(dbHealth.connected === true, "Database adapter reports connected state");
    assert(["POSTGRESQL", "IN_MEMORY_FILE"].includes(dbHealth.type), "Database type is valid");

    // 3. API ROUTES VERIFICATION
    console.log("\n3. API Endpoints Contract Tests:");
    // Products
    const productsRes = await fetch(`http://127.0.0.1:${TEST_PORT}/api/products`);
    assert(productsRes.status === 200, "GET /api/products returns HTTP 200");
    const productsData = await productsRes.json();
    assert(productsData.success === true && Array.isArray(productsData.products), "Returns products array");

    // Google Merchant Feed
    const feedRes = await fetch(`http://127.0.0.1:${TEST_PORT}/api/feeds/google-merchant.xml`);
    assert(feedRes.status === 200, "GET /api/feeds/google-merchant.xml returns HTTP 200");
    assert(feedRes.headers.get("content-type")?.includes("xml") === true, "Google Feed returns XML content-type");

    // Support Tickets
    const supportRes = await fetch(`http://127.0.0.1:${TEST_PORT}/api/support/tickets`);
    assert(supportRes.status === 200, "GET /api/support/tickets returns HTTP 200");
    const supportData = await supportRes.json();
    assert(supportData.success === true && Array.isArray(supportData.tickets), "Returns support tickets array");

    // 4. CORS & SECURITY HEADERS
    console.log("\n4. Security & CORS Headers Tests:");
    assert(healthRes.headers.get("x-content-type-options") === "nosniff", "X-Content-Type-Options is nosniff");
    assert(healthRes.headers.get("x-frame-options") === "DENY", "X-Frame-Options is DENY");
    assert(healthRes.headers.get("x-xss-protection") === "1; mode=block", "X-XSS-Protection is enabled");

    // 404 handler
    const notFoundRes = await fetch(`http://127.0.0.1:${TEST_PORT}/api/non-existent-endpoint`);
    assert(notFoundRes.status === 404, "Unknown endpoint returns controlled HTTP 404");
  } finally {
    serverInstance!.close();
  }

  // Summary
  console.log("\n=======================================================");
  console.log(`DEPLOYMENT TEST SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log("=======================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runProductionDeploymentTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
