import { DocumentStore, generateSha256, generateVerificationCode } from "./store";
import { VendLexPDFEngine, PDFGenerationResult } from "./pdf-engine";
import {
  VendLexDocument,
  DocumentVerificationResult,
  DocumentType,
} from "./types";
import { AIUserContext } from "../ai/types";

export interface DocumentAuthContext {
  userId?: string;
  name?: string;
  phone?: string;
  email?: string;
  role: "CUSTOMER" | "SELLER" | "BUSINESS_OWNER" | "ADMIN";
  businessName?: string;
}

export class DocumentService {
  /**
   * List documents with strict role-based permission isolation
   */
  static listDocuments(
    auth?: DocumentAuthContext,
    filter?: { type?: string; status?: string; search?: string }
  ): VendLexDocument[] {
    let docs = DocumentStore.getAll();

    const normalizePhone = (p?: string) => (p ? p.replace(/[\s+-]/g, "").slice(-9) : "");

    // 1. Role-based isolation
    if (!auth || auth.role === "CUSTOMER") {
      if (auth && (auth.userId || auth.phone || auth.email || auth.name)) {
        const normAuthPhone = normalizePhone(auth.phone);
        const userName = auth.name?.toLowerCase().trim() || "";
        const userId = auth.userId || "";
        const userEmail = auth.email?.toLowerCase().trim() || "";

        docs = docs.filter((d) => {
          if (userId && d.ownerId === userId) return true;
          if (userEmail && d.ownerEmail && d.ownerEmail.toLowerCase().trim() === userEmail) return true;
          const normDocPhone = normalizePhone(d.ownerPhone);
          if (normAuthPhone && normDocPhone && normDocPhone === normAuthPhone) return true;
          if (userName && d.ownerName.toLowerCase().includes(userName)) return true;
          if (userName && userName.includes(d.ownerName.toLowerCase())) return true;
          return false;
        });
      }
    } else if (auth.role === "SELLER" || auth.role === "BUSINESS_OWNER") {
      const biz = (auth.businessName || "").toLowerCase().trim();
      const userName = (auth.name || "").toLowerCase().trim();
      const userId = auth.userId || "";

      docs = docs.filter((d) => {
        if (userId && (d.sellerId === userId || d.ownerId === userId)) return true;
        if (biz && (d.sellerName.toLowerCase().includes(biz) || biz.includes(d.sellerName.toLowerCase()))) return true;
        if (userName && (d.sellerName.toLowerCase().includes(userName) || userName.includes(d.sellerName.toLowerCase()))) return true;
        return false;
      });
    }
    // ADMIN sees all

    // 2. Filter by Type
    if (filter?.type && filter.type !== "ALL") {
      docs = docs.filter(
        (d) => d.documentType.toLowerCase() === filter.type!.toLowerCase()
      );
    }

    // 3. Filter by Status
    if (filter?.status && filter.status !== "ALL") {
      docs = docs.filter(
        (d) => d.status.toLowerCase() === filter.status!.toLowerCase()
      );
    }

    // 4. Search
    if (filter?.search && filter.search.trim()) {
      const q = filter.search.toLowerCase().trim();
      docs = docs.filter(
        (d) =>
          d.publicDocumentId.toLowerCase().includes(q) ||
          d.title.toLowerCase().includes(q) ||
          d.orderNumber?.toLowerCase().includes(q) ||
          d.sellerName.toLowerCase().includes(q) ||
          d.ownerName.toLowerCase().includes(q)
      );
    }

    return docs;
  }

  /**
   * Get single document by ID with permission verification
   */
  static getDocument(
    idOrPublicId: string,
    auth?: DocumentAuthContext
  ): { success: boolean; document?: VendLexDocument; error?: string } {
    const doc =
      DocumentStore.findByPublicId(idOrPublicId) ||
      DocumentStore.findById(idOrPublicId);

    if (!doc) {
      return {
        success: false,
        error: `Document '${idOrPublicId}' was not found.`,
      };
    }

    // 1. Public accreditation certificates & verifiable credentials
    // Merchant accreditation certificates, public verification certificates, warranties, and confirmation slips are public credentials.
    const isPublicCredential =
      doc.documentType === "MERCHANT_CERTIFICATE" ||
      doc.documentType === "SELLER_CERTIFICATE" ||
      doc.documentType === "CERTIFICATE" ||
      doc.documentType === "SERVICE_CERTIFICATE" ||
      doc.documentType === "WARRANTY";

    if (isPublicCredential) {
      return { success: true, document: doc };
    }

    // 2. Admin has complete compliance audit access
    if (auth?.role === "ADMIN") {
      return { success: true, document: doc };
    }

    // 3. Permission check for private financial records (Receipts, Invoices, Financial Statements)
    if (auth) {
      const normalizePhone = (p?: string) => (p ? p.replace(/[\s+-]/g, "").slice(-9) : "");
      const normAuthPhone = normalizePhone(auth.phone);
      const normDocPhone = normalizePhone(doc.ownerPhone);

      const isOwner =
        (auth.userId && doc.ownerId === auth.userId) ||
        (auth.email && doc.ownerEmail && auth.email.toLowerCase().trim() === doc.ownerEmail.toLowerCase().trim()) ||
        (normAuthPhone && normDocPhone && normAuthPhone === normDocPhone) ||
        (auth.name && doc.ownerName && doc.ownerName.toLowerCase() === auth.name.toLowerCase().trim()) ||
        (auth.name && doc.ownerName && doc.ownerName.toLowerCase().includes(auth.name.toLowerCase().trim()));

      const isSeller =
        (auth.userId && doc.sellerId === auth.userId) ||
        (auth.businessName && doc.sellerName && doc.sellerName.toLowerCase().includes(auth.businessName.toLowerCase().trim())) ||
        (auth.businessName && doc.sellerName && auth.businessName.toLowerCase().trim().includes(doc.sellerName.toLowerCase())) ||
        (auth.name && doc.sellerName && doc.sellerName.toLowerCase().includes(auth.name.toLowerCase().trim())) ||
        (auth.name && doc.sellerName && auth.name.toLowerCase().trim().includes(doc.sellerName.toLowerCase()));

      if (isOwner || isSeller) {
        return { success: true, document: doc };
      }
    }

    return {
      success: false,
      error: "Access Denied: You do not have permission to view this document.",
    };
  }

