import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/session";
import { getSentEmails, sendEmail, verifySmtpConnection, clearSentEmails } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = requireRole(req, ["ADMIN", "SUPER_ADMIN"]);
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(req.url);
    const recipient = searchParams.get("to");
    const checkSmtp = searchParams.get("checkSmtp") === "true";

    let emails = getSentEmails();
    if (recipient) {
      emails = emails.filter((e) => e.to.toLowerCase().includes(recipient.toLowerCase().trim()));
    }

    let smtpStatus = undefined;
    if (checkSmtp) {
      smtpStatus = await verifySmtpConnection();
    }

    return NextResponse.json({
      success: true,
      count: emails.length,
      emails,
      smtpStatus,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = requireRole(req, ["ADMIN", "SUPER_ADMIN"]);
    if (auth instanceof NextResponse) return auth;

    const body = await req.json();
    const { to, subject, html, text, type, isTest } = body;

    if (!to) {
      return NextResponse.json({ success: false, error: "Recipient 'to' email address is required." }, { status: 400 });
    }

    const testSubject = subject || "VendLex Kenya — Transactional Email Delivery Test";
    const testHtml = html || `
      <div style="font-family: sans-serif; padding: 20px; color: #1E293B;">
        <h2 style="color: #087F5B;">VendLex Kenya Email Test Dispatch</h2>
        <p>This is a live transactional email test sent at <strong>${new Date().toLocaleString()}</strong>.</p>
        <p>If you are receiving this message in your inbox, your SMTP configuration is operational!</p>
        <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748B;">VendLex Technologies Kenya Ltd.</p>
      </div>
    `;
    const testText = text || `VendLex Kenya Email Test Dispatch\n\nSent at ${new Date().toLocaleString()}.\nIf you see this, email sending is working!`;

    const result = await sendEmail({
      to,
      subject: testSubject,
      html: testHtml,
      text: testText,
      type: type || (isTest ? "NOTIFICATION" : "CUSTOM"),
    });

    const smtpStatus = await verifySmtpConnection();

    return NextResponse.json({
      success: true,
      result,
      smtpStatus,
      message: `Email dispatched to ${to} via ${result.provider}.`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = requireRole(req, ["ADMIN", "SUPER_ADMIN"]);
    if (auth instanceof NextResponse) return auth;

    clearSentEmails();
    return NextResponse.json({ success: true, message: "Email spool cleared." });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
