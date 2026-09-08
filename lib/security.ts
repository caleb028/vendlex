/**
 * VendLex Security & Defensive Utilities
 * Provides input validation, sanitization, rate limiting, PII masking, and constant-time comparison helpers.
 * Fully compatible with both Node.js and Next.js Edge Runtime.
 */

// ============================================================================
// 1. RATE LIMITING (Sliding Window In-Memory Limiter)
// ============================================================================
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * Check if an identifier (e.g. IP address or phone number) exceeds the rate limit.
 * @param key Unique key to identify client / action (e.g. `ip:192.168.1.1:stkpush`)
 * @param limit Max allowed requests within window
 * @param windowMs Window duration in milliseconds (default 60s)
 */
export function checkRateLimit(
  key: string,
  limit: number = 10,
  windowMs: number = 60 * 1000
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetTime: now + windowMs };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }

  record.count += 1;
  return { allowed: true, remaining: limit - record.count, resetTime: record.resetTime };
}

// Clean up stale rate limit entries periodically
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of rateLimitStore.entries()) {
      if (now > v.resetTime) {
        rateLimitStore.delete(k);
      }
    }
  }, 5 * 60 * 1000);
}

// ============================================================================
// 2. INPUT VALIDATION & SANITIZATION (Anti-XSS / Injection)
// ============================================================================

/**
 * Kenyan phone number regex validation.
 * Accepts: +254712345678, 254712345678, 0712345678, 0112345678, 712345678, 112345678
 */
const KENYA_PHONE_REGEX = /^(?:254|\+254|0)?([17]\d{8})$/;

export function isValidKenyanPhone(phone: string): boolean {
  if (!phone || typeof phone !== "string") return false;
  return KENYA_PHONE_REGEX.test(phone.trim().replace(/[\s-]/g, ""));
}

/**
 * Sanitize string to prevent Cross-Site Scripting (XSS) and parameter injection.
 */
export function sanitizeInput(input: string, maxLength: number = 255): string {
  if (!input || typeof input !== "string") return "";
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>'"`;\\]/g, (char) => {
      switch (char) {
        case "<": return "&lt;";
        case ">": return "&gt;";
        case "'": return "&#39;";
        case '"': return "&quot;";
        case "`": return "&#96;";
        case ";": return "";
        case "\\": return "";
        default: return "";
      }
    });
}

/**
 * Validate numeric amount within reasonable M-Pesa business boundaries.
 * Safaricom transaction limits: Min KSh 1, Max KSh 300,000 per transaction.
 */
export function validateTransactionAmount(
  amount: any,
  min: number = 1,
  max: number = 300000
): { valid: boolean; amount?: number; error?: string } {
  const num = typeof amount === "number" ? amount : parseFloat(String(amount));
  if (isNaN(num) || !isFinite(num)) {
    return { valid: false, error: "Invalid numeric amount." };
  }
  if (num < min) {
    return { valid: false, error: `Amount must be at least KSh ${min}.` };
  }
  if (num > max) {
    return { valid: false, error: `Amount exceeds maximum limit of KSh ${max.toLocaleString()}.` };
  }
  return { valid: true, amount: Math.round(num * 100) / 100 };
}

// ============================================================================
// 3. PII & DATA PROTECTION (GDPR / Kenya Data Protection Act 2019)
// ============================================================================

/**
 * Mask Kenyan phone number for safe display and logging (e.g. "254712***678").
 */
export function maskPhoneNumber(phone: string): string {
  if (!phone || phone.length < 8) return "***";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length < 6) return "***";
  const prefix = cleaned.slice(0, 5);
  const suffix = cleaned.slice(-3);
  return `${prefix}***${suffix}`;
}

/**
 * Mask email address (e.g. "ke***@nairobihub.co.ke").
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return "***@***";
  const [local, domain] = email.split("@");
  if (local.length <= 2) return `${local[0]}*@${domain}`;
  return `${local.slice(0, 2)}***@${domain}`;
}

// ============================================================================
// 4. TIMING-SAFE CONSTANT-TIME COMPARISON (Edge & Node Compatible)
// ============================================================================

/**
 * Constant-time string comparison to mitigate timing attacks on webhook secrets / tokens.
 */
export function timingSafeCompare(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