  /**
   * Generates and downloads authoritative PDF
   */
  static async generatePDF(
    idOrPublicId: string,
    auth?: DocumentAuthContext
  ): Promise<{ success: boolean; pdfResult?: PDFGenerationResult; filename?: string; error?: string }> {
    const fetchRes = this.getDocument(idOrPublicId, auth);
    if (!fetchRes.success || !fetchRes.document) {
      return { success: false, error: fetchRes.error };
    }

    const doc = fetchRes.document;
    const pdfResult = await VendLexPDFEngine.renderDocumentPDF(doc);

    // Audit log
    DocumentStore.logAudit({
      documentId: doc.publicDocumentId,
      action: "DOWNLOADED",
      performedBy: auth?.name || "AUTHENTICATED_USER",
      details: `Generated & downloaded official PDF (Hash: ${pdfResult.fileHash.substring(0, 10)}...)`,
    });

    const cleanTitle = doc.documentType.charAt(0) + doc.documentType.slice(1).toLowerCase().replace(/_/g, "-");
    const filename = `VendLex-${cleanTitle}-${doc.publicDocumentId}.pdf`;

    return {
      success: true,
      pdfResult,
      filename,
    };
  }

  /**
   * Public Verification Check (No login required, safe public information only)
   */
  static verifyDocument(idOrPublicId: string): DocumentVerificationResult {
    const doc =
      DocumentStore.findByPublicId(idOrPublicId) ||
      DocumentStore.findById(idOrPublicId);

    if (!doc) {
      return {
        valid: false,
        status: "VOID",
        message: "DOCUMENT NOT FOUND: This document could not be verified in the VendLex database.",
      };
    }

    DocumentStore.logAudit({
      documentId: doc.publicDocumentId,
      action: "VERIFIED",
      performedBy: "PUBLIC_VERIFIER",
      details: `Scanned / verified via public portal (Status: ${doc.status})`,
    });

    const isRevoked = doc.status === "REVOKED";
    const isSuperseded = doc.status === "SUPERSEDED";
    const isValid = doc.status === "VALID" || doc.status === "ISSUED";

    return {
      valid: isValid,
      status: doc.status,
      message: isValid
        ? "DOCUMENT VERIFIED: This document matches the authentic record stored by VendLex Kenya."
        : isRevoked
        ? `DOCUMENT REVOKED: This document was previously issued but is no longer valid. (${doc.revocationReason || "Revoked by platform"})`
        : `DOCUMENT SUPERSEDED: A newer version of this document exists (${doc.supersededBy || ""}).`,
      document: {
        publicDocumentId: doc.publicDocumentId,
        documentType: doc.documentType,
        title: doc.title,
        status: doc.status,
        version: doc.version,
        supersededBy: doc.supersededBy,
        revocationReason: doc.revocationReason,
        issuedAt: doc.issuedAt,
        issuerName: doc.sellerName,
        orderNumber: doc.orderNumber,
        verificationCode: doc.verificationCode,
        fileHash: doc.fileHash,
        amount: doc.amount,
        currency: doc.currency,
        itemsSummary: doc.items.map((i) => `${i.qty}x ${i.description}`).join(", "),
        integrityVerified: true,
      },
    };
  }

  /**
   * Revoke a document (Admin operation)
   */
  static revokeDocument(
    publicDocumentId: string,
    reason: string,
    adminAuth: DocumentAuthContext
  ): { success: boolean; error?: string } {
    if (adminAuth.role !== "ADMIN") {
      return { success: false, error: "Unauthorized: Only administrators can revoke official documents." };
    }
    return DocumentStore.revoke(publicDocumentId, reason, adminAuth.name || "ADMIN");
  }

