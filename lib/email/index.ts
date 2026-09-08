import nodemailer, { type Transporter } from "nodemailer";
import fs from "fs";
import path from "path";
import {
  getPasswordResetEmailTemplate,
  getEmailVerificationTemplate,
  PasswordResetEmailProps,
  EmailVerificationProps,
} from "./templates";

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  provider: "SMTP" | "LOCAL_SPOOL";
  previewUrl?: string;
  resetUrl?: string;
  error?: string;
}

export interface SentEmailRecord {
  id: string;
  to: string;
  subject: string;
  type: "PASSWORD_RESET" | "EMAIL_VERIFICATION" | "NOTIFICATION" | "CUSTOM";
  text: string;
  html: string;
  sentAt: string;
  provider: "SMTP" | "LOCAL_SPOOL";
  previewUrl?: string;
  token?: string;
}

export interface SmtpDiagnosticResult {
  configured: boolean;
  connected: boolean;
  host?: string;
  port?: number;
  secure?: boolean;
  user?: string;
  error?: string;
}

const SPOOL_FILE_PATH = path.join(process.cwd(), "data", "sent-emails.json");

// In-memory cache for recent sent emails
declare global {
  var __VENDLEX_EMAIL_SPOOL: SentEmailRecord[] | undefined;
}

function getSpool(): SentEmailRecord[] {
  if (global.__VENDLEX_EMAIL_SPOOL) {
    return global.__VENDLEX_EMAIL_SPOOL;
  }
  try {
    if (fs.existsSync(SPOOL_FILE_PATH)) {
      const raw = fs.readFileSync(SPOOL_FILE_PATH, "utf-8");
      global.__VENDLEX_EMAIL_SPOOL = JSON.parse(raw);
      return global.__VENDLEX_EMAIL_SPOOL || [];
    }
  } catch (err) {
    console.warn("[Email Spool Load Warning]:", err);
  }
  global.__VENDLEX_EMAIL_SPOOL = [];
  return global.__VENDLEX_EMAIL_SPOOL;
}

function persistSpool(record: SentEmailRecord): void {
  const spool = getSpool();
  spool.unshift(record);
  // Keep last 100 sent emails
  if (spool.length > 100) spool.pop();
  try {
    const dir = path.dirname(SPOOL_FILE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SPOOL_FILE_PATH, JSON.stringify(spool, null, 2), "utf-8");
  } catch (err) {
    console.warn("[Email Spool Save Warning]:", err);
  }
}

/**
 * Get base URL for email link generation
 */
export function getAppBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.APP_URL) {
    return process.env.APP_URL.replace(/\/$/, "");
  }
  return process.env.NODE_ENV === "production" ? "https://vendlex.co.ke" : "http://localhost:3000";
}

/**
 * Creates configured nodemailer transport or returns null if not configured
 */
