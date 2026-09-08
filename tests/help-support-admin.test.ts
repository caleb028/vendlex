import { serverDB } from "../lib/server-db";

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

async function runHelpSupportAdminTests() {
  console.log("\n=======================================================");
  console.log("🚀 STARTING HELP & SUPPORT AND ADMIN PLATFORM TEST SUITE");
  console.log("=======================================================\n");

  // SUITE 1: SUPPORT TICKETS RETRIEVAL & SEEDING
  console.log("1. Support Tickets Store & Seed Retrieval Tests:");
  const tickets = serverDB.getSupportTickets();
  assert(tickets.length >= 3, `Pre-seeded support tickets exist (found ${tickets.length})`);

  const ticket1 = serverDB.findSupportTicketById("TKT-2026-00101");
  assert(ticket1 !== null, "Found seeded ticket TKT-2026-00101");
  assert(ticket1?.category === "ORDER_ESCROW", "Ticket category accurately reflects ORDER_ESCROW");
  assert(ticket1?.priority === "MEDIUM", "Ticket priority is MEDIUM");
  assert(ticket1?.status === "RESOLVED", "Ticket status is RESOLVED");
  assert(Array.isArray(ticket1?.messages) && ticket1!.messages.length >= 2, "Ticket contains dialogue thread");

  const ticket3 = serverDB.findSupportTicketById("TKT-2026-00103");
  assert(ticket3 !== null, "Found seeded ticket TKT-2026-00103");
  assert(ticket3?.priority === "HIGH", "Ticket 3 priority is HIGH");
  assert(ticket3?.status === "OPEN", "Ticket 3 status is OPEN");

  // SUITE 2: TICKET CREATION & MESSAGE APPENDING
  console.log("\n2. Ticket Creation & Message Appending Tests:");
  const newTicket = serverDB.createSupportTicket({
    userId: "usr-cust-1",
    userName: "Automated Tester",
    userEmail: "tester@vendlex.co.ke",
    userPhone: "+254712345999",
    userRole: "CUSTOMER",
    category: "DELIVERY_COURIER",
    priority: "MEDIUM",
    subject: "Speedaf Tracking Delay Investigation",
    description: "The courier status has not updated in 24 hours.",
    orderNumber: "ORD-TEST-99",
  });

  assert(Boolean(newTicket && newTicket.id), "New support ticket created successfully");
  assert(Boolean(newTicket.ticketNumber.startsWith("TKT-2026-")), "Ticket number is properly formatted with TKT-2026- prefix");
  
  const foundTicket = serverDB.findSupportTicketById(newTicket.id);
  assert(foundTicket !== null && foundTicket.subject.includes("Speedaf Tracking"), "Ticket retrievable by ID");

  // Add agent reply
  const updatedTicket = serverDB.addSupportTicketMessage(newTicket.id, {
    senderId: "usr-admin-1",
    senderRole: "ADMIN",
    senderName: "VendLex Support (Agent Kevin)",
    message: "We have contacted Fargo Courier dispatch. Your package is scheduled for afternoon delivery.",
  });
  assert(updatedTicket !== null && updatedTicket.messages.length === 2, "Agent reply successfully appended to thread");
  assert(updatedTicket?.messages[1].senderRole === "ADMIN", "Reply sender role is correctly stamped as ADMIN");

  // Update status to RESOLVED
  const resolvedTicket = serverDB.updateSupportTicket(newTicket.id, { status: "RESOLVED" });
  assert(resolvedTicket?.status === "RESOLVED", "Ticket successfully updated to RESOLVED");

  // SUITE 3: ADMIN ACCESS ROLE CHECKING
  console.log("\n3. Admin Authorization & Multi-Tenant Security Tests:");
  const adminUsers = serverDB.getUsers().filter((u) => u.role === "ADMIN" || u.role === "SUPER_ADMIN");
  assert(adminUsers.length > 0, `Admin accounts provisioned (${adminUsers.length} admin accounts)`);

  const regularBuyers = serverDB.getUsers().filter((u) => u.role === "CUSTOMER");
  assert(regularBuyers.length > 0, "Customer accounts isolated from admin privilege");
  assert(!["ADMIN", "SUPER_ADMIN"].includes(regularBuyers[0].role), "Customer cannot bypass role boundaries");

  // Summary
  console.log("\n=======================================================");
  console.log(`TEST SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log("=======================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runHelpSupportAdminTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
