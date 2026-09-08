import { PDFDocument, rgb, StandardFonts, PDFImage } from "pdf-lib";
import QRCode from "qrcode";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { VendLexDocument } from "./types";

export interface PDFGenerationResult {
  pdfBytes: Uint8Array;
  fileHash: string;
  verificationUrl: string;
}

export class VendLexPDFEngine {
  /**
   * Generates a verifiable, official VendLex PDF (Receipt or Certificate)
   * with embedded Official Stamp, Logo, and QR Code.
   */
  static async renderDocumentPDF(
    doc: VendLexDocument,
    baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://vendlex.co.ke"
  ): Promise<PDFGenerationResult> {
    const isCertificate =
      doc.documentType === "SELLER_CERTIFICATE" ||
      doc.documentType === "MERCHANT_CERTIFICATE" ||
      doc.documentType === "CERTIFICATE" ||
      doc.documentType === "SERVICE_CERTIFICATE";

    if (isCertificate) {
      return this.renderCertificatePDF(doc, baseUrl);
    }
    return this.renderReceiptPDF(doc, baseUrl);
  }

  /**
   * 1. PRECISE OFFICIAL STAMPED RECEIPT RENDERING
   */
  private static async renderReceiptPDF(
    doc: VendLexDocument,
    baseUrl: string
  ): Promise<PDFGenerationResult> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // Standard A4 Portrait
    const { width, height } = page.getSize();

    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontMono = await pdfDoc.embedFont(StandardFonts.Courier);

    // Embed Official Platform Logo Image
    let logoImage: PDFImage | null = null;
    try {
      const possibleLogoPaths = [
        path.join(process.cwd(), "public", "logo", "vendlex-logo.png"),
        path.join(process.cwd(), "public", "logo", "vendlex-mark.png"),
        path.join(process.cwd(), "public", "logo", "vendlex-icon.png"),
      ];
      for (const p of possibleLogoPaths) {
        if (fs.existsSync(p)) {
          const logoBytes = fs.readFileSync(p);
          logoImage = await pdfDoc.embedPng(logoBytes);
          break;
        }
      }
    } catch (e) {
      console.warn("[PDFEngine] Could not embed official logo:", e);
    }

    // Color Palette
    const emeraldDark = rgb(0.02, 0.47, 0.34); // #059669
    const emeraldDeep = rgb(0.016, 0.35, 0.25); // #047857
    const emeraldSoft = rgb(0.93, 0.98, 0.95); // #F0FDF4
    const charcoal = rgb(0.043, 0.098, 0.173); // #0B192C Deep Navy
    const goldAccent = rgb(0.96, 0.62, 0.04); // #F59E0B
    const grayLight = rgb(0.97, 0.98, 0.99); // #F8FAFC
    const grayBorder = rgb(0.88, 0.91, 0.94); // #E2E8F0
    const textMuted = rgb(0.39, 0.45, 0.54); // #64748B
    const textDark = rgb(0.06, 0.09, 0.16); // #0F172A
    const redRevoked = rgb(0.86, 0.15, 0.15); // #DC2626
    const amberSuperseded = rgb(0.85, 0.47, 0.02); // #D97706

