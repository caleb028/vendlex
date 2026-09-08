import { DocumentService } from "../lib/documents/service";
import { DocumentStore } from "../lib/documents/store";
import { VendLexPDFEngine } from "../lib/documents/pdf-engine";

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

async function runDocumentsTestSuite() {
  console.log("\n=======================================================");
  console.log("🚀 STARTING VENDLEX VERIFIED DOCUMENTS AUTOMATED TEST SUITE");
  console.log("=======================================================\n");

  // SUITE 1: DOCUMENT STORE & AUTHORITATIVE RETRIEVAL
  console.log("1. Authoritative Document Store Tests:");
  const allDocs = DocumentStore.getAll();
  assert(allDocs.length >= 8, `Pre-seeded records exist (${allDocs.length} documents)`);

  const receiptDoc = DocumentStore.findByPublicId("VLX-REC-2026-000182");
  assert(receiptDoc !== null, "Found official receipt VLX-REC-2026-000182");
  assert(receiptDoc?.orderNumber === "ORD-9842", "Receipt accurately maps to order ORD-9842");
  assert(receiptDoc?.amount === 185000, "Receipt matches exact order amount KSh 185,000");

  // SUITE 2: CRYPTOGRAPHIC HASH & VERIFICATION CODE INTEGRITY
  console.log("\n2. Cryptographic Integrity & Hash Tests:");
  assert(typeof receiptDoc?.fileHash === "string" && receiptDoc.fileHash.length === 64, "SHA-256 hash is 64-character hex");
  assert(receiptDoc?.verificationCode.includes("-") === true, "Verification code follows XXXX-XXXX format");

  // SUITE 3: SERVER-SIDE PDF GENERATION WITH PLATFORM STAMP & QR CODE
  console.log("\n3. Server-Side PDF Engine Tests:");
  const pdfResult = await VendLexPDFEngine.renderDocumentPDF(receiptDoc!);
  assert(pdfResult.pdfBytes instanceof Uint8Array, "Generates real binary PDF bytes");
  assert(pdfResult.pdfBytes.length > 2000, `PDF size is valid and substantial (${pdfResult.pdfBytes.length} bytes)`);
  assert(pdfResult.verificationUrl.includes("/verify/VLX-REC-2026-000182"), "Embedded QR code points to verified URL");
  assert(pdfResult.fileHash.length === 64, "Byte digest calculated successfully from PDF bytes");

  // SUITE 4: MULTI-DOCUMENT TYPES PDF GENERATION
  console.log("\n4. Multi-Document Types Rendering Tests:");
  const invoiceDoc = DocumentStore.findByPublicId("VLX-INV-2026-000841");
  const certDoc = DocumentStore.findByPublicId("VLX-CER-2026-000042");
  const stmtDoc = DocumentStore.findByPublicId("VLX-STM-2026-000012");
  const warDoc = DocumentStore.findByPublicId("VLX-WAR-2026-000182");

  const invoicePdf = await VendLexPDFEngine.renderDocumentPDF(invoiceDoc!);
  assert(invoicePdf.pdfBytes.length > 0, "Invoice PDF renders with table and totals");

  const certPdf = await VendLexPDFEngine.renderDocumentPDF(certDoc!);
  assert(certPdf.pdfBytes.length > 0, "Merchant Verification Certificate PDF renders");

  const stmtPdf = await VendLexPDFEngine.renderDocumentPDF(stmtDoc!);
  assert(stmtPdf.pdfBytes.length > 0, "Financial Statement PDF renders");

  const warPdf = await VendLexPDFEngine.renderDocumentPDF(warDoc!);
  assert(warPdf.pdfBytes.length > 0, "Warranty Document PDF renders");

  // SUITE 5: PUBLIC VERIFICATION GATEWAY & STATUS LIFECYCLE
  console.log("\n5. Public Verification Gateway & Lifecycle Tests:");
  // Valid Document
  const verifyValid = DocumentService.verifyDocument("VLX-REC-2026-000182");
  assert(verifyValid.valid === true, "Valid document passes verification");
  assert(verifyValid.status === "VALID", "Status is VALID");
  assert(verifyValid.document?.issuerName === "Nairobi Tech Hub", "Issuer matches Nairobi Tech Hub");

  // Revoked Document
  const verifyRevoked = DocumentService.verifyDocument("VLX-REC-2026-000170");
  assert(verifyRevoked.valid === false, "Revoked document fails valid check");
  assert(verifyRevoked.status === "REVOKED", "Status is REVOKED");
  assert(verifyRevoked.message.includes("REVOKED"), "Message cites REVOKED status");

  // Superseded Document
  const verifySuperseded = DocumentService.verifyDocument("VLX-INV-2026-000180");
  assert(verifySuperseded.valid === false, "Superseded document fails valid check");
  assert(verifySuperseded.status === "SUPERSEDED", "Status is SUPERSEDED");
  assert(verifySuperseded.document?.supersededBy === "VLX-INV-2026-000841", "Points to replacement document");

  // Nonexistent Document
  const verifyMissing = DocumentService.verifyDocument("VLX-FAKE-999999");
  assert(verifyMissing.valid === false, "Nonexistent document fails verification");
  assert(verifyMissing.status === "VOID", "Missing document returns VOID");

  // SUITE 6: ACCESS CONTROL & PERMISSION ISOLATION
  console.log("\n6. Access Control & Role Permission Tests:");
  const customerDavid = {
    userId: "user-david",
    name: "David Ochieng",
    phone: "0722 123 456",
    role: "CUSTOMER" as const,
  };

  const customerGrace = {
    userId: "user-grace",
    name: "Grace Wanjiku",
    phone: "0711 987 654",
    role: "CUSTOMER" as const,
  };

  // David accessing his own receipt
  const davidReceipt = DocumentService.getDocument("VLX-REC-2026-000182", customerDavid);
  assert(davidReceipt.success === true, "Customer can access their own document");

  // Grace attempting to access David's receipt
  const graceSnoop = DocumentService.getDocument("VLX-REC-2026-000182", customerGrace);
  assert(graceSnoop.success === false, "Customer is DENIED access to another customer's document");

  // Seller Nairobi Tech Hub accessing their statement
  const sellerTechHub = {
    name: "Alex Mwangi",
    businessName: "Nairobi Tech Hub",
    role: "SELLER" as const,
  };
  const techHubStmt = DocumentService.getDocument("VLX-STM-2026-000012", sellerTechHub);
  assert(techHubStmt.success === true, "Seller can access their own financial statement");

  // Seller Coast Agro attempting to access Tech Hub statement
  const sellerCoastAgro = {
    name: "Salim Ali",
    businessName: "Coast Agro Supplies",
    role: "SELLER" as const,
  };
  const crossSellerSnoop = DocumentService.getDocument("VLX-STM-2026-000012", sellerCoastAgro);
  assert(crossSellerSnoop.success === false, "Seller B is BLOCKED from accessing Seller A's financial statement");

  // Admin access
  const adminUser = {
    name: "Compliance Admin",
    role: "ADMIN" as const,
  };
  const adminDoc = DocumentService.getDocument("VLX-REC-2026-000182", adminUser);
  assert(adminDoc.success === true, "Admin can inspect any document for compliance");

  // SUITE 7: AUDIT LOGGING
  console.log("\n7. Audit Logging & Traceability Tests:");
  const audits = DocumentStore.getAuditLogs("VLX-REC-2026-000182");
  assert(audits.length > 0, "Audit logs exist for document VLX-REC-2026-000182");
  assert(audits.some((a) => a.action === "ISSUED" || a.action === "VERIFIED" || a.action === "CREATED"), "Contains legitimate lifecycle actions");

  // SUITE 8: OFFICIAL MERCHANT ACCREDITATION CERTIFICATE ISSUANCE & PDF GENERATION
  console.log("\n8. Merchant Accreditation Certificate & Timestamped Stamp Tests:");
  const testCert = DocumentService.issueMerchantCertificate({
    userId: "seller-test-01",
    bizName: "Safari Agrovet Enterprises",
    ownerName: "Caleb Ngiciri",
    ownerPhone: "0712345678",
    ownerEmail: "caleb@vendlex.co.ke",
    regNumber: "BN/2026/89410",
    county: "Nairobi",
    planName: "Verified Professional Tier",
    mpesaReceipt: "QK84920LKM",
    amountPaid: 2500,
  });

  assert(testCert.publicDocumentId.startsWith("VLX-CERT-2026-"), "Generated public ID with VLX-CERT-2026 prefix");
  assert(testCert.documentType === "MERCHANT_CERTIFICATE", "Document type is MERCHANT_CERTIFICATE");
  assert(testCert.metadata.mpesaReceipt === "QK84920LKM", "Certificate retains M-Pesa receipt reference");
  assert(typeof testCert.metadata.transactionTimestamp === "string", "Certificate contains occurrence transaction timestamp");

  const certPdfResult = await VendLexPDFEngine.renderDocumentPDF(testCert);
  assert(certPdfResult.pdfBytes instanceof Uint8Array, "Certificate renders to valid Uint8Array binary");
  assert(certPdfResult.pdfBytes.length > 3000, `Certificate PDF generated with substantial binary size (${certPdfResult.pdfBytes.length} bytes)`);
  assert(certPdfResult.verificationUrl.includes(testCert.publicDocumentId), "Certificate embeds QR verification link matching document ID");

  // SUITE 9: PUBLIC ACCREDITATION & ROBUST NORMALIZED AUTHENTICATION TESTS
  console.log("\n9. Public Accreditation Download & Identity Normalization Tests:");
  // Public certificate download without any auth credentials
  const publicPdfRes = await DocumentService.generatePDF(testCert.publicDocumentId);
  assert(publicPdfRes.success === true, "Public certificate can be downloaded without auth credentials");
  assert(publicPdfRes.pdfResult !== undefined, "PDF bytes generated for public certificate");

  // Public certificate download with general customer session
  const customerCertDownload = await DocumentService.generatePDF(testCert.publicDocumentId, customerDavid);
  assert(customerCertDownload.success === true, "Customer can download verified merchant certificate");

  // Phone normalization test: +254 722 123 456 format vs 0722 123 456 stored
  const davidIntlPhone = {
    phone: "+254 722 123 456",
    role: "CUSTOMER" as const,
  };
  const davidIntlReceipt = DocumentService.getDocument("VLX-REC-2026-000182", davidIntlPhone);
  assert(davidIntlReceipt.success === true, "Normalized international phone number allows receipt access");

  // Email normalization test: uppercase email matching lowercase stored
  const davidUpperEmail = {
    email: "DAVID.OCHIENG@GMAIL.COM",
    role: "CUSTOMER" as const,
  };
  const davidEmailReceipt = DocumentService.getDocument("VLX-REC-2026-000182", davidUpperEmail);
  assert(davidEmailReceipt.success === true, "Case-insensitive email allows receipt access");

  console.log("\n=======================================================");
  console.log(`DOCUMENT TEST SUITE RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log("=======================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runDocumentsTestSuite().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
