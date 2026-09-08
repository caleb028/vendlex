import fs from "fs";
import path from "path";
import crypto from "crypto";
import {
  ServerUser,
  ServerSession,
  ServerOrder,
  ServerReview,
  ServerServiceRequest,
  ServerNotification,
  ServerAuditLog,
  ServerDispute,
  ServerKYC,
  UserRole,
  MarketingEvent,
  AttributionData,
  MarketingCampaign,
  AdvertisingConnection,
  ProductFeedSyncSummary,
  MarketingConsent,
  ServerSupportTicket,
  ServerSupportMessage,
  SupportCategory,
  SupportPriority,
  SupportStatus,
} from "./types";
import { MOCK_PRODUCTS, Product } from "@/lib/data/kenya-data";
import { LIVE_ORDERS } from "@/lib/ai/tools/index";

export interface VendLexDatabaseSchema {
  users: ServerUser[];
  sessions: ServerSession[];
  products: Product[];
  orders: ServerOrder[];
  reviews: ServerReview[];
  serviceRequests: ServerServiceRequest[];
  notifications: ServerNotification[];
  auditLogs: ServerAuditLog[];
  disputes: ServerDispute[];
  kycs: ServerKYC[];
  supportTickets: ServerSupportTicket[];
  marketingEvents: MarketingEvent[];
  attributionSessions: Record<string, AttributionData>;
  campaigns: MarketingCampaign[];
  advertisingConnections: AdvertisingConnection[];
  productFeedSync: ProductFeedSyncSummary;
  marketingConsents: Record<string, MarketingConsent>;
}

// Global variable to keep singleton instance in Next.js runtime
declare global {
  var __VENDLEX_SERVER_DB: VendLexDatabaseSchema | undefined;
}

const DB_FILE_PATH = path.join(process.cwd(), "data", "vendlex-db.json");

// Helper to hash password with salt
export function hashPassword(password: string, existingSalt?: string): { hash: string; salt: string } {
  const salt = existingSalt || crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const computed = crypto.scryptSync(password, salt, 64).toString("hex");
    return crypto.timingSafeEqual(Buffer.from(computed, "hex"), Buffer.from(hash, "hex"));
  } catch {
    return false;
  }
}

/**
 * Normalize a Kenyan phone number to E.164 format: +2547XXXXXXXX
 * Accepts: 07XX, 254XX, +254XX, 01XX etc.
 */
export function normalizeKenyanPhone(phone: string): string | null {
  if (!phone) return null;
  const cleaned = phone.replace(/[\s\-().+]/g, "");
  // Already full international without +
  if (/^254[17]\d{8}$/.test(cleaned)) return `+${cleaned}`;
  // With + already stripped
  if (/^\+?254[17]\d{8}$/.test(phone.replace(/[\s\-().]/g, ""))) return `+${cleaned}`;
  // Local format 07XX or 01XX
  if (/^0[17]\d{8}$/.test(cleaned)) return `+254${cleaned.slice(1)}`;
  // 9-digit without leading 0 (e.g. 712345678)
  if (/^[17]\d{8}$/.test(cleaned)) return `+254${cleaned}`;
  return null;
}