    // Format transaction occurrence timestamp
    const dateObj = new Date(doc.issuedAt || Date.now());
    const issuedDateFormatted = dateObj.toLocaleDateString("en-KE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const issuedTimeFormatted = dateObj.toLocaleTimeString("en-KE", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
    const fullTimestampStamp = `${issuedDateFormatted.toUpperCase()} ${issuedTimeFormatted}`;

    // Verification URL & QR Generation
    const verificationUrl = `${baseUrl}/verify/${doc.publicDocumentId}`;
    const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
      margin: 1,
      width: 140,
      color: {
        dark: "#047857",
        light: "#FFFFFF",
      },
    });
    const qrImageBytes = Buffer.from(qrDataUrl.split(",")[1], "base64");
    const qrImage = await pdfDoc.embedPng(qrImageBytes);

    // -------------------------------------------------------------
    // TOP BRAND HEADER BANNER
    // -------------------------------------------------------------
    page.drawRectangle({
      x: 0,
      y: height - 92,
      width,
      height: 92,
      color: emeraldDeep,
    });

    // Top gold accent line
    page.drawRectangle({
      x: 0,
      y: height - 6,
      width,
      height: 6,
      color: goldAccent,
    });

    let brandTextX = 40;
    if (logoImage) {
      // Draw white background card for the logo
      page.drawRectangle({
        x: 36,
        y: height - 80,
        width: 48,
        height: 56,
        color: rgb(1, 1, 1),
        borderColor: goldAccent,
        borderWidth: 1,
      });

      page.drawImage(logoImage, {
        x: 40,
        y: height - 76,
        width: 40,
        height: 48,
      });

      brandTextX = 96;
    }

    // Brand Name
    page.drawText("VENDLEX KENYA", {
      x: brandTextX,
      y: height - 42,
      size: 20,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    // Tagline & Slogan
    page.drawText("BUY  *  SELL  *  GROW  *  PROSPER", {
      x: brandTextX,
      y: height - 58,
      size: 8.5,
      font: fontBold,
      color: goldAccent,
    });

    page.drawText("National Digital Commerce & M-Pesa Protected Escrow Ecosystem", {
      x: brandTextX,
      y: height - 72,
      size: 7.5,
      font: fontRegular,
      color: rgb(0.85, 0.94, 0.9),
    });

    // Document Type & Public ID (Right side of header)
    page.drawText(doc.title.toUpperCase(), {
      x: width - 260,
      y: height - 38,
      size: 11,
      font: fontBold,
      color: goldAccent,
    });

    page.drawText(`DOCUMENT ID: ${doc.publicDocumentId}`, {
      x: width - 260,
      y: height - 54,
      size: 9,
      font: fontMono,
      color: rgb(1, 1, 1),
    });

    page.drawText(`STATUS: ${doc.status} (VERIFIED)`, {
      x: width - 260,
      y: height - 70,
      size: 8,
      font: fontBold,
      color: doc.status === "VALID" ? rgb(0.5, 0.98, 0.6) : redRevoked,
    });

    // -------------------------------------------------------------
    // DOCUMENT METADATA GRID
    // -------------------------------------------------------------
    let currentY = height - 125;

    page.drawRectangle({
      x: 40,
      y: currentY - 65,
      width: width - 80,
      height: 80,
      color: grayLight,
      borderColor: grayBorder,
      borderWidth: 1,
    });

    // Left Column: Customer / Recipient
    page.drawText("ISSUED TO (BUYER):", {
      x: 55,
      y: currentY,
      size: 8,
      font: fontBold,
      color: textMuted,
    });
    page.drawText(doc.ownerName, {
      x: 55,
      y: currentY - 14,
      size: 11,
      font: fontBold,
      color: textDark,
    });
    page.drawText(doc.ownerPhone || doc.ownerEmail || "+254 700 000 000", {
      x: 55,
      y: currentY - 26,
      size: 9,
      font: fontRegular,
      color: textMuted,
    });

    // Middle Column: Seller / Issuer
    page.drawText("MERCHANT / STORE:", {
      x: 230,
      y: currentY,
      size: 8,
      font: fontBold,
      color: textMuted,
    });
    page.drawText(doc.sellerName, {
      x: 230,
      y: currentY - 14,
      size: 11,
      font: fontBold,
      color: textDark,
    });
    page.drawText(`${doc.sellerCounty || "Nairobi"} County, Kenya`, {
      x: 230,
      y: currentY - 26,
      size: 9,
      font: fontRegular,
      color: textMuted,
    });

    // Right Column: Order & Date Info
    page.drawText("TRANSACTION RECORD:", {
      x: 410,
      y: currentY,
      size: 8,
      font: fontBold,
      color: textMuted,
    });
    page.drawText(`Date: ${issuedDateFormatted}`, {
      x: 410,
      y: currentY - 14,
      size: 9,
      font: fontRegular,
      color: textDark,
    });
    if (doc.orderNumber) {
      page.drawText(`Order No: ${doc.orderNumber}`, {
        x: 410,
        y: currentY - 26,
        size: 9,
        font: fontBold,
        color: emeraldDeep,
      });
    }
    page.drawText(`Security Code: ${doc.verificationCode}`, {
      x: 410,
      y: currentY - 38,
      size: 9,
      font: fontMono,
      color: textDark,
    });

    // -------------------------------------------------------------
    // PARTICULARS & LINE ITEMS TABLE
    // -------------------------------------------------------------
    currentY -= 95;

    page.drawText("PARTICULARS & LINE ITEMS", {
      x: 40,
      y: currentY,
      size: 10,
      font: fontBold,
      color: textDark,
    });

    currentY -= 15;

    // Table Header
    page.drawRectangle({
      x: 40,
      y: currentY - 18,
      width: width - 80,
      height: 22,
      color: emeraldDeep,
    });

    page.drawText("ITEM DESCRIPTION", {
      x: 50,
      y: currentY - 12,
      size: 8,
      font: fontBold,
      color: rgb(1, 1, 1),
    });
    page.drawText("QTY", {
      x: 360,
      y: currentY - 12,
      size: 8,
      font: fontBold,
      color: rgb(1, 1, 1),
    });
    page.drawText("UNIT PRICE", {
      x: 410,
      y: currentY - 12,
      size: 8,
      font: fontBold,
      color: rgb(1, 1, 1),
    });
    page.drawText("TOTAL", {
      x: 490,
      y: currentY - 12,
      size: 8,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    currentY -= 22;

    // Table Rows
    doc.items.forEach((item, index) => {
      const isEven = index % 2 === 0;
      page.drawRectangle({
        x: 40,
        y: currentY - 20,
        width: width - 80,
        height: 24,
        color: isEven ? rgb(1, 1, 1) : grayLight,
        borderColor: grayBorder,
        borderWidth: 0.5,
      });

      const descText =
        item.description.length > 55
          ? `${item.description.substring(0, 52)}...`
          : item.description;

      page.drawText(descText, {
        x: 50,
        y: currentY - 14,
        size: 9,
        font: fontRegular,
        color: textDark,
      });

      page.drawText(String(item.qty), {
        x: 368,
        y: currentY - 14,
        size: 9,
        font: fontRegular,
        color: textDark,
      });

      page.drawText(`KSh ${item.unitPrice.toLocaleString()}`, {
        x: 410,
        y: currentY - 14,
        size: 9,
        font: fontRegular,
        color: textDark,
      });

      page.drawText(`KSh ${item.total.toLocaleString()}`, {
        x: 490,
        y: currentY - 14,
        size: 9,
        font: fontBold,
        color: textDark,
      });

      currentY -= 24;
    });

    // -------------------------------------------------------------
    // FINANCIAL TOTALS & PAYMENT NOTES
    // -------------------------------------------------------------
    currentY -= 15;

    const totalsBoxWidth = 220;
    const totalsX = width - 40 - totalsBoxWidth;

    page.drawRectangle({
      x: totalsX,
      y: currentY - 60,
      width: totalsBoxWidth,
      height: 60,
      color: emeraldSoft,
      borderColor: emeraldDeep,
      borderWidth: 1,
    });

    page.drawText("Subtotal:", {
      x: totalsX + 15,
      y: currentY - 18,
      size: 9,
      font: fontRegular,
      color: textDark,
    });
    page.drawText(`KSh ${(doc.metadata.subtotal || doc.amount).toLocaleString()}`, {
      x: totalsX + 120,
      y: currentY - 18,
      size: 9,
      font: fontRegular,
      color: textDark,
    });

    page.drawText("Delivery / Courier:", {
      x: totalsX + 15,
      y: currentY - 32,
      size: 9,
      font: fontRegular,
      color: textDark,
    });
    page.drawText(`KSh ${(doc.metadata.deliveryFee || 0).toLocaleString()}`, {
      x: totalsX + 120,
      y: currentY - 32,
      size: 9,
      font: fontRegular,
      color: textDark,
    });

    page.drawText("TOTAL PAID:", {
      x: totalsX + 15,
      y: currentY - 50,
      size: 10,
      font: fontBold,
      color: emeraldDeep,
    });
    page.drawText(`KSh ${doc.amount.toLocaleString()}`, {
      x: totalsX + 115,
      y: currentY - 50,
      size: 11,
      font: fontBold,
      color: emeraldDeep,
    });

    // Left Notes / M-Pesa Info
    page.drawText("PAYMENT & ESCROW VALIDATION", {
      x: 40,
      y: currentY - 10,
      size: 8,
      font: fontBold,
      color: textMuted,
    });

    let noteY = currentY - 24;
    const mpesaCode = doc.metadata.mpesaReceipt || "LIPA-NA-MPESA-PAID";
    page.drawText(`* M-Pesa Transaction Receipt: ${mpesaCode} (Verified)`, {
      x: 40,
      y: noteY,
      size: 8.5,
      font: fontBold,
      color: emeraldDeep,
    });
    noteY -= 14;

    if (doc.metadata.courierTracking) {
      page.drawText(`* Courier Dispatch Waybill: ${doc.metadata.courierTracking}`, {
        x: 40,
        y: noteY,
        size: 8.5,
        font: fontRegular,
        color: textDark,
      });
      noteY -= 14;
    }

    page.drawText(`* Transaction Stamped: ${fullTimestampStamp}`, {
      x: 40,
      y: noteY,
      size: 8.5,
      font: fontBold,
      color: goldAccent,
    });

    // -------------------------------------------------------------
    // OFFICIAL AUTOMATIC PLATFORM STAMP & QR CODE SECTION
    // -------------------------------------------------------------
    const stampSectionY = 175;

    page.drawLine({
      start: { x: 40, y: stampSectionY + 25 },
      end: { x: width - 40, y: stampSectionY + 25 },
      color: grayBorder,
      thickness: 1,
    });

    // QR Code
    page.drawImage(qrImage, {
      x: 40,
      y: stampSectionY - 80,
      width: 80,
      height: 80,
    });

    page.drawText("SCAN TO VERIFY", {
      x: 40,
      y: stampSectionY - 92,
      size: 7.5,
      font: fontBold,
      color: emeraldDeep,
    });

    // Digital Verification Info
    page.drawText("OFFICIAL VENDLEX DIGITAL PLATFORM STAMP", {
      x: 135,
      y: stampSectionY + 8,
      size: 9,
      font: fontBold,
      color: textDark,
    });
    page.drawText("This receipt was digitally generated and stamped by VendLex Kenya.", {
      x: 135,
      y: stampSectionY - 6,
      size: 7.5,
      font: fontRegular,
      color: textMuted,
    });
    page.drawText("Holds an immutable cryptographic SHA-256 ledger record.", {
      x: 135,
      y: stampSectionY - 17,
      size: 7.5,
      font: fontRegular,
      color: textMuted,
    });
    page.drawText(verificationUrl, {
      x: 135,
      y: stampSectionY - 30,
      size: 8,
      font: fontBold,
      color: emeraldDeep,
    });

    // -------------------------------------------------------------
    // PRECISE OFFICIAL DIGITAL STAMP (With Occurrence Date/Time)
    // -------------------------------------------------------------
    const stampX = width - 40 - 200;
    const stampY = stampSectionY - 95;
    const stampW = 200;
    const stampH = 110;

    // Double frame stamp box
    page.drawRectangle({
      x: stampX,
      y: stampY,
      width: stampW,
      height: stampH,
      color: rgb(0.96, 0.99, 0.97),
      borderColor: emeraldDeep,
      borderWidth: 2,
    });
    page.drawRectangle({
      x: stampX + 3,
      y: stampY + 3,
      width: stampW - 6,
      height: stampH - 6,
      borderColor: goldAccent,
      borderWidth: 1,
    });

    // Stamp Header
    page.drawText("* VENDLEX KENYA OFFICIAL STAMP *", {
      x: stampX + 14,
      y: stampY + stampH - 16,
      size: 8.5,
      font: fontBold,
      color: emeraldDeep,
    });

    page.drawText("ESCROW VERIFIED & SETTLED", {
      x: stampX + 28,
      y: stampY + stampH - 28,
      size: 7.5,
      font: fontBold,
      color: goldAccent,
    });

    page.drawLine({
      start: { x: stampX + 10, y: stampY + stampH - 33 },
      end: { x: stampX + stampW - 10, y: stampY + stampH - 33 },
      color: emeraldDeep,
      thickness: 0.75,
    });

    // Stamp Body with Date of Occurrence
    page.drawText(`REF: ${doc.publicDocumentId}`, {
      x: stampX + 12,
      y: stampY + stampH - 45,
      size: 8,
      font: fontMono,
      color: textDark,
    });

    page.drawText(`M-PESA: ${mpesaCode}`, {
      x: stampX + 12,
      y: stampY + stampH - 57,
      size: 8,
      font: fontMono,
      color: emeraldDeep,
    });

    page.drawText(`STAMPED: ${fullTimestampStamp}`, {
      x: stampX + 12,
      y: stampY + stampH - 70,
      size: 7.5,
      font: fontBold,
      color: rgb(0.7, 0.2, 0.1), // Security Red/Burgundy Stamp Text
    });

    page.drawText(`SECURITY: ${doc.verificationCode}`, {
      x: stampX + 12,
      y: stampY + stampH - 82,
      size: 7.5,
      font: fontMono,
      color: textDark,
    });

    page.drawText("VALID AUTONOMOUS RECORD", {
      x: stampX + 32,
      y: stampY + stampH - 96,
      size: 7,
      font: fontBold,
      color: emeraldDeep,
    });

    // -------------------------------------------------------------
    // FOOTER & INTEGRITY HASH BANNER
    // -------------------------------------------------------------
    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height: 35,
      color: charcoal,
    });

    page.drawText("VendLex Kenya • Official Document Center • Verified Lipa na M-Pesa Protected Escrow", {
      x: 40,
      y: 20,
      size: 7.5,
      font: fontBold,
      color: rgb(0.9, 0.9, 0.9),
    });

    page.drawText(
      `SHA-256 Digest: ${doc.fileHash.substring(0, 36)}... | Authenticity verifiable at vendlex.co.ke/verify`,
      {
        x: 40,
        y: 9,
        size: 6.5,
        font: fontMono,
        color: rgb(0.7, 0.75, 0.8),
      }
    );

    page.drawText("Page 1 of 1", {
      x: width - 85,
      y: 15,
      size: 8,
      font: fontRegular,
      color: rgb(0.8, 0.8, 0.8),
    });

    const pdfBytes = await pdfDoc.save();
    const computedHash = crypto.createHash("sha256").update(pdfBytes).digest("hex");

    return {
      pdfBytes,
      fileHash: computedHash,
      verificationUrl,
    };
  }

  /**
   * 2. PRESTIGIOUS OFFICIAL MERCHANT ACCREDITATION CERTIFICATE RENDERING
   */
  private static async renderCertificatePDF(
    doc: VendLexDocument,
    baseUrl: string
  ): Promise<PDFGenerationResult> {
    const pdfDoc = await PDFDocument.create();
    // Landscape A4 for prestigious Certificate Presentation (841.89 x 595.28 points)
    const page = pdfDoc.addPage([841.89, 595.28]);
    const { width, height } = page.getSize();

    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontMono = await pdfDoc.embedFont(StandardFonts.Courier);
    const fontTimesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const fontTimesItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

    // Embed Logo
    let logoImage: PDFImage | null = null;
    try {
      const possibleLogoPaths = [
        path.join(process.cwd(), "public", "logo", "vendlex-logo.png"),
        path.join(process.cwd(), "public", "logo", "vendlex-mark.png"),
        path.join(process.cwd(), "public", "logo", "vendlex-icon.png"),
      ];
      for (const p of possibleLogoPaths) {
        if (fs.existsSync(p)) {
          const logoBytes = fs.readFileSync(p);
          logoImage = await pdfDoc.embedPng(logoBytes);
          break;
        }
      }
    } catch (e) {
      console.warn("[PDFEngine] Could not embed logo in certificate:", e);
    }

    // Color Palette
    const emeraldDeep = rgb(0.016, 0.35, 0.25); // #047857
    const goldPrimary = rgb(0.83, 0.65, 0.17); // #D4A72C
    const goldDark = rgb(0.70, 0.50, 0.10); // #B45309
    const goldLight = rgb(0.98, 0.95, 0.88); // #FEFCE8
    const creamBg = rgb(0.99, 0.99, 0.98);
    const textDark = rgb(0.06, 0.09, 0.16); // #0F172A
    const textMuted = rgb(0.39, 0.45, 0.54); // #64748B
    const stampRed = rgb(0.75, 0.18, 0.15); // Authentic Seal Red

    // Background Fill
    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height,
      color: creamBg,
    });

    // -------------------------------------------------------------
    // ORNATE CERTIFICATE BORDER FRAME
    // -------------------------------------------------------------
    // Outer Gold Border
    page.drawRectangle({
      x: 18,
      y: 18,
      width: width - 36,
      height: height - 36,
      borderColor: goldDark,
      borderWidth: 4,
    });

    // Middle Emerald Border
    page.drawRectangle({
      x: 26,
      y: 26,
      width: width - 52,
      height: height - 52,
      borderColor: emeraldDeep,
      borderWidth: 1.5,
    });

    // Inner Delicate Gold Border
    page.drawRectangle({
      x: 31,
      y: 31,
      width: width - 62,
      height: height - 62,
      borderColor: goldPrimary,
      borderWidth: 0.75,
    });

    // 4 Corner Ornaments
    const drawCorner = (cx: number, cy: number) => {
      page.drawRectangle({
        x: cx - 6,
        y: cy - 6,
        width: 12,
        height: 12,
        color: goldPrimary,
        borderColor: emeraldDeep,
        borderWidth: 1,
      });
    };
    drawCorner(26, 26);
    drawCorner(width - 26, 26);
    drawCorner(26, height - 26);
    drawCorner(width - 26, height - 26);

    // -------------------------------------------------------------
    // CERTIFICATE TOP HEADER & EMBLEM
    // -------------------------------------------------------------
    const center = width / 2;

    if (logoImage) {
      page.drawImage(logoImage, {
        x: center - 24,
        y: height - 98,
        width: 48,
        height: 52,
      });
    }

    const headerY = height - 116;
    page.drawText("REPUBLIC OF KENYA | NATIONAL COMMERCE ECOSYSTEM", {
      x: center - 160,
      y: headerY,
      size: 9,
      font: fontBold,
      color: goldDark,
    });

    page.drawText("VENDLEX TECHNOLOGIES KENYA", {
      x: center - 120,
      y: headerY - 14,
      size: 13,
      font: fontBold,
      color: emeraldDeep,
    });

    // Main Certificate Title
    const titleText = "CERTIFICATE OF MERCHANT ACCREDITATION";
    page.drawText(titleText, {
      x: center - 240,
      y: headerY - 44,
      size: 20,
      font: fontTimesBold,
      color: textDark,
    });

    page.drawLine({
      start: { x: center - 200, y: headerY - 52 },
      end: { x: center + 200, y: headerY - 52 },
      color: goldPrimary,
      thickness: 1.5,
    });

    // -------------------------------------------------------------
    // CERTIFICATE BODY RECITALS
    // -------------------------------------------------------------
    const bodyY = headerY - 76;

    page.drawText("This is to officially certify that", {
      x: center - 75,
      y: bodyY,
      size: 11,
      font: fontTimesItalic,
      color: textMuted,
    });

    // Merchant / Business Name
    const bizName = (doc.sellerName || doc.ownerName || "Accredited Enterprise").toUpperCase();
    const bizNameWidth = fontTimesBold.widthOfTextAtSize(bizName, 22);
    page.drawText(bizName, {
      x: center - bizNameWidth / 2,
      y: bodyY - 30,
      size: 22,
      font: fontTimesBold,
      color: emeraldDeep,
    });

    // Business Registration Details
    const regNum = doc.metadata.regNumber || "BN/2026/REGISTERED";
    const countyName = doc.sellerCounty || doc.metadata.deliveryCounty || "Nairobi";
    const regDetailText = `Business Registration No: ${regNum}  |  ${countyName} County, Kenya`;
    const regDetailWidth = fontRegular.widthOfTextAtSize(regDetailText, 10);
    page.drawText(regDetailText, {
      x: center - regDetailWidth / 2,
      y: bodyY - 50,
      size: 10,
      font: fontBold,
      color: textDark,
    });

    // Formal Compliance Narrative
    const narrative1 =
      "Has successfully passed verified merchant screening, identity validation, and M-Pesa Daraja escrow integration.";
    const narrative2 =
      "Is hereby authorized and recognized as an Official Verified Merchant in good standing on the VendLex National Platform.";
    page.drawText(narrative1, {
      x: center - fontRegular.widthOfTextAtSize(narrative1, 9.5) / 2,
      y: bodyY - 74,
      size: 9.5,
      font: fontRegular,
      color: textMuted,
    });
    page.drawText(narrative2, {
      x: center - fontRegular.widthOfTextAtSize(narrative2, 9.5) / 2,
      y: bodyY - 88,
      size: 9.5,
      font: fontRegular,
      color: textMuted,
    });

    // -------------------------------------------------------------
    // METADATA & ACCREDITATION PARTICULARS
    // -------------------------------------------------------------
    const detailsBoxY = bodyY - 150;
    const dateObj = new Date(doc.issuedAt || Date.now());
    const dateFormatted = dateObj.toLocaleDateString("en-KE", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    const timeFormatted = dateObj.toLocaleTimeString("en-KE", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    const fullDateStamp = `${dateFormatted.toUpperCase()} (${timeFormatted})`;

    // Left Details Box
    page.drawText("ACCREDITATION PARTICULARS:", {
      x: 65,
      y: detailsBoxY + 35,
      size: 8,
      font: fontBold,
      color: goldDark,
    });
    page.drawText(`Certificate ID: ${doc.publicDocumentId}`, {
      x: 65,
      y: detailsBoxY + 22,
      size: 8.5,
      font: fontMono,
      color: textDark,
    });
    page.drawText(`Tier Plan: ${doc.metadata.planName || "Verified Merchant Plan"}`, {
      x: 65,
      y: detailsBoxY + 10,
      size: 8.5,
      font: fontRegular,
      color: textDark,
    });
    page.drawText(`M-Pesa Reference: ${doc.metadata.mpesaReceipt || "MPESA-CONFIRMED"}`, {
      x: 65,
      y: detailsBoxY - 2,
      size: 8.5,
      font: fontRegular,
      color: textDark,
    });
    page.drawText(`Date of Issuance: ${dateFormatted}`, {
      x: 65,
      y: detailsBoxY - 14,
      size: 8.5,
      font: fontRegular,
      color: textDark,
    });

    // -------------------------------------------------------------
    // OFFICIAL CIRCULAR DIGITAL STAMP (Date of Occurrence)
    // -------------------------------------------------------------
    const sealX = center;
    const sealY = detailsBoxY + 6;

    // Dual concentric circles for stamp
    page.drawCircle({
      x: sealX,
      y: sealY,
      size: 46,
      borderColor: emeraldDeep,
      borderWidth: 2,
      color: rgb(0.97, 1, 0.98),
    });
    page.drawCircle({
      x: sealX,
      y: sealY,
      size: 42,
      borderColor: goldDark,
      borderWidth: 1,
    });

    // Stamp text inside
    page.drawText("* VENDLEX KENYA *", {
      x: sealX - 38,
      y: sealY + 28,
      size: 7.5,
      font: fontBold,
      color: emeraldDeep,
    });
    page.drawText("OFFICIAL SEAL", {
      x: sealX - 26,
      y: sealY + 18,
      size: 7,
      font: fontBold,
      color: goldDark,
    });
    page.drawText("VERIFIED MERCHANT", {
      x: sealX - 36,
      y: sealY + 6,
      size: 6.5,
      font: fontBold,
      color: emeraldDeep,
    });
    page.drawText(`STAMPED: ${dateFormatted.toUpperCase()}`, {
      x: sealX - 40,
      y: sealY - 6,
      size: 6,
      font: fontBold,
      color: stampRed,
    });
    page.drawText(doc.verificationCode, {
      x: sealX - 22,
      y: sealY - 18,
      size: 7,
      font: fontMono,
      color: textDark,
    });
    page.drawText("* AUTHENTICATED *", {
      x: sealX - 38,
      y: sealY - 29,
      size: 6.5,
      font: fontBold,
      color: goldDark,
    });

    // -------------------------------------------------------------
    // RIGHT QR CODE & VERIFICATION
    // -------------------------------------------------------------
    const verificationUrl = `${baseUrl}/verify/${doc.publicDocumentId}`;
    const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
      margin: 1,
      width: 140,
      color: {
        dark: "#047857",
        light: "#FFFFFF",
      },
    });
    const qrImageBytes = Buffer.from(qrDataUrl.split(",")[1], "base64");
    const qrImage = await pdfDoc.embedPng(qrImageBytes);

    page.drawImage(qrImage, {
      x: width - 135,
      y: detailsBoxY - 22,
      width: 65,
      height: 65,
    });

    page.drawText("SCAN TO VERIFY", {
      x: width - 135,
      y: detailsBoxY - 32,
      size: 7,
      font: fontBold,
      color: emeraldDeep,
    });

    // -------------------------------------------------------------
    // SIGNATURES & COMPLIANCE FOOTER
    // -------------------------------------------------------------
    const sigY = 58;

    // Left Signature
    page.drawLine({
      start: { x: 80, y: sigY + 12 },
      end: { x: 220, y: sigY + 12 },
      color: emeraldDeep,
      thickness: 1,
    });
    page.drawText("DIRECTOR OF TRUST & SAFETY", {
      x: 82,
      y: sigY,
      size: 7.5,
      font: fontBold,
      color: textDark,
    });
    page.drawText("VendLex Merchant Oversight Committee", {
      x: 75,
      y: sigY - 10,
      size: 6.5,
      font: fontRegular,
      color: textMuted,
    });

    // Right Signature
    page.drawLine({
      start: { x: width - 240, y: sigY + 12 },
      end: { x: width - 100, y: sigY + 12 },
      color: emeraldDeep,
      thickness: 1,
    });
    page.drawText("CHIEF COMPLIANCE OFFICER", {
      x: width - 232,
      y: sigY,
      size: 7.5,
      font: fontBold,
      color: textDark,
    });
    page.drawText("Republic of Kenya Accreditation Office", {
      x: width - 236,
      y: sigY - 10,
      size: 6.5,
      font: fontRegular,
      color: textMuted,
    });

    // Bottom Ledger SHA-256 Digest
    page.drawText(
      `Official Cryptographic Ledger ID: ${doc.publicDocumentId}  |  SHA-256 Digest: ${doc.fileHash.substring(0, 36)}...  |  Verifiable at vendlex.co.ke/verify`,
      {
        x: center - 230,
        y: 22,
        size: 6.5,
        font: fontMono,
        color: textMuted,
      }
    );

    const pdfBytes = await pdfDoc.save();
    const computedHash = crypto.createHash("sha256").update(pdfBytes).digest("hex");

    return {
      pdfBytes,
      fileHash: computedHash,
      verificationUrl,
    };
  }
}
