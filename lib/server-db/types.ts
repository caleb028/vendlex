import { Product, Service, Business } from "@/lib/data/kenya-data";
import { AttributionData } from "@/lib/marketing/types";

export * from "@/lib/marketing/types";

export type UserRole = "CUSTOMER" | "SELLER" | "BUSINESS_OWNER" | "SERVICE_PROVIDER" | "ADMIN" | "SUPER_ADMIN";

export type UserStatus = "ACTIVE" | "SUSPENDED" | "DISABLED" | "PENDING";

export interface ServerUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  passwordHash: string;
  salt: string;
  avatar: string;
  businessId?: string;
  businessSlug?: string;
  businessName?: string;
  isVerified: boolean;
  // Login lockout
  loginAttempts?: number;
  lockedUntil?: number; // unix ms timestamp
  // Email verification
  emailVerificationToken?: string;
  emailVerificationExpiry?: number; // unix ms timestamp
  // Password reset
  passwordResetToken?: string;  // stores the SHA-256 hash of the raw token
  passwordResetExpiry?: number; // unix ms timestamp
  createdAt: string;
  updatedAt: string;
}

export interface ServerSession {
  token: string;
  userId: string;
  role: UserRole;
  expiresAt: number; // unix timestamp in ms
  createdAt: string;
  rememberMe?: boolean;
  userAgent?: string;
  ipAddress?: string;
  lastActivityAt?: string;
}

export interface ServerOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  county: string;
  town: string;
  estate: string;
  deliveryNotes?: string;
  items: Array<{
    productId: string;
    productTitle: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    sellerId: string;
    sellerName: string;
    image: string;
  }>;
  sellerId: string;
  sellerName: string;
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: "MPESA" | "CARD" | "COD";
  paymentStatus: "UNPAID" | "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  mpesaReceipt?: string;
  checkoutRequestId?: string;
  status: "PENDING_PAYMENT" | "PAID" | "PROCESSING" | "READY_FOR_DISPATCH" | "DISPATCHED" | "DELIVERED" | "CANCELLED";
  courierTracking?: string;
  documentId?: string; // Links to verified document receipt
  attribution?: AttributionData;
  createdAt: string;
  updatedAt: string;
}

export interface ServerReview {
  id: string;
  productId: string;
  orderId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1 - 5
  title: string;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

export interface ServerServiceRequest {
  id: string;
  serviceId: string;
  serviceTitle: string;
  providerId: string;
  providerName: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  county: string;
  town: string;
  requestType: "book" | "quote";
  scheduledDate?: string;
  quoteAmount?: number;
  notes: string;
  status: "PENDING" | "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
}

export interface ServerNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "ORDER" | "PAYMENT" | "SECURITY" | "PROMOTION" | "SYSTEM";
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ServerAuditLog {
  id: string;
  userId?: string;
  userRole?: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress?: string;
  details: string;
  status: "SUCCESS" | "DENIED" | "FAILED";
  timestamp: string;
}

export interface ServerDispute {
  id: string;
  orderNumber: string;
  orderId?: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  sellerId: string;
  sellerName: string;
  amount: number;
  mpesaReceipt?: string;
  reason: string;
  description: string;
  status: "PENDING_REVIEW" | "INVESTIGATING" | "RESOLVED" | "REFUNDED";
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServerKYC {
  id: string;
  userId: string;
  bizName: string;
  ownerName: string;
  regNumber: string;
  nationalId: string;
  county: string;
  town?: string;
  docUrl: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewNotes?: string;
  submittedDate: string;
  reviewedDate?: string;
}

export interface ServerSupportMessage {
  id: string;
  senderId?: string;
  senderName: string;
  senderRole: "CUSTOMER" | "SELLER" | "ADMIN" | "SYSTEM" | "GUEST";
  message: string;
  timestamp: string;
}

export type SupportCategory =
  | "ORDER_ESCROW"
  | "PAYMENT_MPESA"
  | "SELLER_STORE"
  | "DELIVERY_COURIER"
  | "SERVICES_DIRECTORY"
  | "SECURITY_FRAUD"
  | "GENERAL_INQUIRY";

export type SupportPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type SupportStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export interface ServerSupportTicket {
  id: string;
  ticketNumber: string; // e.g. TKT-2026-94812
  userId?: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  userRole: "CUSTOMER" | "SELLER" | "GUEST" | "ADMIN";
  category: SupportCategory;
  subject: string;
  description: string;
  priority: SupportPriority;
  status: SupportStatus;
  orderNumber?: string;
  assignedTo?: string;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
  messages: ServerSupportMessage[];
}

export type AdvertisementMediaType = "IMAGE" | "VIDEO";
export type AdvertisementStatus = "PENDING_REVIEW" | "ACTIVE" | "REJECTED" | "SUSPENDED" | "EXPIRED";
export type AdvertisementPaymentStatus = "UNPAID" | "PENDING" | "PAID" | "FAILED";

export interface ServerAdvertisement {
  id: string; // e.g. "adv-174145..."
  advertiserId: string;
  advertiserName: string;
  advertiserEmail: string;
  advertiserPhone: string;
  businessName: string;
  title: string;
  description: string;
  category: string;
  county: string;
  town: string;
  physicalAddress?: string;
  contactPhone: string;
  contactWhatsapp?: string;
  websiteUrl?: string;
  ctaLabel: string;
  ctaUrl: string;
  mediaType: AdvertisementMediaType;
  mediaUrl: string;
  posterUrl?: string;
  mediaName?: string;
  mediaSize?: number;
  videoDurationSeconds?: number;
  status: AdvertisementStatus;
  paymentStatus: AdvertisementPaymentStatus;
  amount: number; // 1020 KES
  currency: string; // "KES"
  durationDays: number; // 30 Days
  mpesaReceipt?: string;
  checkoutRequestId?: string;
  startDate?: string;
  expiryDate?: string;
  viewsCount: number;
  clicksCount: number;
  moderationNote?: string;
  createdAt: string;
  updatedAt: string;
}