/**
 * SHA-256 hash a token (for storing reset / verification tokens securely).
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}


// Initial seed data generator
function getInitialSeedData(): VendLexDatabaseSchema {
  const defaultPass = hashPassword("password123");

  const initialUsers: ServerUser[] = [
    {
      id: "usr-cust-1",
      name: "Grace Wanjiku",
      email: "grace.wanjiku@gmail.com",
      phone: "+254712987654",
      role: "CUSTOMER",
      status: "ACTIVE",
      passwordHash: defaultPass.hash,
      salt: defaultPass.salt,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
      isVerified: true,
      createdAt: "2026-08-01T00:00:00Z",
      updatedAt: "2026-08-01T00:00:00Z",
    },
    {
      id: "usr-sell-1",
      name: "Kevin Mwangi",
      email: "kevin@nairobihub.co.ke",
      phone: "+254712345678",
      role: "SELLER",
      status: "ACTIVE",
      businessId: "biz-1",
      businessSlug: "nairobi-tech-hub",
      businessName: "Nairobi Tech Hub",
      passwordHash: defaultPass.hash,
      salt: defaultPass.salt,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
      isVerified: true,
      createdAt: "2026-08-01T00:00:00Z",
      updatedAt: "2026-08-01T00:00:00Z",
    },
    {
      id: "usr-biz-2",
      name: "Amina Hassan",
      email: "amina@savannafashion.ke",
      phone: "+254722890123",
      role: "BUSINESS_OWNER",
      status: "ACTIVE",
      businessId: "biz-2",
      businessSlug: "savanna-fashion-house",
      businessName: "Savanna Fashion House",
      passwordHash: defaultPass.hash,
      salt: defaultPass.salt,
      avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=200&auto=format&fit=crop",
      isVerified: true,
      createdAt: "2026-08-01T00:00:00Z",
      updatedAt: "2026-08-01T00:00:00Z",
    },
    {
      id: "usr-admin-1",
      name: "Caleb Ngiciri",
      email: "calebngiciri075@gmail.com",
      phone: "+254798159503",
      role: "ADMIN",
      status: "ACTIVE",
      passwordHash: defaultPass.hash,
      salt: defaultPass.salt,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
      isVerified: true,
      createdAt: "2026-08-01T00:00:00Z",
      updatedAt: "2026-08-01T00:00:00Z",
    },
  ];

  const initialOrders: ServerOrder[] = LIVE_ORDERS.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customerId: o.customerName === "Grace Wanjiku" ? "usr-cust-1" : "usr-cust-2",
    customerName: o.customerName,
    customerPhone: o.customerPhone,
    customerEmail: `${o.customerName.toLowerCase().replace(/\s+/g, ".")}@gmail.com`,
    county: o.county,
    town: "Central",
    estate: "Main Plaza",
    items: [
      {
        productId: "prod-seed-1",
        productTitle: o.productTitle,
        sku: `SKU-${o.orderNumber}`,
        quantity: 1,
        unitPrice: o.amount,
        totalPrice: o.amount,
        sellerId: o.storeName === "Nairobi Tech Hub" ? "biz-1" : "biz-2",
        sellerName: o.storeName,
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop",
      },
    ],
    sellerId: o.storeName === "Nairobi Tech Hub" ? "biz-1" : "biz-2",
    sellerName: o.storeName,
    subtotal: o.amount,
    deliveryFee: 0,
    discountAmount: 0,
    totalAmount: o.amount,
    paymentMethod: "MPESA",
    paymentStatus: "PAID",
    mpesaReceipt: o.mpesaReceipt,
    status: o.status === "PAID_ESCROW" ? "PAID" : (o.status as any),
    courierTracking: o.courierTracking,
    documentId: o.orderNumber === "ORD-9842" ? "VLX-REC-2026-000182" : undefined,
    createdAt: "2026-08-31T14:22:00Z",
    updatedAt: "2026-08-31T14:22:15Z",
  }));

  const initialReviews: ServerReview[] = [
    {
      id: "rev-1",
      productId: "prod-1", // Apple iPhone 15 Pro Max
      orderId: "ord-101",
      userId: "usr-cust-1",
      userName: "Grace Wanjiku",
      rating: 5,
      title: "Legitimate Apple phone, super fast delivery!",
      comment: "Arrived in unopened official Apple packaging within 2 hours in Nairobi via Fargo Courier. Battery health 100%. Highly recommended!",
      isVerifiedPurchase: true,
      createdAt: "2026-09-01T10:00:00Z",
    },
  ];

  return {
    users: initialUsers,
    sessions: [],
    products: [...MOCK_PRODUCTS],
    orders: initialOrders,
    reviews: initialReviews,
    serviceRequests: [],
    notifications: [
      {
        id: "notif-1",
        userId: "usr-cust-1",
        title: "Welcome to VendLex Kenya",
        message: "Your buyer account is active. Shop verified electronics, fashion, and home goods with instant M-Pesa protection.",
        type: "SYSTEM",
        isRead: false,
        createdAt: "2026-08-31T12:00:00Z",
      },
    ],
    auditLogs: [
      {
        id: "aud-init",
        action: "PLATFORM_INITIALIZATION",
        resource: "SYSTEM",
        details: "VendLex server-side database initialized with verified pre-seeded records.",
        status: "SUCCESS",
        timestamp: "2026-08-31T00:00:00Z",
      },
    ],
    disputes: [
      {
        id: "DSP-8491",
        orderNumber: "ORD-9842",
        orderId: "ord-101",
        customerId: "usr-cust-1",
        customerName: "Grace Wanjiku",
        customerPhone: "+254712987654",
        sellerId: "biz-1",
        sellerName: "Nairobi Tech Hub",
        amount: 4850,
        mpesaReceipt: "QKH89421A",
        reason: "Wrong garment size delivered",
        description: "Customer ordered Size L but received Size S. Replacement initiated.",
        status: "RESOLVED",
        resolutionNotes: "Seller dispatched replacement unit.",
        createdAt: "2026-08-31T15:00:00Z",
        updatedAt: "2026-08-31T16:30:00Z",
      },
    ],
    kycs: [
      {
        id: "kyc-1",
        userId: "usr-sell-1",
        bizName: "Nairobi Tech Hub",
        ownerName: "Kevin Mwangi",
        regNumber: "BN/2024/984210",
        nationalId: "32984124",
        county: "Nairobi",
        town: "CBD",
        docUrl: "CR12_Certificate_Registration.pdf",
        status: "APPROVED",
        submittedDate: "2026-08-30T10:00:00Z",
        reviewedDate: "2026-08-31T09:00:00Z",
      },
    ],
    supportTickets: [
      {
        id: "tkt-1",
        ticketNumber: "TKT-2026-00101",
        userId: "usr-cust-1",
        userName: "Grace Wanjiku",
        userEmail: "grace.wanjiku@gmail.com",
        userPhone: "+254712987654",
        userRole: "CUSTOMER",
        category: "ORDER_ESCROW",
        subject: "How does Escrow Protection work for high-value orders?",
        description: "I am planning to buy a MacBook Pro (KSh 279,999) from Nairobi Tech Hub. When does the seller receive the funds?",
        priority: "MEDIUM",
        status: "RESOLVED",
        orderNumber: "ORD-9843",
        assignedTo: "Antony Otieno (Admin)",
        resolutionNotes: "Explained that funds remain locked in VendLex Escrow vault until parcel is delivered by Fargo Courier and accepted by buyer.",
        createdAt: "2026-08-30T10:15:00Z",
        updatedAt: "2026-08-30T11:45:00Z",
        messages: [
          {
            id: "msg-101",
            senderId: "usr-cust-1",
            senderName: "Grace Wanjiku",
            senderRole: "CUSTOMER",
            message: "I am planning to buy a MacBook Pro (KSh 279,999) from Nairobi Tech Hub. When does the seller receive the funds?",
            timestamp: "2026-08-30T10:15:00Z",
          },
          {
            id: "msg-102",
            senderId: "usr-admin-1",
            senderName: "Antony Otieno (Support HQ)",
            senderRole: "ADMIN",
            message: "Hello Grace! On VendLex Kenya, 100% of your funds are held in our secured Escrow vault. The seller only receives payout after you receive the package, inspect it, and confirm delivery.",
            timestamp: "2026-08-30T11:45:00Z",
          },
        ],
      },
      {
        id: "tkt-2",
        ticketNumber: "TKT-2026-00102",
        userId: "usr-sell-1",
        userName: "Kevin Mwangi",
        userEmail: "kevin@nairobihub.co.ke",
        userPhone: "+254712345678",
        userRole: "SELLER",
        category: "SELLER_STORE",
        subject: "Official Merchant Certificate verification seal inquiry",
        description: "How can my corporate customers verify our stamped certificate VLX-CER-2026-000042?",
        priority: "LOW",
        status: "RESOLVED",
        assignedTo: "Compliance Team",
        createdAt: "2026-09-01T08:00:00Z",
        updatedAt: "2026-09-01T09:20:00Z",
        messages: [
          {
            id: "msg-201",
            senderId: "usr-sell-1",
            senderName: "Kevin Mwangi",
            senderRole: "SELLER",
            message: "How can my corporate customers verify our stamped certificate VLX-CER-2026-000042?",
            timestamp: "2026-09-01T08:00:00Z",
          },
          {
            id: "msg-202",
            senderId: "usr-admin-1",
            senderName: "Compliance Admin",
            senderRole: "ADMIN",
            message: "Hi Kevin! Anyone can scan the QR code on your PDF certificate or navigate to vendlex.co.ke/verify/VLX-CER-2026-000042 to view the authentic ledger record.",
            timestamp: "2026-09-01T09:20:00Z",
          },
        ],
      },
      {
        id: "tkt-3",
        ticketNumber: "TKT-2026-00103",
        userName: "Samuel Kariuki",
        userEmail: "samuel.k@gmail.com",
        userPhone: "+254700112233",
        userRole: "CUSTOMER",
        category: "DELIVERY_COURIER",
        subject: "Fargo Courier tracking ETA for Mombasa delivery",
        description: "Order ORD-98401 tracking number FARGO-MBSA-90412. When will it arrive in Nyali?",
        priority: "HIGH",
        status: "OPEN",
        orderNumber: "ORD-98401",
        createdAt: "2026-09-07T08:30:00Z",
        updatedAt: "2026-09-07T08:30:00Z",
        messages: [
          {
            id: "msg-301",
            senderName: "Samuel Kariuki",
            senderRole: "CUSTOMER",
            message: "Order ORD-98401 tracking number FARGO-MBSA-90412. When will it arrive in Nyali?",
            timestamp: "2026-09-07T08:30:00Z",
          },
        ],
      },
    ],
    marketingEvents: [],
    attributionSessions: {},
    campaigns: [
      {
        id: "cmp-101",
        sellerId: "usr-sell-1",
        sellerName: "Nairobi Tech Hub",
        name: "Q3 High-End Smartphones & Laptops Campaign",
        platform: "GOOGLE",
        objective: "SALES",
        productId: "prod-1",
        productTitle: "Apple iPhone 15 Pro Max 256GB Titanium",
        productImage: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=600&auto=format&fit=crop",
        targetCounties: ["Nairobi", "Kiambu", "Nakuru", "Mombasa"],
        budgetAmount: 15000,
        dailyBudget: 500,
        currency: "KES",
        startDate: "2026-08-15T00:00:00Z",
        endDate: "2026-09-15T00:00:00Z",
        status: "ACTIVE",
        externalCampaignId: "goog_camp_894120",
        metrics: {
          impressions: 14250,
          clicks: 684,
          spend: 8550,
          conversions: 18,
          attributedRevenue: 2789982,
          ctr: 4.8,
          cpc: 12.5,
          cpa: 475,
          roas: 326.3,
        },
        createdAt: "2026-08-14T12:00:00Z",
        updatedAt: "2026-09-06T10:00:00Z",
      },
      {
        id: "cmp-102",
        sellerId: "usr-biz-2",
        sellerName: "Savanna Fashion House",
        name: "Spring Kenyan Linen & Silk Collection",
        platform: "META",
        objective: "SALES",
        targetCounties: ["Nairobi", "Mombasa", "Kisumu", "Eldoret"],
        budgetAmount: 10000,
        dailyBudget: 400,
        currency: "KES",
        startDate: "2026-08-20T00:00:00Z",
        endDate: "2026-09-20T00:00:00Z",
        status: "ACTIVE",
        externalCampaignId: "meta_camp_410982",
        metrics: {
          impressions: 21400,
          clicks: 980,
          spend: 6860,
          conversions: 24,
          attributedRevenue: 342000,
          ctr: 4.58,
          cpc: 7.0,
          cpa: 285.8,
          roas: 49.85,
        },
        createdAt: "2026-08-19T14:00:00Z",
        updatedAt: "2026-09-06T10:00:00Z",
      },
    ],
    advertisingConnections: [
      {
        provider: "GOOGLE",
        status: "CONFIGURATION_REQUIRED",
        config: {
          conversionTrackingEnabled: true,
          serverEventsEnabled: true,
          productFeedEnabled: true,
          autoSyncCatalog: true,
        },
        updatedAt: "2026-09-06T10:00:00Z",
      },
      {
        provider: "META",
        status: "CONFIGURATION_REQUIRED",
        config: {
          conversionTrackingEnabled: true,
          serverEventsEnabled: true,
          productFeedEnabled: true,
          autoSyncCatalog: true,
        },
        updatedAt: "2026-09-06T10:00:00Z",
      },
    ],
    productFeedSync: {
      lastSyncAt: new Date().toISOString(),
      totalProducts: MOCK_PRODUCTS.length,
      eligibleProducts: MOCK_PRODUCTS.length,
      rejectedProducts: 0,
      googleSynced: 0,
      metaSynced: 0,
      status: "CONFIGURATION_REQUIRED",
      errors: [],
    },
    marketingConsents: {},
  };
}

class ServerDatabaseManager {
  private db: VendLexDatabaseSchema;

  constructor() {
    if (global.__VENDLEX_SERVER_DB) {
      this.db = global.__VENDLEX_SERVER_DB;
      this.ensureMarketingSchema();
      return;
    }

    try {
      if (fs.existsSync(DB_FILE_PATH)) {
        const fileContent = fs.readFileSync(DB_FILE_PATH, "utf-8");
        this.db = JSON.parse(fileContent);
        this.ensureMarketingSchema();
      } else {
        this.db = getInitialSeedData();
        this.persist();
      }
    } catch (err) {
      console.warn("[ServerDB] Failed to read db file, initializing in-memory seed:", err);
      this.db = getInitialSeedData();
    }

    global.__VENDLEX_SERVER_DB = this.db;
  }

  private ensureMarketingSchema(): void {
    if (!this.db.marketingEvents) this.db.marketingEvents = [];
    if (!this.db.attributionSessions) this.db.attributionSessions = {};
    if (!this.db.campaigns || this.db.campaigns.length === 0) {
      this.db.campaigns = getInitialSeedData().campaigns;
    }
    const initialSeeds = getInitialSeedData().supportTickets;
    if (!this.db.supportTickets) {
      this.db.supportTickets = [...initialSeeds];
    } else {
      for (const st of initialSeeds) {
        if (!this.db.supportTickets.some((t) => t.id === st.id || t.ticketNumber === st.ticketNumber)) {
          this.db.supportTickets.push(st);
        }
      }
    }
    const initialDisputes = getInitialSeedData().disputes;
    if (!this.db.disputes) {
      this.db.disputes = [...initialDisputes];
    } else {
      for (const d of initialDisputes) {
        if (!this.db.disputes.some((x) => x.id === d.id)) {
          this.db.disputes.push(d);
        }
      }
    }
    const initialKycs = getInitialSeedData().kycs;
    if (!this.db.kycs) {
      this.db.kycs = [...initialKycs];
    } else {
      for (const k of initialKycs) {
        if (!this.db.kycs.some((x) => x.id === k.id)) {
          this.db.kycs.push(k);
        }
      }
    }
    this.persist();
    if (!this.db.advertisingConnections || this.db.advertisingConnections.length === 0) {
      this.db.advertisingConnections = [
        {
          provider: "GOOGLE",
          status: "CONFIGURATION_REQUIRED",
          config: {
            conversionTrackingEnabled: true,
            serverEventsEnabled: true,
            productFeedEnabled: true,
            autoSyncCatalog: true,
          },
          updatedAt: new Date().toISOString(),
        },
        {
          provider: "META",
          status: "CONFIGURATION_REQUIRED",
          config: {
            conversionTrackingEnabled: true,
            serverEventsEnabled: true,
            productFeedEnabled: true,
            autoSyncCatalog: true,
          },
          updatedAt: new Date().toISOString(),
        },
      ];
    }
    if (!this.db.productFeedSync) {
      this.db.productFeedSync = {
        lastSyncAt: new Date().toISOString(),
        totalProducts: this.db.products?.length || MOCK_PRODUCTS.length,
        eligibleProducts: this.db.products?.length || MOCK_PRODUCTS.length,
        rejectedProducts: 0,
        googleSynced: 0,
        metaSynced: 0,
        status: "CONFIGURATION_REQUIRED",
        errors: [],
      };
    }
    if (!this.db.marketingConsents) this.db.marketingConsents = {};
  }

  private persist(): void {
    try {
      const dir = path.dirname(DB_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(this.db, null, 2), "utf-8");
    } catch (err) {
      console.error("[ServerDB] Error saving to disk:", err);
    }
  }

  // ==========================================================================
  // 1. USER & AUTH OPERATIONS
  // ==========================================================================
  public getUsers(): ServerUser[] {
    return this.db.users;
  }

  public findUserById(id: string): ServerUser | undefined {
    return this.db.users.find((u) => u.id === id);
  }

  public findUserByEmail(email: string): ServerUser | undefined {
    return this.db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  }

  public findUserByPhone(phone: string): ServerUser | undefined {
    const normalized = normalizeKenyanPhone(phone);
    if (!normalized) return undefined;
    return this.db.users.find((u) => {
      const userNorm = normalizeKenyanPhone(u.phone);
      return userNorm === normalized;
    });
  }

  /**
   * Find user by email or phone (tries email first, then phone normalization).
   */
  public findUserByIdentifier(identifier: string): ServerUser | undefined {
    const trimmed = identifier.trim();
    if (trimmed.includes("@")) {
      return this.findUserByEmail(trimmed);
    }
    return this.findUserByPhone(trimmed) || this.findUserByEmail(trimmed);
  }

  public createUser(data: {
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    password: string;
    businessName?: string;
  }): ServerUser {
    const { hash, salt } = hashPassword(data.password);
    const id = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const businessSlug = data.businessName
      ? data.businessName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
      : undefined;
    const normalizedPhone = normalizeKenyanPhone(data.phone) || data.phone;

    const newUser: ServerUser = {
      id,
      name: data.name,
      email: data.email.toLowerCase().trim(),
      phone: normalizedPhone,
      role: data.role,
      status: "ACTIVE",
      passwordHash: hash,
      salt,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop`,
      businessId: businessSlug ? `biz-${Date.now()}` : undefined,
      businessName: data.businessName,
      businessSlug,
      isVerified: data.role === "SELLER" ? false : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.db.users.push(newUser);
    this.persist();
    return newUser;
  }

  public updateUser(id: string, updates: Partial<ServerUser>): ServerUser | null {
    const user = this.findUserById(id);
    if (!user) return null;

    Object.assign(user, updates, { updatedAt: new Date().toISOString() });
    this.persist();
    return user;
  }

  // ==========================================================================
  // 2. SESSION MANAGEMENT
  // ==========================================================================
  public createSession(
    userId: string,
    role: UserRole,
    options?: { durationHours?: number; rememberMe?: boolean; userAgent?: string; ipAddress?: string }
  ): ServerSession {
    const durationHours = options?.rememberMe ? 720 : (options?.durationHours ?? 72); // 30 days if remember me, else 72h
    const token = crypto.randomBytes(32).toString("hex");
    const session: ServerSession = {
      token,
      userId,
      role,
      expiresAt: Date.now() + durationHours * 60 * 60 * 1000,
      createdAt: new Date().toISOString(),
      rememberMe: options?.rememberMe,
      userAgent: options?.userAgent,
      ipAddress: options?.ipAddress,
      lastActivityAt: new Date().toISOString(),
    };

    this.db.sessions.push(session);
    this.persist();
    return session;
  }

  public getSession(token: string): ServerSession | null {
    const session = this.db.sessions.find((s) => s.token === token);
    if (!session) return null;
    if (Date.now() > session.expiresAt) {
      this.deleteSession(token);
      return null;
    }
    // Update last activity
    session.lastActivityAt = new Date().toISOString();
    return session;
  }

  public deleteSession(token: string): void {
    this.db.sessions = this.db.sessions.filter((s) => s.token !== token);
    this.persist();
  }

  public getUserSessions(userId: string): ServerSession[] {
    const now = Date.now();
    // Clean expired sessions
    this.db.sessions = this.db.sessions.filter((s) => s.expiresAt > now);
    return this.db.sessions.filter((s) => s.userId === userId);
  }

  public deleteAllUserSessions(userId: string, exceptToken?: string): void {
    this.db.sessions = this.db.sessions.filter(
      (s) => s.userId !== userId || (exceptToken && s.token === exceptToken)
    );
    this.persist();
  }

  // ==========================================================================
  // 3. PRODUCT REPOSITORY & INVENTORY
  // ==========================================================================
  public getProducts(): Product[] {
    return this.db.products;
  }

  public getProductById(id: string): Product | undefined {
    return this.db.products.find((p) => p.id === id);
  }

  public getProductBySlug(slug: string): Product | undefined {
    return this.db.products.find((p) => p.slug === slug);
  }

  public getSellerProducts(businessIdOrSlug: string): Product[] {
    return this.db.products.filter(
      (p) => p.businessId === businessIdOrSlug || p.businessSlug === businessIdOrSlug
    );
  }

  public createProduct(productData: Omit<Product, "id">): Product {
    const id = `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newProduct: Product = { ...productData, id };
    this.db.products.unshift(newProduct);
    this.persist();
    return newProduct;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product | null {
    const prod = this.getProductById(id);
    if (!prod) return null;

    Object.assign(prod, updates);
    if (typeof prod.stockCount === "number") {
      prod.inStock = prod.stockCount > 0;
    }
    this.persist();
    return prod;
  }

  public deleteProduct(id: string): boolean {
    const initLen = this.db.products.length;
    this.db.products = this.db.products.filter((p) => p.id !== id);
    if (this.db.products.length !== initLen) {
      this.persist();
      return true;
    }
    return false;
  }

  public decrementStock(productId: string, quantity: number): boolean {
    const prod = this.getProductById(productId);
    if (!prod) return false;
    if (prod.stockCount < quantity) return false;

    prod.stockCount -= quantity;
    prod.inStock = prod.stockCount > 0;
    this.persist();
    return true;
  }

  // ==========================================================================
  // 4. ORDERS & STATE MACHINE
  // ==========================================================================
  public getOrders(): ServerOrder[] {
    return this.db.orders;
  }

  public getOrderById(id: string): ServerOrder | undefined {
    return this.db.orders.find((o) => o.id === id);
  }

  public getOrderByNumber(orderNumber: string): ServerOrder | undefined {
    return this.db.orders.find((o) => o.orderNumber.toUpperCase() === orderNumber.toUpperCase());
  }

  public getCustomerOrders(customerId: string): ServerOrder[] {
    return this.db.orders.filter((o) => o.customerId === customerId);
  }

  public getSellerOrders(sellerId: string): ServerOrder[] {
    return this.db.orders.filter(
      (o) => o.sellerId === sellerId || o.items.some((i) => i.sellerId === sellerId)
    );
  }

  public createOrder(data: Omit<ServerOrder, "id" | "createdAt" | "updatedAt">): ServerOrder {
    const id = `ord-${Date.now()}`;
    const newOrder: ServerOrder = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.db.orders.unshift(newOrder);
    this.persist();
    return newOrder;
  }

  public updateOrderStatus(
    orderId: string,
    newStatus: ServerOrder["status"],
    metadata?: {
      courierTracking?: string;
      mpesaReceipt?: string;
      paymentStatus?: ServerOrder["paymentStatus"];
      documentId?: string;
    }
  ): { success: boolean; order?: ServerOrder; error?: string } {
    const order = this.getOrderById(orderId);
    if (!order) return { success: false, error: "Order not found" };

    // State machine transition validation
    const validTransitions: Record<ServerOrder["status"], ServerOrder["status"][]> = {
      PENDING_PAYMENT: ["PAID", "CANCELLED"],
      PAID: ["PROCESSING", "CANCELLED"],
      PROCESSING: ["READY_FOR_DISPATCH", "CANCELLED"],
      READY_FOR_DISPATCH: ["DISPATCHED", "CANCELLED"],
      DISPATCHED: ["DELIVERED"],
      DELIVERED: [],
      CANCELLED: [],
    };

    if (order.status !== newStatus && !validTransitions[order.status].includes(newStatus)) {
      return {
        success: false,
        error: `Invalid transition from ${order.status} to ${newStatus}`,
      };
    }

    order.status = newStatus;
    if (metadata?.courierTracking) order.courierTracking = metadata.courierTracking;
    if (metadata?.mpesaReceipt) order.mpesaReceipt = metadata.mpesaReceipt;
    if (metadata?.paymentStatus) order.paymentStatus = metadata.paymentStatus;
    if (metadata?.documentId) order.documentId = metadata.documentId;
    order.updatedAt = new Date().toISOString();

    this.persist();
    return { success: true, order };
  }

  // ==========================================================================
  // 5. REVIEWS & RATINGS
  // ==========================================================================
  public getProductReviews(productId: string): ServerReview[] {
    return this.db.reviews.filter((r) => r.productId === productId);
  }

  public hasUserPurchasedProduct(userId: string, productId: string): boolean {
    return this.db.orders.some(
      (o) =>
        o.customerId === userId &&
        (o.status === "DELIVERED" || o.status === "PAID" || o.status === "DISPATCHED") &&
        o.items.some((i) => i.productId === productId)
    );
  }

  public addReview(reviewData: Omit<ServerReview, "id" | "createdAt">): {
    success: boolean;
    review?: ServerReview;
    error?: string;
  } {
    // Check if user already reviewed this product
    const existing = this.db.reviews.find(
      (r) => r.productId === reviewData.productId && r.userId === reviewData.userId
    );
    if (existing) {
      return { success: false, error: "You have already submitted a review for this product." };
    }

    const review: ServerReview = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    this.db.reviews.unshift(review);

    // Recalculate product aggregate rating
    const productReviews = this.db.reviews.filter((r) => r.productId === reviewData.productId);
    const avgRating =
      productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;

    const prod = this.getProductById(reviewData.productId);
    if (prod) {
      prod.rating = parseFloat(avgRating.toFixed(1));
      prod.reviewCount = productReviews.length;
    }

    this.persist();
    return { success: true, review };
  }

  // ==========================================================================
  // 6. SERVICES (BOOKINGS & QUOTES)
  // ==========================================================================
  public getServiceRequests(filter?: { providerId?: string; customerId?: string }): ServerServiceRequest[] {
    let list = this.db.serviceRequests;
    if (filter?.providerId) {
      list = list.filter((s) => s.providerId === filter.providerId);
    }
    if (filter?.customerId) {
      list = list.filter((s) => s.customerId === filter.customerId);
    }
    return list;
  }

  public createServiceRequest(data: Omit<ServerServiceRequest, "id" | "createdAt" | "updatedAt">): ServerServiceRequest {
    const req: ServerServiceRequest = {
      ...data,
      id: `sr-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.db.serviceRequests.unshift(req);
    this.persist();
    return req;
  }

  public updateServiceRequestStatus(
    id: string,
    status: ServerServiceRequest["status"],
    quoteAmount?: number
  ): ServerServiceRequest | null {
    const req = this.db.serviceRequests.find((s) => s.id === id);
    if (!req) return null;
    req.status = status;
    if (typeof quoteAmount === "number") req.quoteAmount = quoteAmount;
    req.updatedAt = new Date().toISOString();
    this.persist();
    return req;
  }

  // ==========================================================================
  // 7. NOTIFICATIONS
  // ==========================================================================
  public getUserNotifications(userId: string): ServerNotification[] {
    return this.db.notifications.filter((n) => n.userId === userId);
  }

  public addNotification(data: Omit<ServerNotification, "id" | "isRead" | "createdAt">): ServerNotification {
    const notif: ServerNotification = {
      ...data,
      id: `notif-${Date.now()}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    this.db.notifications.unshift(notif);
    this.persist();
    return notif;
  }

  public markNotificationAsRead(id: string): void {
    const n = this.db.notifications.find((item) => item.id === id);
    if (n) {
      n.isRead = true;
      this.persist();
    }
  }

  // ==========================================================================
  // 8. AUDIT LOGGING
  // ==========================================================================
  public logAction(entry: Omit<ServerAuditLog, "id" | "timestamp">): ServerAuditLog {
    const log: ServerAuditLog = {
      ...entry,
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    this.db.auditLogs.unshift(log);
    this.persist();
    return log;
  }

  public getAuditLogs(limit: number = 50): ServerAuditLog[] {
    return this.db.auditLogs.slice(0, limit);
  }

  // ==========================================================================
  // 9. DISPUTES & ESCROW FREEZING
  // ==========================================================================
  public getDisputes(filter?: { customerId?: string; sellerId?: string; status?: string }): ServerDispute[] {
    if (!this.db.disputes) this.db.disputes = [];
    let list = this.db.disputes;
    if (filter?.customerId) {
      list = list.filter((d) => d.customerId === filter.customerId);
    }
    if (filter?.sellerId) {
      list = list.filter((d) => d.sellerId === filter.sellerId);
    }
    if (filter?.status) {
      list = list.filter((d) => d.status === filter.status);
    }
    return list;
  }

  public getDisputeById(id: string): ServerDispute | undefined {
    if (!this.db.disputes) this.db.disputes = [];
    return this.db.disputes.find((d) => d.id === id);
  }

  public createDispute(data: Omit<ServerDispute, "id" | "createdAt" | "updatedAt">): ServerDispute {
    if (!this.db.disputes) this.db.disputes = [];
    const id = `DSP-${Math.floor(1000 + Math.random() * 9000)}`;
    const dispute: ServerDispute = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.db.disputes.unshift(dispute);
    this.persist();
    return dispute;
  }

  public updateDisputeStatus(
    id: string,
    status: ServerDispute["status"],
    resolutionNotes?: string
  ): ServerDispute | null {
    if (!this.db.disputes) this.db.disputes = [];
    const dispute = this.db.disputes.find((d) => d.id === id);
    if (!dispute) return null;
    dispute.status = status;
    if (resolutionNotes) dispute.resolutionNotes = resolutionNotes;
    dispute.updatedAt = new Date().toISOString();
    this.persist();
    return dispute;
  }

  // ==========================================================================
  // 10. MERCHANT KYC VERIFICATION
  // ==========================================================================
  public getKYCs(filter?: { status?: string; userId?: string }): ServerKYC[] {
    if (!this.db.kycs) this.db.kycs = [];
    let list = this.db.kycs;
    if (filter?.status) {
      list = list.filter((k) => k.status === filter.status);
    }
    if (filter?.userId) {
      list = list.filter((k) => k.userId === filter.userId);
    }
    return list;
  }

  public createKYC(data: Omit<ServerKYC, "id" | "submittedDate">): ServerKYC {
    if (!this.db.kycs) this.db.kycs = [];
    const id = `kyc-${Date.now()}`;
    const kyc: ServerKYC = {
      ...data,
      id,
      submittedDate: new Date().toISOString(),
    };
    this.db.kycs.unshift(kyc);
    this.persist();
    return kyc;
  }

  public updateKYCStatus(
    id: string,
    status: ServerKYC["status"],
    reviewNotes?: string
  ): ServerKYC | null {
    if (!this.db.kycs) this.db.kycs = [];
    const kyc = this.db.kycs.find((k) => k.id === id);
    if (!kyc) return null;
    kyc.status = status;
    if (reviewNotes) kyc.reviewNotes = reviewNotes;
    kyc.reviewedDate = new Date().toISOString();

    // If approved, update user verified status in user table
    if (status === "APPROVED") {
      this.updateUser(kyc.userId, { isVerified: true });
    }

    this.persist();
    return kyc;
  }

  // ==========================================================================
  // 11. MARKETING & ADVERTISING OPERATIONS
  // ==========================================================================
  public getMarketingEvents(filter?: {
    eventType?: string;
    userId?: string;
    sellerId?: string;
    orderId?: string;
    limit?: number;
  }): MarketingEvent[] {
    if (!this.db.marketingEvents) this.db.marketingEvents = [];
    let list = this.db.marketingEvents;

    if (filter?.eventType) {
      list = list.filter((e) => e.eventType === filter.eventType);
    }
    if (filter?.userId) {
      list = list.filter((e) => e.userId === filter.userId);
    }
    if (filter?.sellerId) {
      list = list.filter((e) => e.sellerId === filter.sellerId);
    }
    if (filter?.orderId) {
      list = list.filter((e) => e.orderId === filter.orderId || e.orderNumber === filter.orderId);
    }
    if (filter?.limit && filter.limit > 0) {
      list = list.slice(0, filter.limit);
    }
    return list;
  }

  public findMarketingEventByEventId(eventId: string): MarketingEvent | undefined {
    if (!this.db.marketingEvents) this.db.marketingEvents = [];
    return this.db.marketingEvents.find((e) => e.eventId === eventId);
  }

  public createMarketingEvent(data: Omit<MarketingEvent, "id">): MarketingEvent {
    if (!this.db.marketingEvents) this.db.marketingEvents = [];

    // Check for existing idempotent eventId
    const existing = this.findMarketingEventByEventId(data.eventId);
    if (existing) {
      return existing;
    }

    const id = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const event: MarketingEvent = {
      ...data,
      id,
    };
    this.db.marketingEvents.unshift(event);

    // Keep event ledger bounded to 1,000 most recent events in demo store
    if (this.db.marketingEvents.length > 1000) {
      this.db.marketingEvents = this.db.marketingEvents.slice(0, 1000);
    }

    this.persist();
    return event;
  }

  public updateMarketingEventDelivery(
    id: string,
    provider: "GOOGLE" | "META" | "INTERNAL",
    update: {
      status: "PENDING" | "DELIVERED" | "FAILED" | "SKIPPED_CONSENT" | "SKIPPED_UNCONFIGURED";
      responseId?: string;
      error?: string;
    }
  ): MarketingEvent | null {
    if (!this.db.marketingEvents) this.db.marketingEvents = [];
    const event = this.db.marketingEvents.find((e) => e.id === id || e.eventId === id);
    if (!event) return null;

    let dest = event.destinations.find((d) => d.provider === provider);
    if (!dest) {
      dest = {
        provider,
        status: update.status,
        attempts: 1,
        lastAttemptAt: new Date().toISOString(),
        responseId: update.responseId,
        error: update.error,
      };
      event.destinations.push(dest);
    } else {
      dest.status = update.status;
      dest.attempts += 1;
      dest.lastAttemptAt = new Date().toISOString();
      if (update.responseId) dest.responseId = update.responseId;
      if (update.error) dest.error = update.error;
    }

    this.persist();
    return event;
  }

  // Attribution Sessions
  public getAttribution(sessionId: string): AttributionData | undefined {
    if (!this.db.attributionSessions) this.db.attributionSessions = {};
    return this.db.attributionSessions[sessionId];
  }

  public setAttribution(sessionId: string, data: AttributionData): void {
    if (!this.db.attributionSessions) this.db.attributionSessions = {};
    this.db.attributionSessions[sessionId] = data;
    this.persist();
  }

  // Campaigns
  public getCampaigns(filter?: {
    sellerId?: string;
    platform?: string;
    status?: string;
  }): MarketingCampaign[] {
    if (!this.db.campaigns) this.db.campaigns = [];
    let list = this.db.campaigns;

    if (filter?.sellerId) {
      list = list.filter((c) => c.sellerId === filter.sellerId);
    }
    if (filter?.platform && filter.platform !== "ALL") {
      list = list.filter((c) => c.platform === filter.platform);
    }
    if (filter?.status && filter.status !== "ALL") {
      list = list.filter((c) => c.status === filter.status);
    }
    return list;
  }

  public getCampaignById(id: string): MarketingCampaign | undefined {
    if (!this.db.campaigns) this.db.campaigns = [];
    return this.db.campaigns.find((c) => c.id === id);
  }

  public createCampaign(data: Omit<MarketingCampaign, "id" | "createdAt" | "updatedAt" | "metrics"> & { metrics?: Partial<MarketingCampaign["metrics"]> }): MarketingCampaign {
    if (!this.db.campaigns) this.db.campaigns = [];
    const id = `cmp-${Date.now()}`;
    const defaultMetrics = {
      impressions: 0,
      clicks: 0,
      spend: 0,
      conversions: 0,
      attributedRevenue: 0,
      ctr: 0,
      cpc: 0,
      cpa: 0,
      roas: 0,
      ...data.metrics,
    };

    const campaign: MarketingCampaign = {
      ...data,
      id,
      metrics: defaultMetrics,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.db.campaigns.unshift(campaign);
    this.persist();
    return campaign;
  }

  public updateCampaign(
    id: string,
    data: Partial<MarketingCampaign>
  ): MarketingCampaign | null {
    if (!this.db.campaigns) this.db.campaigns = [];
    const camp = this.db.campaigns.find((c) => c.id === id);
    if (!camp) return null;

    Object.assign(camp, data, { updatedAt: new Date().toISOString() });
    this.persist();
    return camp;
  }

  public deleteCampaign(id: string, sellerId?: string): boolean {
    if (!this.db.campaigns) this.db.campaigns = [];
    const idx = this.db.campaigns.findIndex((c) => c.id === id && (!sellerId || c.sellerId === sellerId));
    if (idx === -1) return false;
    this.db.campaigns.splice(idx, 1);
    this.persist();
    return true;
  }

  // Advertising Connections
  public getAdvertisingConnections(): AdvertisingConnection[] {
    if (!this.db.advertisingConnections) this.db.advertisingConnections = [];
    return this.db.advertisingConnections;
  }

  public getAdvertisingConnection(provider: "GOOGLE" | "META"): AdvertisingConnection | undefined {
    if (!this.db.advertisingConnections) this.db.advertisingConnections = [];
    return this.db.advertisingConnections.find((c) => c.provider === provider);
  }

  public updateAdvertisingConnection(
    provider: "GOOGLE" | "META",
    data: Partial<AdvertisingConnection>
  ): AdvertisingConnection {
    if (!this.db.advertisingConnections) this.db.advertisingConnections = [];
    let conn = this.db.advertisingConnections.find((c) => c.provider === provider);
    if (!conn) {
      conn = {
        provider,
        status: data.status || "CONFIGURATION_REQUIRED",
        config: {
          conversionTrackingEnabled: true,
          serverEventsEnabled: true,
          productFeedEnabled: true,
          autoSyncCatalog: true,
          ...data.config,
        },
        updatedAt: new Date().toISOString(),
        ...data,
      };
      this.db.advertisingConnections.push(conn);
    } else {
      Object.assign(conn, data, {
        config: { ...conn.config, ...data.config },
        updatedAt: new Date().toISOString(),
      });
    }
    this.persist();
    return conn;
  }

  // Product Feed Sync
  public getProductFeedSync(): ProductFeedSyncSummary {
    if (!this.db.productFeedSync) {
      this.db.productFeedSync = {
        lastSyncAt: new Date().toISOString(),
        totalProducts: this.db.products?.length || MOCK_PRODUCTS.length,
        eligibleProducts: this.db.products?.length || MOCK_PRODUCTS.length,
        rejectedProducts: 0,
        googleSynced: 0,
        metaSynced: 0,
        status: "CONFIGURATION_REQUIRED",
        errors: [],
      };
    }
    return this.db.productFeedSync;
  }

  public updateProductFeedSync(data: Partial<ProductFeedSyncSummary>): ProductFeedSyncSummary {
    const curr = this.getProductFeedSync();
    Object.assign(curr, data, { lastSyncAt: new Date().toISOString() });
    this.persist();
    return curr;
  }

  // Marketing Consent
  public getConsent(key: string): MarketingConsent | undefined {
    if (!this.db.marketingConsents) this.db.marketingConsents = {};
    return this.db.marketingConsents[key];
  }

  public setConsent(key: string, consent: MarketingConsent): void {
    if (!this.db.marketingConsents) this.db.marketingConsents = {};
    this.db.marketingConsents[key] = consent;
    this.persist();
  }

  // ==========================================================================
  // 12. HELP & SUPPORT TICKETS
  // ==========================================================================
  public getSupportTickets(filter?: {
    status?: string;
    category?: string;
    userId?: string;
    search?: string;
  }): ServerSupportTicket[] {
    if (!this.db.supportTickets) this.db.supportTickets = [];
    let tickets = [...this.db.supportTickets];

    if (filter?.userId) {
      tickets = tickets.filter((t) => t.userId === filter.userId);
    }
    if (filter?.status && filter.status !== "ALL") {
      tickets = tickets.filter((t) => t.status === filter.status);
    }
    if (filter?.category && filter.category !== "ALL") {
      tickets = tickets.filter((t) => t.category === filter.category);
    }
    if (filter?.search && filter.search.trim()) {
      const q = filter.search.toLowerCase().trim();
      tickets = tickets.filter(
        (t) =>
          t.ticketNumber.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q) ||
          t.userName.toLowerCase().includes(q) ||
          t.userEmail.toLowerCase().includes(q) ||
          t.orderNumber?.toLowerCase().includes(q)
      );
    }
    return tickets.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  public findSupportTicketById(id: string): ServerSupportTicket | null {
    if (!this.db.supportTickets) this.db.supportTickets = [];
    return (
      this.db.supportTickets.find(
        (t) => t.id === id || t.ticketNumber.toUpperCase() === id.toUpperCase()
      ) || null
    );
  }

  public createSupportTicket(data: {
    userId?: string;
    userName: string;
    userEmail: string;
    userPhone: string;
    userRole?: "CUSTOMER" | "SELLER" | "GUEST" | "ADMIN";
    category: SupportCategory;
    subject: string;
    description: string;
    priority?: SupportPriority;
    orderNumber?: string;
  }): ServerSupportTicket {
    if (!this.db.supportTickets) this.db.supportTickets = [];
    const id = `tkt-${Date.now()}`;
    const numPart = String(Math.floor(10000 + Math.random() * 90000));
    const ticketNumber = `TKT-2026-${numPart}`;
    const now = new Date().toISOString();

    const newTicket: ServerSupportTicket = {
      id,
      ticketNumber,
      userId: data.userId,
      userName: data.userName,
      userEmail: data.userEmail,
      userPhone: data.userPhone,
      userRole: data.userRole || "CUSTOMER",
      category: data.category,
      subject: data.subject,
      description: data.description,
      priority: data.priority || "MEDIUM",
      status: "OPEN",
      orderNumber: data.orderNumber,
      createdAt: now,
      updatedAt: now,
      messages: [
        {
          id: `msg-${Date.now()}`,
          senderId: data.userId,
          senderName: data.userName,
          senderRole: data.userRole || "CUSTOMER",
          message: data.description,
          timestamp: now,
        },
      ],
    };

    this.db.supportTickets.unshift(newTicket);
    this.persist();
    return newTicket;
  }

  public updateSupportTicket(
    id: string,
    updates: Partial<ServerSupportTicket>
  ): ServerSupportTicket | null {
    const ticket = this.findSupportTicketById(id);
    if (!ticket) return null;

    Object.assign(ticket, updates, { updatedAt: new Date().toISOString() });
    this.persist();
    return ticket;
  }

  public addSupportTicketMessage(
    ticketId: string,
    msg: {
      senderId?: string;
      senderName: string;
      senderRole: "CUSTOMER" | "SELLER" | "ADMIN" | "SYSTEM" | "GUEST";
      message: string;
    }
  ): ServerSupportTicket | null {
    const ticket = this.findSupportTicketById(ticketId);
    if (!ticket) return null;

    const newMessage: ServerSupportMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      senderId: msg.senderId,
      senderName: msg.senderName,
      senderRole: msg.senderRole,
      message: msg.message,
      timestamp: new Date().toISOString(),
    };

    ticket.messages.push(newMessage);
    ticket.updatedAt = new Date().toISOString();
    if (msg.senderRole === "ADMIN" && ticket.status === "OPEN") {
      ticket.status = "IN_PROGRESS";
    }
    this.persist();
    return ticket;
  }
}

export const serverDB = new ServerDatabaseManager();
