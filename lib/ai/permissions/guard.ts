import { AIUserContext } from "../types";

export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
}

export class PermissionGuard {
  /**
   * Check if a user is permitted to view orders for a customer or order record.
   * - ADMIN can view all orders.
   * - BUYER / CUSTOMER can only view orders matching their phone, name, or customer ID.
   * - Anonymous users cannot view specific private orders without exact receipt verification.
   */
  static canAccessOrder(user: AIUserContext | undefined, orderCustomerPhone?: string, orderCustomerName?: string): PermissionCheckResult {
    if (!user || !user.role) {
      return {
        allowed: false,
        reason: "You must be signed in to view your private order history and tracking details.",
      };
    }

    if (user.role === "ADMIN") {
      return { allowed: true };
    }

    // Match by phone or name
    const matchesPhone = user.phone && orderCustomerPhone && user.phone.replace(/\s+/g, "") === orderCustomerPhone.replace(/\s+/g, "");
    const matchesName = user.name && orderCustomerName && user.name.toLowerCase().trim() === orderCustomerName.toLowerCase().trim();

    if (matchesPhone || matchesName) {
      return { allowed: true };
    }

    return {
      allowed: false,
      reason: "Access Denied: You do not have permission to view another customer's order records.",
    };
  }

  /**
   * Check if a user is permitted to view a seller's private sales analytics, revenue, or customer data.
   * - ADMIN can view platform metrics.
   * - SELLER / BUSINESS_OWNER can only view their own registered business.
   * - General customers cannot access any merchant's revenue or internal store orders.
   */
  static canAccessSellerData(user: AIUserContext | undefined, requestedStoreName?: string): PermissionCheckResult {
    if (!user || !user.role) {
      return {
        allowed: false,
        reason: "You must be signed in as a verified merchant to access store analytics and inventory data.",
      };
    }

    if (user.role === "ADMIN") {
      return { allowed: true };
    }

    if (user.role !== "SELLER" && user.role !== "BUSINESS_OWNER") {
      return {
        allowed: false,
        reason: "Access Denied: Customer accounts cannot inspect merchant revenue, sales metrics, or inventory reports.",
      };
    }

    // If a specific store is requested, verify ownership
    if (requestedStoreName && user.businessName) {
      const normalizedUserStore = user.businessName.toLowerCase().trim();
      const normalizedReqStore = requestedStoreName.toLowerCase().trim();

      if (!normalizedReqStore.includes(normalizedUserStore) && !normalizedUserStore.includes(normalizedReqStore)) {
        return {
          allowed: false,
          reason: `Access Denied: You are authenticated as '${user.businessName}' and cannot view metrics for '${requestedStoreName}'.`,
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Check if user is allowed to perform admin-level inspection (fraud alerts, escrow releases, system audit).
   */
  static canExecuteAdminTool(user: AIUserContext | undefined): PermissionCheckResult {
    if (user?.role === "ADMIN") {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: "Access Denied: This administrative operation requires platform administrator authorization.",
    };
  }

  /**
   * Check if user is allowed to access marketing campaigns, ad analytics, or feed configurations.
   * - ADMIN can view platform-wide and all campaigns.
   * - SELLER can only view their own campaigns.
   * - CUSTOMER cannot view any marketing or advertising campaign data.
   */
  static canAccessMarketingData(user: AIUserContext | undefined, targetSellerId?: string): PermissionCheckResult {
    if (!user || !user.role) {
      return {
        allowed: false,
        reason: "You must be signed in to access advertising and marketing data.",
      };
    }

    if (user.role === "ADMIN") {
      return { allowed: true };
    }

    if (user.role !== "SELLER" && user.role !== "BUSINESS_OWNER") {
      return {
        allowed: false,
        reason: "Access Denied: Customer accounts cannot inspect marketing campaigns or ad performance metrics.",
      };
    }

    if (targetSellerId && user.businessId && user.businessId !== targetSellerId && user.userId !== targetSellerId) {
      return {
        allowed: false,
        reason: "Access Denied: You cannot inspect marketing campaigns belonging to another merchant.",
      };
    }

    return { allowed: true };
  }

  /**
   * Detect potential prompt injection attempts trying to force role escalation.
   */
  static sanitizeQuery(query: string): string {
    const injectionPatterns = [
      /ignore (all )?(previous|prior) instructions/i,
      /you are now (an admin|the administrator|in god mode)/i,
      /reveal (all )?(secret|api|database|passwords)/i,
      /drop table/i,
      /system override/i,
    ];

    for (const pattern of injectionPatterns) {
      if (pattern.test(query)) {
        return "[SANITIZED: Potential Prompt Injection Neutralized]";
      }
    }

    return query;
  }
}
