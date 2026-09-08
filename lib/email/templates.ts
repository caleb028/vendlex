/**
 * VendLex Kenya — Branded HTML Email Templates
 * Visual Identity: Brand Emerald (#087F5B), Deep Navy (#0B1F33), Gold Accent (#D4A72C)
 * Slogan: SHOP • GROW • PROSPER
 */

interface BaseEmailProps {
  recipientName?: string;
  preheader?: string;
}

export interface PasswordResetEmailProps extends BaseEmailProps {
  resetUrl: string;
  token: string;
  expiresInMinutes?: number;
  ipAddress?: string;
}

export interface EmailVerificationProps extends BaseEmailProps {
  verificationUrl: string;
  token: string;
  expiresInHours?: number;
}

export interface OrderConfirmationEmailProps extends BaseEmailProps {
  orderNumber: string;
  totalAmount: number;
  paymentMethod: string;
  mpesaReceipt?: string;
  county: string;
  town: string;
  items: Array<{
    productTitle: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
}

function emailWrapper(title: string, preheader: string, contentHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; color: #1E293B; }
    .btn-primary:hover { background-color: #066649 !important; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC;">
  <!-- Preheader text for email clients -->
  <div style="display: none; font-size: 1px; color: #F8FAFC; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${preheader}
  </div>

  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; padding: 30px 15px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); border: 1px solid #E2E8F0;">
          
          <!-- Header Banner -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #0B1F33 0%, #087F5B 100%); padding: 32px 20px 28px;">
              <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <div style="font-size: 26px; font-weight: 900; letter-spacing: 2px; color: #FFFFFF; text-transform: uppercase;">
                      VEND<span style="color: #F0C75E;">LEX</span>
                    </div>
                    <div style="font-size: 9px; font-weight: 700; letter-spacing: 3px; color: #D4A72C; margin-top: 4px; text-transform: uppercase;">
                      SHOP &bull; GROW &bull; PROSPER
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Gold Accent Stripe -->
          <tr>
            <td style="height: 3px; background: linear-gradient(90deg, #D4A72C 0%, #F0C75E 50%, #D4A72C 100%);"></td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 36px 32px 28px;">
              ${contentHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F1F5F9; padding: 24px 32px; border-top: 1px solid #E2E8F0; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 12px; color: #64748B; line-height: 1.5;">
                This is an automated system notification from <strong>VendLex Kenya</strong>.
              </p>
              <p style="margin: 0; font-size: 11px; color: #94A3B8;">
                &copy; 2026 VendLex Technologies Kenya Ltd. All rights reserved. &bull; Nairobi, Kenya 🇰🇪
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Generate Password Reset Email HTML
 */
export function getPasswordResetEmailTemplate(props: PasswordResetEmailProps): { subject: string; html: string; text: string } {
  const recipient = props.recipientName || "VendLex User";
  const expiresIn = props.expiresInMinutes || 60;
  const subject = "Reset Your VendLex Kenya Password";
  const preheader = `Password reset request for your VendLex account. Link expires in ${expiresIn} minutes.`;

  const content = `
    <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 800; color: #0B1F33;">
      Password Reset Request
    </h2>
    <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #334155;">
      Hello <strong>${recipient}</strong>,
    </p>
    <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #334155;">
      We received a request to reset the password for your VendLex account. Click the button below to choose a new password:
    </p>

    <!-- Primary Action Button -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 28px;">
      <tr>
        <td align="center">
          <a href="${props.resetUrl}" class="btn-primary" style="display: inline-block; background-color: #087F5B; color: #FFFFFF; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 10px; box-shadow: 0 4px 12px rgba(8, 127, 91, 0.25); text-align: center;">
            Reset My Password &rarr;
          </a>
        </td>
      </tr>
    </table>

    <!-- Security Information Box -->
    <div style="background-color: #FEF3C7; border: 1px solid #FDE68A; border-radius: 10px; padding: 14px 16px; margin: 0 0 24px;">
      <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #92400E;">
        <strong>Security Notice:</strong> This password reset link is valid for <strong>${expiresIn} minutes</strong>. If you did not request this change, please ignore this email or contact support if you suspect unauthorized activity.
      </p>
    </div>

    <!-- Plain Text URL Fallback -->
    <p style="margin: 0 0 8px; font-size: 12px; color: #64748B;">
      If the button above does not work, copy and paste the following URL into your web browser:
    </p>
    <p style="margin: 0; font-size: 11px; word-break: break-all; color: #087F5B; background-color: #F8FAFC; padding: 10px; border-radius: 6px; border: 1px dashed #CBD5E1;">
      <a href="${props.resetUrl}" style="color: #087F5B; text-decoration: underline;">${props.resetUrl}</a>
    </p>
  `;

  const text = `Password Reset Request - VendLex Kenya

Hello ${recipient},

We received a request to reset your password for your VendLex account.
Please visit the link below to set a new password (valid for ${expiresIn} minutes):

${props.resetUrl}

If you did not request this change, please ignore this message.

© 2026 VendLex Technologies Kenya Ltd.`;

  return {
    subject,
    html: emailWrapper("Reset Your Password — VendLex Kenya", preheader, content),
    text,
  };
}

/**
 * Generate Email Verification Email HTML
 */
export function getEmailVerificationTemplate(props: EmailVerificationProps): { subject: string; html: string; text: string } {
  const recipient = props.recipientName || "VendLex Member";
  const expiresInHours = props.expiresInHours || 24;
  const subject = "Verify Your VendLex Kenya Email Address";
  const preheader = `Confirm your email to unlock all features on VendLex Kenya.`;

  const content = `
    <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 800; color: #0B1F33;">
      Karibu VendLex! Please Verify Your Email
    </h2>
    <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #334155;">
      Hello <strong>${recipient}</strong>,
    </p>
    <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #334155;">
      Thank you for joining VendLex Kenya. To activate your account and access verified marketplace features, seller tools, and Lipa na M-Pesa escrow protection, please verify your email address:
    </p>

    <!-- Primary Action Button -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 28px;">
      <tr>
        <td align="center">
          <a href="${props.verificationUrl}" class="btn-primary" style="display: inline-block; background-color: #087F5B; color: #FFFFFF; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 10px; box-shadow: 0 4px 12px rgba(8, 127, 91, 0.25); text-align: center;">
            Verify Email Address &rarr;
          </a>
        </td>
      </tr>
    </table>

    <!-- Info Box -->
    <div style="background-color: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 10px; padding: 14px 16px; margin: 0 0 24px;">
      <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #065F46;">
        This verification link remains valid for <strong>${expiresInHours} hours</strong>. Once verified, you will enjoy full merchant verification and instant order updates.
      </p>
    </div>

    <!-- Plain Text URL Fallback -->
    <p style="margin: 0 0 8px; font-size: 12px; color: #64748B;">
      If the button above does not work, copy and paste this link into your browser:
    </p>
    <p style="margin: 0; font-size: 11px; word-break: break-all; color: #087F5B; background-color: #F8FAFC; padding: 10px; border-radius: 6px; border: 1px dashed #CBD5E1;">
      <a href="${props.verificationUrl}" style="color: #087F5B; text-decoration: underline;">${props.verificationUrl}</a>
    </p>
  `;

  const text = `Verify Your Email Address - VendLex Kenya

Hello ${recipient},

Thank you for joining VendLex Kenya.
Please verify your email address using the link below:

${props.verificationUrl}

This link is valid for ${expiresInHours} hours.

© 2026 VendLex Technologies Kenya Ltd.`;

  return {
    subject,
    html: emailWrapper("Verify Your Email — VendLex Kenya", preheader, content),
    text,
  };
}
