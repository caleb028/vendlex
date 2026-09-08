export type DocumentType =
  | "RECEIPT"
  | "INVOICE"
  | "PAYMENT_CONFIRMATION"
  | "DELIVERY_CONFIRMATION"
  | "REFUND_CONFIRMATION"
  | "WARRANTY"
  | "SELLER_CERTIFICATE"
  | "MERCHANT_CERTIFICATE"
  | "CERTIFICATE"
  | "FINANCIAL_STATEMENT"
  | "SALES_REPORT"
  | "SERVICE_CERTIFICATE"
  | "SERVICE_QUOTE"
  | "BOOKING_CONFIRMATION"
  | "BUSINESS_PROFILE";

export type DocumentStatus =
  | "DRAFT"
  | "ISSUED"
  | "VALID"
  | "REVOKED"
  | "VOID"
  | "SUPERSEDED";

export interface DocumentItem {
  description: string;
  qty: number;
  unitPrice: number;
  total: number;
}

export interface DocumentAuditEntry {
  id: string;
  documentId: string;
  action:
    | "CREATED"
    | "ISSUED"
    | "DOWNLOADED"
    | "VIEWED"
    | "VERIFIED"
    | "REVOKED"
    | "SUPERSEDED"
    | "REGENERATED";
  performedBy: string;
  timestamp: string;
  details?: string;
}

export interface VendLexDocument {
  id: string;
  publicDocumentId: string; // e.g. VLX-REC-2026-000182 or VLX-CERT-2026-000182
  documentType: DocumentType;
  title: string;
  status: DocumentStatus;
  version: number;
  supersededBy?: string;
  revokedAt?: string;
  revocationReason?: string;
  ownerId: string;
  ownerName: string;
  ownerPhone?: string;
  ownerEmail?: string;
  sellerId: string;
  sellerName: string;
  sellerCounty?: string;
  orderId?: string;
  orderNumber?: string;
  serviceId?: string;
  verificationCode: string; // e.g. 8F42-91AC
  fileHash: string; // SHA-256 digest
  issuedAt: string;
  generatedAt: string;
  amount: number;
  currency: string;
  items: DocumentItem[];
  metadata: {
    mpesaReceipt?: string;
    courierTracking?: string;
    deliveryCounty?: string;
    paymentStatus?: string;
    warrantyDuration?: string;
    warrantyExpiry?: string;
    subtotal?: number;
    deliveryFee?: number;
    discount?: number;
    statementPeriod?: string;
    grossSales?: number;
    platformFees?: number;
    netPayout?: number;
    orderCount?: number;
    serviceLocation?: string;
    verifiedCategory?: string;
    planName?: string;
    regNumber?: string;
    nationalId?: string;
    accreditationDate?: string;
    expiryDate?: string;
    signatoryTitle?: string;
    transactionTimestamp?: string;
    notes?: string;
  };
}

export interface DocumentVerificationResult {
  valid: boolean;
  status: DocumentStatus;
  message: string;
  document?: {
    publicDocumentId: string;
    documentType: DocumentType;
    title: string;
    status: DocumentStatus;
    version: number;
    supersededBy?: string;
    revocationReason?: string;
    issuedAt: string;
    issuerName: string;
    orderNumber?: string;
    verificationCode: string;
    fileHash: string;
    amount: number;
    currency: string;
    itemsSummary?: string;
    integrityVerified: boolean;
  };
}
