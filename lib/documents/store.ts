import crypto from "crypto";
import {
  VendLexDocument,
  DocumentAuditEntry,
  DocumentType,
  DocumentStatus,
} from "./types";

export function generateSha256(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex");
}

export function generateVerificationCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code1 = "";
  let code2 = "";
  for (let i = 0; i < 4; i++) {
    code1 += chars.charAt(Math.floor(Math.random() * chars.length));
    code2 += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${code1}-${code2}`;
}

// Initial authoritative document records
let DOCUMENTS_DB: VendLexDocument[] = [
  // 1. Customer Order Receipt (ORD-9842)
  {
    id: "doc-rec-101",
    publicDocumentId: "VLX-REC-2026-000182",
    documentType: "RECEIPT",
    title: "Official Order & Escrow Receipt",
    status: "VALID",
    version: 1,
    ownerId: "user-david",
    ownerName: "David Ochieng",
    ownerPhone: "0722 123 456",
    ownerEmail: "david.ochieng@gmail.com",
    sellerId: "biz-tech-hub",
    sellerName: "Nairobi Tech Hub",
    sellerCounty: "Nairobi",
    orderId: "ord-101",
    orderNumber: "ORD-9842",
    verificationCode: "8F42-91AC",
    fileHash: generateSha256("VLX-REC-2026-000182|ORD-9842|David Ochieng|185000"),
    issuedAt: "2026-08-31T14:22:00Z",
    generatedAt: "2026-08-31T14:22:15Z",
    amount: 185000,
    currency: "KSh",
    items: [
      {
        description: "Apple iPhone 15 Pro Max 256GB Titanium",
        qty: 1,
        unitPrice: 185000,
        total: 185000,
      },
    ],
    metadata: {
      mpesaReceipt: "QKH89421A",
      courierTracking: "FARGO-89421",
      deliveryCounty: "Nairobi",
      subtotal: 185000,
      deliveryFee: 0,
      notes: "Payment secured in VendLex Escrow vault. Funds release on parcel verification.",
    },
  },

  // 2. Customer Payment Confirmation (ORD-9842)
  {
    id: "doc-pay-101",
    publicDocumentId: "VLX-PAY-2026-000182",
    documentType: "PAYMENT_CONFIRMATION",
    title: "Safaricom Lipa na M-Pesa Payment Confirmation",
    status: "VALID",
    version: 1,
    ownerId: "user-david",
    ownerName: "David Ochieng",
    ownerPhone: "0722 123 456",
    ownerEmail: "david.ochieng@gmail.com",
    sellerId: "biz-tech-hub",
    sellerName: "Nairobi Tech Hub",
    orderId: "ord-101",
    orderNumber: "ORD-9842",
    verificationCode: "9C14-22KD",
    fileHash: generateSha256("VLX-PAY-2026-000182|QKH89421A|185000"),
    issuedAt: "2026-08-31T14:20:45Z",
    generatedAt: "2026-08-31T14:20:50Z",
    amount: 185000,
    currency: "KSh",
    items: [
      {
        description: "M-Pesa STK Push Settlement (Till 894102)",
        qty: 1,
        unitPrice: 185000,
        total: 185000,
      },
    ],
    metadata: {
      mpesaReceipt: "QKH89421A",
      notes: "Direct Lipa na M-Pesa STK Push verified via Safaricom Daraja 2.0 gateway.",
    },
  },

  // 3. Customer Delivery Confirmation (ORD-9844)
  {
    id: "doc-del-103",
    publicDocumentId: "VLX-DEL-2026-000184",
    documentType: "DELIVERY_CONFIRMATION",
    title: "Nationwide Courier Delivery Confirmation",
    status: "VALID",
    version: 1,
    ownerId: "user-brian",
    ownerName: "Brian Otieno",
    ownerPhone: "0733 111 222",
    sellerId: "biz-tech-hub",
    sellerName: "Nairobi Tech Hub",
    orderId: "ord-103",
    orderNumber: "ORD-9844",
    verificationCode: "7B88-14EF",
    fileHash: generateSha256("VLX-DEL-2026-000184|ORD-9844|FARGO-90112"),
    issuedAt: "2026-09-01T16:45:00Z",
    generatedAt: "2026-09-01T16:45:10Z",
    amount: 68999,
    currency: "KSh",
    items: [
      {
        description: "Sony Bravia 55-inch 4K Google TV",
        qty: 1,
        unitPrice: 68999,
        total: 68999,
      },
    ],
    metadata: {
      courierTracking: "FARGO-90112",
      deliveryCounty: "Mombasa",
      mpesaReceipt: "QKH93144C",
      notes: "Parcel inspected and accepted by recipient in Nyali, Mombasa.",
    },
  },

  // 4. Official Product Warranty Document (iPhone 15 Pro Max)
  {
    id: "doc-war-101",
    publicDocumentId: "VLX-WAR-2026-000182",
    documentType: "WARRANTY",
    title: "Official Limited Hardware Warranty",
    status: "VALID",
    version: 1,
    ownerId: "user-david",
    ownerName: "David Ochieng",
    sellerId: "biz-tech-hub",
    sellerName: "Nairobi Tech Hub",
    orderId: "ord-101",
    orderNumber: "ORD-9842",
    verificationCode: "4E21-77BA",
    fileHash: generateSha256("VLX-WAR-2026-000182|APL-IP15PM-256-NT"),
    issuedAt: "2026-08-31T14:22:00Z",
    generatedAt: "2026-08-31T14:22:15Z",
    amount: 185000,
    currency: "KSh",
    items: [
      {
        description: "Apple iPhone 15 Pro Max (SKU: APL-IP15PM-256-NT)",
        qty: 1,
        unitPrice: 185000,
        total: 185000,
      },
    ],
    metadata: {
      warrantyDuration: "12 Months Official Manufacturer Warranty",
      warrantyExpiry: "August 31, 2027",
      notes: "Covers internal electronic components and manufacturer defects. Excludes liquid or screen impact damage.",
    },
  },

  // 5. Seller Commercial Invoice (B2B Safaricom Hub)
  {
    id: "doc-inv-201",
    publicDocumentId: "VLX-INV-2026-000841",
    documentType: "INVOICE",
    title: "Commercial Tax Invoice",
    status: "VALID",
    version: 1,
    ownerId: "user-corp-saf",
    ownerName: "Safaricom Innovation Hub",
    ownerEmail: "procurement@safaricom.co.ke",
    sellerId: "biz-tech-hub",
    sellerName: "Nairobi Tech Hub",
    sellerCounty: "Nairobi",
    verificationCode: "2A99-55KC",
    fileHash: generateSha256("VLX-INV-2026-000841|669396.52"),
    issuedAt: "2026-08-28T10:00:00Z",
    generatedAt: "2026-08-28T10:05:00Z",
    amount: 669396.52,
    currency: "KSh",
    items: [
      {
        description: "Samsung Galaxy S24 Ultra (512GB Enterprise Units)",
        qty: 2,
        unitPrice: 154999,
        total: 309998,
      },
      {
        description: "MacBook Pro 14 M3 Pro Developer Spec",
        qty: 1,
        unitPrice: 279999,
        total: 279999,
      },
    ],
    metadata: {
      subtotal: 589997,
      discount: 15000,
      notes: "30-Day B2B credit settlement terms with official receipt.",
    },
  },

  // 6. Official Seller Verification Certificate (Nairobi Tech Hub)
  {
    id: "doc-cer-301",
    publicDocumentId: "VLX-CER-2026-000042",
    documentType: "SELLER_CERTIFICATE",
    title: "Official VendLex Verified Merchant Certificate",
    status: "VALID",
    version: 1,
    ownerId: "seller-tech-hub",
    ownerName: "Alex Mwangi",
    sellerId: "biz-tech-hub",
    sellerName: "Nairobi Tech Hub",
    sellerCounty: "Nairobi",
    verificationCode: "1F00-88AA",
    fileHash: generateSha256("VLX-CER-2026-000042|Nairobi Tech Hub|APPROVED"),
    issuedAt: "2026-01-15T09:00:00Z",
    generatedAt: "2026-01-15T09:00:00Z",
    amount: 0,
    currency: "KSh",
    items: [
      {
        description: "VendLex Certified Merchant Authentication (CR12 / County Permit Verified)",
        qty: 1,
        unitPrice: 0,
        total: 0,
      },
    ],
    metadata: {
      verifiedCategory: "Electronics, Phones & Tech",
      notes: "Account verified based on business documentation and 4.9-star merchant performance.",
    },
  },

  // 7. Seller Monthly Financial Statement (Nairobi Tech Hub)
  {
    id: "doc-stm-401",
    publicDocumentId: "VLX-STM-2026-000012",
    documentType: "FINANCIAL_STATEMENT",
    title: "Monthly Merchant Financial Statement (August 2026)",
    status: "VALID",
    version: 1,
    ownerId: "seller-tech-hub",
    ownerName: "Alex Mwangi",
    sellerId: "biz-tech-hub",
    sellerName: "Nairobi Tech Hub",
    sellerCounty: "Nairobi",
    verificationCode: "3D44-90BC",
    fileHash: generateSha256("VLX-STM-2026-000012|253999|August 2026"),
    issuedAt: "2026-09-01T00:00:00Z",
    generatedAt: "2026-09-01T06:00:00Z",
    amount: 253999,
    currency: "KSh",
    items: [
      { description: "Gross Sales Revenue", qty: 2, unitPrice: 126999.5, total: 253999 },
      { description: "VendLex Platform Commission (2.5%)", qty: 1, unitPrice: -6349.97, total: -6349.97 },
      { description: "Courier Logistics Handling", qty: 1, unitPrice: -500, total: -500 },
    ],
    metadata: {
      statementPeriod: "August 1, 2026 – August 31, 2026",
      grossSales: 253999,
      platformFees: 6349.97,
      netPayout: 247149.03,
      orderCount: 2,
    },
  },

  // 8. Service Provider Verification Certificate
  {
    id: "doc-cer-501",
    publicDocumentId: "VLX-CER-2026-000055",
    documentType: "SERVICE_CERTIFICATE",
    title: "Official VendLex Certified Service Provider Certificate",
    status: "VALID",
    version: 1,
    ownerId: "user-flow-masters",
    ownerName: "Peter Kamau",
    sellerId: "biz-flow-masters",
    sellerName: "Nairobi Flow Masters Plumbers",
    sellerCounty: "Nairobi",
    verificationCode: "6B11-44DD",
    fileHash: generateSha256("VLX-CER-2026-000055|Plumbing|APPROVED"),
    issuedAt: "2026-02-10T11:00:00Z",
    generatedAt: "2026-02-10T11:00:00Z",
    amount: 0,
    currency: "KSh",
    items: [
      {
        description: "Verified Master Plumber & Emergency Leak Detection Specialist",
        qty: 1,
        unitPrice: 0,
        total: 0,
      },
    ],
    metadata: {
      verifiedCategory: "Master Plumbing & Sanitary Engineering",
      serviceLocation: "Nairobi County & Kiambu",
    },
  },

  // 9. SUPERSEDED Document (Invoice Version 1)
  {
    id: "doc-inv-old",
    publicDocumentId: "VLX-INV-2026-000180",
    documentType: "INVOICE",
    title: "Commercial Invoice (Superseded Draft)",
    status: "SUPERSEDED",
    version: 1,
    supersededBy: "VLX-INV-2026-000841",
    ownerId: "user-corp-saf",
    ownerName: "Safaricom Innovation Hub",
    sellerId: "biz-tech-hub",
    sellerName: "Nairobi Tech Hub",
    verificationCode: "0A11-22ZZ",
    fileHash: generateSha256("VLX-INV-2026-000180|OLD"),
    issuedAt: "2026-08-27T08:00:00Z",
    generatedAt: "2026-08-27T08:00:00Z",
    amount: 589997,
    currency: "KSh",
    items: [
      { description: "MacBook Pro & Phones Initial Draft", qty: 1, unitPrice: 589997, total: 589997 },
    ],
    metadata: {
      notes: "Superseded by amended invoice VLX-INV-2026-000841 with corporate discount applied.",
    },
  },

  // 10. REVOKED Document (Disputed Order Receipt)
  {
    id: "doc-rec-revoked",
    publicDocumentId: "VLX-REC-2026-000170",
    documentType: "RECEIPT",
    title: "Order Receipt (Revoked Following Dispute)",
    status: "REVOKED",
    version: 1,
    revokedAt: "2026-08-20T16:00:00Z",
    revocationReason: "Transaction cancelled and refunded via Daraja M-Pesa B2C dispute reversal #DISP-9481.",
    ownerId: "user-dispute",
    ownerName: "Kevin Mutua",
    sellerId: "biz-other",
    sellerName: "Savanna Fashion House",
    verificationCode: "9F99-00XX",
    fileHash: generateSha256("VLX-REC-2026-000170|REVOKED"),
    issuedAt: "2026-08-18T10:00:00Z",
    generatedAt: "2026-08-18T10:00:00Z",
    amount: 4850,
    currency: "KSh",
    items: [
      { description: "Handmade Savannah Kitenge Dress", qty: 1, unitPrice: 4850, total: 4850 },
    ],
    metadata: {
      notes: "Full refund reversed to customer M-Pesa line.",
    },
  },
];

// Audit trail store
let AUDIT_LOGS: DocumentAuditEntry[] = [
  {
    id: "aud-1",
    documentId: "VLX-REC-2026-000182",
    action: "ISSUED",
    performedBy: "SYSTEM_ESCROW_ENGINE",
    timestamp: "2026-08-31T14:22:15Z",
    details: "Order receipt issued following confirmed Lipa na M-Pesa payment QKH89421A",
  },
  {
    id: "aud-2",
    documentId: "VLX-INV-2026-000180",
    action: "SUPERSEDED",
    performedBy: "Alex Mwangi (Seller)",
    timestamp: "2026-08-28T10:05:00Z",
    details: "Superseded by updated corporate invoice VLX-INV-2026-000841",
  },
  {
    id: "aud-3",
    documentId: "VLX-REC-2026-000170",
    action: "REVOKED",
    performedBy: "ADMIN_COMPLIANCE",
    timestamp: "2026-08-20T16:00:00Z",
    details: "Revoked following dispute #DISP-9481 resolution and 100% refund",
  },
];

export class DocumentStore {
  static getAll(): VendLexDocument[] {
    return DOCUMENTS_DB;
  }

  static findById(id: string): VendLexDocument | null {
    const clean = id.trim();
    return (
      DOCUMENTS_DB.find(
        (d) => d.id === clean || d.publicDocumentId.toUpperCase() === clean.toUpperCase()
      ) || null
    );
  }

  static findByPublicId(publicDocumentId: string): VendLexDocument | null {
    const clean = publicDocumentId.toUpperCase().trim();
    return DOCUMENTS_DB.find((d) => d.publicDocumentId === clean) || null;
  }

  static listByOwner(ownerId: string): VendLexDocument[] {
    return DOCUMENTS_DB.filter((d) => d.ownerId === ownerId);
  }

  static listBySeller(sellerNameOrId: string): VendLexDocument[] {
    const clean = sellerNameOrId.toLowerCase().trim();
    return DOCUMENTS_DB.filter(
      (d) =>
        d.sellerId.toLowerCase().includes(clean) ||
        d.sellerName.toLowerCase().includes(clean)
    );
  }

  static addDocument(doc: VendLexDocument, performedBy: string): VendLexDocument {
    DOCUMENTS_DB.unshift(doc);
    this.logAudit({
      documentId: doc.publicDocumentId,
      action: "CREATED",
      performedBy,
      details: `Generated new document ${doc.publicDocumentId} (${doc.title})`,
    });
    return doc;
  }

  static revoke(
    publicDocumentId: string,
    reason: string,
    adminName: string
  ): { success: boolean; document?: VendLexDocument; error?: string } {
    const doc = this.findByPublicId(publicDocumentId);
    if (!doc) {
      return { success: false, error: `Document '${publicDocumentId}' not found.` };
    }

    doc.status = "REVOKED";
    doc.revokedAt = new Date().toISOString();
    doc.revocationReason = reason;

    this.logAudit({
      documentId: doc.publicDocumentId,
      action: "REVOKED",
      performedBy: adminName,
      details: `Revoked: ${reason}`,
    });

    return { success: true, document: doc };
  }

  static supersede(
    oldPublicId: string,
    newDocData: Partial<VendLexDocument>,
    performedBy: string
  ): { success: boolean; newDoc?: VendLexDocument; error?: string } {
    const oldDoc = this.findByPublicId(oldPublicId);
    if (!oldDoc) {
      return { success: false, error: `Document '${oldPublicId}' not found.` };
    }

    const nextIdNum = Math.floor(100000 + Math.random() * 900000);
    const newPublicId = `VLX-${oldDoc.documentType.slice(0, 3)}-2026-${nextIdNum}`;

    const newDoc: VendLexDocument = {
      ...oldDoc,
      ...newDocData,
      id: `doc-${Date.now()}`,
      publicDocumentId: newPublicId,
      version: oldDoc.version + 1,
      status: "VALID",
      issuedAt: new Date().toISOString(),
      generatedAt: new Date().toISOString(),
      verificationCode: generateVerificationCode(),
      fileHash: generateSha256(`${newPublicId}|v${oldDoc.version + 1}`),
    };

    oldDoc.status = "SUPERSEDED";
    oldDoc.supersededBy = newPublicId;

    DOCUMENTS_DB.unshift(newDoc);

    this.logAudit({
      documentId: oldDoc.publicDocumentId,
      action: "SUPERSEDED",
      performedBy,
      details: `Superseded by Version ${newDoc.version} (${newPublicId})`,
    });

    this.logAudit({
      documentId: newDoc.publicDocumentId,
      action: "ISSUED",
      performedBy,
      details: `Issued as Version ${newDoc.version} replacing ${oldDoc.publicDocumentId}`,
    });

    return { success: true, newDoc };
  }

  static logAudit(entry: {
    documentId: string;
    action: DocumentAuditEntry["action"];
    performedBy: string;
    details?: string;
  }) {
    AUDIT_LOGS.unshift({
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      documentId: entry.documentId,
      action: entry.action,
      performedBy: entry.performedBy,
      timestamp: new Date().toISOString(),
      details: entry.details,
    });
  }

  static getAuditLogs(documentId?: string): DocumentAuditEntry[] {
    if (documentId) {
      const clean = documentId.toUpperCase().trim();
      return AUDIT_LOGS.filter((a) => a.documentId.toUpperCase() === clean);
    }
    return AUDIT_LOGS;
  }
}