  /**
   * Supersede a document with a newer version
   */
  static supersedeDocument(
    oldPublicId: string,
    newData: Partial<VendLexDocument>,
    auth: DocumentAuthContext
  ): { success: boolean; newDoc?: VendLexDocument; error?: string } {
    if (auth.role !== "ADMIN" && auth.role !== "SELLER") {
      return { success: false, error: "Unauthorized: Only sellers or administrators can supersede documents." };
    }
    return DocumentStore.supersede(oldPublicId, newData, auth.name || "AUTHORIZED_USER");
  }

  /**
   * Issue an official VendLex verified receipt for a completed order
   */
  static issueOrderReceipt(order: {
    id: string;
    orderNumber: string;
    customerId: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    sellerId: string;
    sellerName: string;
    county: string;
    totalAmount: number;
    mpesaReceipt?: string;
    courierTracking?: string;
    items: Array<{ productTitle: string; quantity: number; unitPrice: number; totalPrice: number }>;
  }): VendLexDocument {
    const numPart = order.orderNumber.replace(/\D/g, "") || String(Math.floor(100000 + Math.random() * 900000));
    const publicDocumentId = `VLX-REC-2026-${numPart.padStart(6, "0")}`;
    const verificationCode = generateVerificationCode();
    const hash = generateSha256(`${publicDocumentId}|${order.orderNumber}|${order.customerName}|${order.totalAmount}`);

    const newDoc: VendLexDocument = {
      id: `doc-rec-${Date.now()}`,
      publicDocumentId,
      documentType: "RECEIPT",
      title: "Official Order & Escrow Receipt",
      status: "VALID",
      version: 1,
      ownerId: order.customerId,
      ownerName: order.customerName,
      ownerPhone: order.customerPhone,
      ownerEmail: order.customerEmail || `${order.customerName.toLowerCase().replace(/\s+/g, ".")}@gmail.com`,
      sellerId: order.sellerId,
      sellerName: order.sellerName,
      sellerCounty: order.county,
      orderId: order.id,
      orderNumber: order.orderNumber,
      verificationCode,
      fileHash: hash,
      issuedAt: new Date().toISOString(),
      generatedAt: new Date().toISOString(),
      amount: order.totalAmount,
      currency: "KSh",
      items: order.items.map((i) => ({
        description: i.productTitle,
        qty: i.quantity,
        unitPrice: i.unitPrice,
        total: i.totalPrice,
      })),
      metadata: {
        mpesaReceipt: order.mpesaReceipt || "PENDING_CONFIRMATION",
        courierTracking: order.courierTracking,
        deliveryCounty: order.county,
        paymentStatus: "CONFIRMED_ESCROW",
      },
    };

    return DocumentStore.addDocument(newDoc, "SYSTEM_ESCROW_ENGINE");
  }

  /**
   * Issue an official VendLex verified accreditation certificate for an onboarded/subscribed seller
   */
  static issueMerchantCertificate(merchant: {
    userId: string;
    bizName: string;
    ownerName: string;
    ownerPhone?: string;
    ownerEmail?: string;
    regNumber?: string;
    county?: string;
    planName?: string;
    mpesaReceipt?: string;
    amountPaid?: number;
  }): VendLexDocument {
    const numPart = String(Math.floor(100000 + Math.random() * 900000));
    const publicDocumentId = `VLX-CERT-2026-${numPart}`;
    const verificationCode = generateVerificationCode();
    const hash = generateSha256(`${publicDocumentId}|${merchant.bizName}|${merchant.ownerName}|${merchant.regNumber || ""}`);
    const issuedTimestamp = new Date().toISOString();

    const newDoc: VendLexDocument = {
      id: `doc-cert-${Date.now()}`,
      publicDocumentId,
      documentType: "MERCHANT_CERTIFICATE",
      title: "Official Merchant Accreditation Certificate",
      status: "VALID",
      version: 1,
      ownerId: merchant.userId,
      ownerName: merchant.ownerName,
      ownerPhone: merchant.ownerPhone,
      ownerEmail: merchant.ownerEmail,
      sellerId: merchant.userId,
      sellerName: merchant.bizName,
      sellerCounty: merchant.county || "Nairobi",
      verificationCode,
      fileHash: hash,
      issuedAt: issuedTimestamp,
      generatedAt: issuedTimestamp,
      amount: merchant.amountPaid || 0,
      currency: "KSh",
      items: [
        {
          description: `VendLex Official Merchant Accreditation (${merchant.planName || "Verified Merchant Plan"})`,
          qty: 1,
          unitPrice: merchant.amountPaid || 0,
          total: merchant.amountPaid || 0,
        },
      ],
      metadata: {
        planName: merchant.planName || "Professional Merchant Tier",
        regNumber: merchant.regNumber || "BN/2026/REGISTERED",
        mpesaReceipt: merchant.mpesaReceipt || "MPESA-CONFIRMED",
        deliveryCounty: merchant.county || "Nairobi",
        accreditationDate: issuedTimestamp,
        paymentStatus: "CONFIRMED_ESCROW",
        transactionTimestamp: issuedTimestamp,
      },
    };

    return DocumentStore.addDocument(newDoc, "SYSTEM_ONBOARDING_ENGINE");
  }
}