export function createTransportInstance(): Transporter | null {
  const host = (process.env.SMTP_HOST || "").trim();
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = (process.env.SMTP_USER || "").replace(/\s+/g, "");
  const pass = (process.env.SMTP_PASS || "").replace(/\s+/g, "");
  const secure = process.env.SMTP_SECURE === "true" || port === 465;

  if (host && user && pass) {
    // If Gmail specific
    if (host.includes("gmail.com") || host === "gmail" || user.endsWith("@gmail.com")) {
      return nodemailer.createTransport({
        service: "gmail",
        auth: { user, pass },
        connectionTimeout: 10000,
        greetingTimeout: 5000,
        socketTimeout: 15000,
        tls: {
          rejectUnauthorized: false,
        },
      });
    }

    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      connectionTimeout: 10000,
      greetingTimeout: 5000,
      socketTimeout: 15000,
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  return null;
}

/**
 * Test & verify live SMTP connection credentials
 */
export async function verifySmtpConnection(): Promise<SmtpDiagnosticResult> {
  const host = (process.env.SMTP_HOST || "").trim();
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = (process.env.SMTP_USER || "").trim();
  const secure = process.env.SMTP_SECURE === "true" || port === 465;

  if (!host || !user) {
    return {
      configured: false,
      connected: false,
      host,
      port,
      secure,
      user: user ? `${user.slice(0, 3)}***` : undefined,
      error: "SMTP credentials not configured in environment variables (SMTP_HOST, SMTP_USER, SMTP_PASS). Using Local Spooler.",
    };
  }

  const transport = createTransportInstance();
  if (!transport) {
    return {
      configured: false,
      connected: false,
      error: "Failed to initialize SMTP transporter instance.",
    };
  }

  try {
    await transport.verify();
    return {
      configured: true,
      connected: true,
      host,
      port,
      secure,
      user: `${user.slice(0, 3)}***`,
    };
  } catch (err: any) {
    return {
      configured: true,
      connected: false,
      host,
      port,
      secure,
      user: `${user.slice(0, 3)}***`,
      error: err?.message || "SMTP connection verification failed.",
    };
  }
}

/**
 * Low-level email sender supporting live SMTP with automatic dev spool fallback
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  type = "CUSTOM",
  token,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
  type?: SentEmailRecord["type"];
  token?: string;
}): Promise<SendEmailResult> {
  const from = process.env.EMAIL_FROM || '"VendLex Security" <no-reply@vendlex.co.ke>';
  const transport = createTransportInstance();
  const id = `mail-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  if (transport) {
    try {
      const info = await transport.sendMail({ from, to, subject, html, text });
      persistSpool({
        id,
        to,
        subject,
        type,
        text,
        html,
        sentAt: new Date().toISOString(),
        provider: "SMTP",
        token,
      });
      console.log(`[Email Sent via SMTP]: To: ${to} | Subject: "${subject}" | MessageId: ${info.messageId}`);
      return { success: true, messageId: info.messageId, provider: "SMTP" };
    } catch (err: any) {
      console.error("[Email SMTP Dispatch Error]:", err?.message);
      // Fallback to spooling so user flow is not interrupted
    }
  }

  // Local spool & console fallback
  persistSpool({
    id,
    to,
    subject,
    type,
    text,
    html,
    sentAt: new Date().toISOString(),
    provider: "LOCAL_SPOOL",
    token,
  });

  console.log(`\n======================================================`);
  console.log(`📧 [VENDLEX EMAIL DISPATCHED]`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Type: ${type}`);
  console.log(`Provider: LOCAL_SPOOL (Dev / Test)`);
  console.log(`------------------------------------------------------`);
  console.log(text);
  console.log(`======================================================\n`);

  return { success: true, messageId: id, provider: "LOCAL_SPOOL" };
}

/**
 * Send Password Reset Email with Token Link
 */
export async function sendPasswordResetEmail({
  to,
  name,
  token,
  ipAddress,
}: {
  to: string;
  name?: string;
  token: string;
  ipAddress?: string;
}): Promise<SendEmailResult> {
  const baseUrl = getAppBaseUrl();
  const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;

  const { subject, html, text } = getPasswordResetEmailTemplate({
    recipientName: name,
    resetUrl,
    token,
    expiresInMinutes: 60,
    ipAddress,
  });

  const sendResult = await sendEmail({
    to,
    subject,
    html,
    text,
    type: "PASSWORD_RESET",
    token,
  });

  return {
    ...sendResult,
    resetUrl,
  };
}

/**
 * Send Email Verification Email with Token Link
 */
export async function sendEmailVerificationEmail({
  to,
  name,
  token,
}: {
  to: string;
  name?: string;
  token: string;
}): Promise<SendEmailResult> {
  const baseUrl = getAppBaseUrl();
  const verificationUrl = `${baseUrl}/verify-email?token=${encodeURIComponent(token)}`;

  const { subject, html, text } = getEmailVerificationTemplate({
    recipientName: name,
    verificationUrl,
    token,
    expiresInHours: 24,
  });

  const sendResult = await sendEmail({
    to,
    subject,
    html,
    text,
    type: "EMAIL_VERIFICATION",
    token,
  });

  return {
    ...sendResult,
    resetUrl: verificationUrl,
  };
}

/**
 * Retrieve recent sent emails from spool
 */
export function getSentEmails(): SentEmailRecord[] {
  return getSpool();
}

/**
 * Retrieve latest email for a specific recipient
 */
export function getLatestEmailForRecipient(email: string): SentEmailRecord | undefined {
  const spool = getSpool();
  const cleanEmail = email.toLowerCase().trim();
  return spool.find((e) => e.to.toLowerCase().trim() === cleanEmail);
}

/**
 * Clear email spool (useful for tests)
 */
export function clearSentEmails(): void {
  global.__VENDLEX_EMAIL_SPOOL = [];
  try {
    if (fs.existsSync(SPOOL_FILE_PATH)) {
      fs.unlinkSync(SPOOL_FILE_PATH);
    }
  } catch (err) {
    console.warn("[Email Spool Clear Warning]:", err);
  }
}
