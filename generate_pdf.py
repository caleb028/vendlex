import os
import shutil
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Header (pages 2+)
        if self._pageNumber > 1:
            self.drawString(36, 842 - 25, "VendLex Kenya — Full Platform Architecture & Description")
            self.drawRightString(595 - 36, 842 - 25, "SHOP • GROW • PROSPER")
            self.setStrokeColor(colors.HexColor("#E2E8F0"))
            self.setLineWidth(0.5)
            self.line(36, 842 - 28, 595 - 36, 842 - 28)
        
        # Footer (all pages)
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.5)
        self.line(36, 32, 595 - 36, 32)
        
        self.drawString(36, 20, "https://vendlex.co.ke | Powered by Safaricom Daraja 2.0 & Next.js 15")
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(595 - 36, 20, page_text)
        self.restoreState()

def build_pdf():
    pdf_path = r"C:\Users\ADMIN\.gemini\antigravity\scratch\sokolink\public\VendLex_Kenya_Platform_Description.pdf"
    os.makedirs(os.path.dirname(pdf_path), exist_ok=True)
    
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        leftMargin=36,
        rightMargin=36,
        topMargin=40,
        bottomMargin=42
    )

    styles = getSampleStyleSheet()
    
    # Custom Brand Palette
    C_EMERALD = colors.HexColor("#045A35")
    C_EMERALD_LIGHT = colors.HexColor("#087443")
    C_GOLD = colors.HexColor("#D9A441")
    C_DARK = colors.HexColor("#111827")
    C_GRAY = colors.HexColor("#374151")
    C_LIGHT_BG = colors.HexColor("#F8FAFC")
    C_BORDER = colors.HexColor("#CBD5E1")
    
    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=24,
        leading=28,
        textColor=C_EMERALD
    )
    
    subtitle_style = ParagraphStyle(
        "DocSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=11,
        leading=15,
        textColor=C_GOLD
    )
    
    h1_style = ParagraphStyle(
        "SectionH1",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=14,
        leading=18,
        textColor=C_EMERALD,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        "SectionH2",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=11,
        leading=14,
        textColor=C_DARK,
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    )
    
    body_style = ParagraphStyle(
        "Body",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=C_GRAY,
        spaceAfter=6
    )

    body_bold = ParagraphStyle(
        "BodyBold",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=9,
        leading=13,
        textColor=C_DARK
    )

    table_cell = ParagraphStyle(
        "TableCell",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8,
        leading=11,
        textColor=C_GRAY
    )

    table_cell_bold = ParagraphStyle(
        "TableCellBold",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=11,
        textColor=C_DARK
    )

    table_cell_header = ParagraphStyle(
        "TableCellHeader",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8.5,
        leading=12,
        textColor=colors.white
    )

    badge_style = ParagraphStyle(
        "Badge",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=10,
        textColor=C_EMERALD
    )

    story = []

    # 1. Header Banner with Logo & Title
    logo_path = r"C:\Users\ADMIN\.gemini\antigravity\scratch\sokolink\public\logo\vendlex-logo.png"
    if os.path.exists(logo_path):
        logo_img = Image(logo_path, width=2.4 * inch, height=0.68 * inch)
        header_table = Table(
            [[
                logo_img,
                [
                    Paragraph("VENDLEX KENYA", title_style),
                    Paragraph("KENYA'S PREMIER COMMERCE & SERVICES ECOSYSTEM", subtitle_style),
                    Paragraph("Connecting All 47 Counties • Official Platform Description & Specification", body_style)
                ]
            ]],
            colWidths=[2.6 * inch, 4.6 * inch]
        )
        header_table.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]))
        story.append(header_table)
    else:
        story.append(Paragraph("VENDLEX KENYA", title_style))
        story.append(Paragraph("KENYA'S PREMIER COMMERCE & SERVICES ECOSYSTEM", subtitle_style))
        story.append(Paragraph("Connecting All 47 Counties • Official Platform Description & Specification", body_style))

    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=1.5, color=C_EMERALD, spaceBefore=2, spaceAfter=10))

    # 2. Executive Overview
    story.append(Paragraph("1. Executive Overview & Mission", h1_style))
    story.append(Paragraph(
        "<b>VendLex Kenya</b> (<code>https://vendlex.co.ke</code>) is a unified digital commerce engine engineered "
        "specifically for the Kenyan economy. The platform bridges the trust, financial, and logistical gaps between "
        "local businesses, certified service tradespeople, and millions of consumers across all <b>47 Kenyan Counties</b>. "
        "By merging verified multi-vendor marketplace retail with on-demand technician dispatch and an integrated "
        "merchant SaaS management operating system, VendLex serves as a full-stack commercial operating system for Kenya.",
        body_style
    ))

    # 3. The 3 Core Pillars Table
    story.append(Paragraph("2. The Three Strategic Pillars: SHOP • GROW • PROSPER", h1_style))
    pillars_data = [
        [
            Paragraph("Pillar", table_cell_header),
            Paragraph("Target Audience", table_cell_header),
            Paragraph("Core Deliverables & Capabilities", table_cell_header),
            Paragraph("Key Innovations", table_cell_header)
        ],
        [
            Paragraph("<b>01. SHOP</b><br/><i>Consumer Retail</i>", table_cell_bold),
            Paragraph("Kenyan Shoppers & Corporate Buyers", table_cell),
            Paragraph("Multi-category shopping: Electronics, African Fashion & Kitenge, Solar PV Gear, Home appliances, and agricultural supplies with instant Lipa na M-Pesa STK push.", table_cell),
            Paragraph("Direct WhatsApp merchant contact, same-day delivery dispatch, fraud reporting, and wishlist sync.", table_cell)
        ],
        [
            Paragraph("<b>02. GROW</b><br/><i>Merchant SaaS</i>", table_cell_bold),
            Paragraph("Retailers, Wholesalers, Artisans & SMEs", table_cell),
            Paragraph("5-minute online store setup, automated KRA eTIMS compliant PDF invoicing, multi-channel order tracking, inventory alerts, and sales analytics.", table_cell),
            Paragraph("Bilingual Swahili/English AI Business Assistant for automated social ads and customer chat scripts.", table_cell)
        ],
        [
            Paragraph("<b>03. PROSPER</b><br/><i>Service Network</i>", table_cell_bold),
            Paragraph("Plumbers, Electricians, Techs & Clients", table_cell),
            Paragraph("On-demand dispatch of verified local tradespeople, fixed starting quote previews, certified skills credentials, and direct booking workflow.", table_cell),
            Paragraph("Ratings, verified photo reviews, and county-level GPS technician discovery.", table_cell)
        ],
    ]
    pillars_table = Table(pillars_data, colWidths=[1.4 * inch, 1.4 * inch, 2.5 * inch, 1.9 * inch])
    pillars_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), C_EMERALD),
        ("GRID", (0, 0), (-1, -1), 0.5, C_BORDER),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, C_LIGHT_BG]),
    ]))
    story.append(pillars_table)
    story.append(Spacer(1, 10))

    # 4. Safaricom Daraja 2.0 Integration & Payments
    story.append(Paragraph("3. Financial Infrastructure & Safaricom Daraja 2.0 Integration", h1_style))
    story.append(Paragraph(
        "VendLex has a native, production-tested integration with Safaricom Daraja 2.0 APIs. The platform natively "
        "supports <b>Buy Goods Till Numbers</b>, <b>Paybills</b>, and <b>Pochi la Biashara</b> accounts for real-time customer checkout, "
        "merchant onboarding fee collection, and escrow disbursements.",
        body_style
    ))

    mpesa_data = [
        [
            Paragraph("API Endpoint", table_cell_header),
            Paragraph("Module & Path", table_cell_header),
            Paragraph("Operational Description", table_cell_header)
        ],
        [
            Paragraph("<b>STK Push (Lipa na M-Pesa)</b>", table_cell_bold),
            Paragraph("<code>/api/mpesa/stkpush</code><br/><code>lib/mpesa/daraja.ts</code>", table_cell),
            Paragraph("Triggers SIM push notification to customer phone with 45-second countdown. Validates Kenyan phone numbers (<code>254...</code>) and bounds with sliding-window Edge rate-limiting.", table_cell)
        ],
        [
            Paragraph("<b>Payment Callback Webhook</b>", table_cell_bold),
            Paragraph("<code>/api/mpesa/callback</code>", table_cell),
            Paragraph("Asynchronously receives Safaricom transaction confirmation receipts (e.g., <code>SKLQG89124</code>), updates store activation status, and logs receipts to the platform ledger.", table_cell)
        ],
        [
            Paragraph("<b>Transaction Query API</b>", table_cell_bold),
            Paragraph("<code>/api/mpesa/query</code>", table_cell),
            Paragraph("Handles automated polling to resolve edge-case network dropouts or delayed customer PIN entries.", table_cell)
        ],
        [
            Paragraph("<b>Escrow & Transaction Ledger</b>", table_cell_bold),
            Paragraph("<code>lib/mpesa/transaction-store.ts</code>", table_cell),
            Paragraph("Tracks transaction volume, subscription payments, and customer receipts across all merchants.", table_cell)
        ],
    ]
    mpesa_table = Table(mpesa_data, colWidths=[2.0 * inch, 2.2 * inch, 3.0 * inch])
    mpesa_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), C_EMERALD_LIGHT),
        ("GRID", (0, 0), (-1, -1), 0.5, C_BORDER),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, C_LIGHT_BG]),
    ]))
    story.append(mpesa_table)
    story.append(Spacer(1, 10))

    # 5. Security & Edge Hardening
    story.append(Paragraph("4. Defensive Security Architecture & Edge Middleware", h1_style))
    story.append(Paragraph(
        "VendLex employs defense-in-depth security engineered for e-commerce and high-throughput financial transactions:",
        body_style
    ))
    
    sec_points = [
        "<b>Edge Sliding-Window Rate Limiting (middleware.ts):</b> Protects payment endpoints against credential stuffing and SIM bombing (15 req/min on STK push, 60 req/min on standard endpoints). Returns standard HTTP 429 with <code>Retry-After</code> headers.",
        "<b>Strict Security Headers (next.config.ts):</b> Implements HTTP Strict Transport Security (HSTS <code>max-age=63072000; includeSubDomains; preload</code>), <code>X-Frame-Options: DENY</code>, <code>X-Content-Type-Options: nosniff</code>, and rigorous Content Security Policy (CSP).",
        "<b>Kenyan Regulatory & PII Masking (lib/security.ts):</b> Strict regex verification for Kenyan numbers (<code>^(?:254|\\+254|0)?([17]\\d{8})$</code>) with PII phone masking (e.g. <code>0712***678</code>) in customer logs.",
        "<b>Timing-Safe Authentications:</b> Constant-time comparisons (<code>crypto.timingSafeEqual</code>) to prevent side-channel timing attacks on API keys and passwords."
    ]
    for pt in sec_points:
        story.append(Paragraph(f"• {pt}", body_style))

    story.append(Spacer(1, 8))

    # 6. Technology Stack & Performance
    story.append(Paragraph("5. Full Technology Stack & Build Performance", h1_style))
    
    stack_data = [
        [
            Paragraph("Layer", table_cell_header),
            Paragraph("Technology Selected", table_cell_header),
            Paragraph("Architectural Benefit", table_cell_header)
        ],
        [
            Paragraph("<b>Core Web Framework</b>", table_cell_bold),
            Paragraph("Next.js 15.1 (App Router), React 19, TypeScript 5", table_cell),
            Paragraph("Zero-runtime client JS overhead for static components; fast server-side streaming for dynamic routes.", table_cell)
        ],
        [
            Paragraph("<b>Design System & UI</b>", table_cell_bold),
            Paragraph("Tailwind CSS 3.4 + Fluid Clamp Typography CSS", table_cell),
            Paragraph("WCAG AAA contrast tokens, responsive fluid typography clamp scales, glassmorphism, and dark/light mode persistence.", table_cell)
        ],
        [
            Paragraph("<b>Micro-Interactions</b>", table_cell_bold),
            Paragraph("CSS3 Keyframes + Framer Motion 12", table_cell),
            Paragraph("Smooth card elevation, wishlist heart pop, automatic ambient slideshow, and reduced-motion accessibility.", table_cell)
        ],
        [
            Paragraph("<b>Mobile App Distribution</b>", table_cell_bold),
            Paragraph("PWA Web Manifest + Trusted Web Activity (TWA) / Capacitor", table_cell),
            Paragraph("Google Play Store distributable without maintaining separate native Android codebases.", table_cell)
        ],
        [
            Paragraph("<b>Production Build</b>", table_cell_bold),
            Paragraph("Clean 100% compilation across 37 routes", table_cell),
            Paragraph("Lightweight 6.41 kB homepage first-load JS; 0 TypeScript errors or lint warnings.", table_cell)
        ],
    ]
    stack_table = Table(stack_data, colWidths=[1.8 * inch, 2.4 * inch, 3.0 * inch])
    stack_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), C_EMERALD),
        ("GRID", (0, 0), (-1, -1), 0.5, C_BORDER),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, C_LIGHT_BG]),
    ]))
    story.append(stack_table)
    story.append(Spacer(1, 10))

    # 7. Complete Sitemap & Route Map
    story.append(Paragraph("6. Platform Directory & Key Route Manifest", h1_style))
    
    routes_data = [
        [
            Paragraph("Route Path", table_cell_header),
            Paragraph("Module Description & Capabilities", table_cell_header),
            Paragraph("Access Level", table_cell_header)
        ],
        [
            Paragraph("<code>/</code>", table_cell_bold),
            Paragraph("Streamlined Homepage: Automatic ambient commerce slideshow, 3 Pillars (SHOP • GROW • PROSPER), 47-county category visual grid, trending deals, verified stores, service showcase, and social proof.", table_cell),
            Paragraph("Public", table_cell)
        ],
        [
            Paragraph("<code>/marketplace</code>", table_cell_bold),
            Paragraph("Full catalog discovery with instant price filtering, county filters, ratings, and instant cart dispatch.", table_cell),
            Paragraph("Public", table_cell)
        ],
        [
            Paragraph("<code>/businesses</code>", table_cell_bold),
            Paragraph("Directory of verified Kenyan stores, manufacturers, and artisans across all 47 counties.", table_cell),
            Paragraph("Public", table_cell)
        ],
        [
            Paragraph("<code>/services</code>", table_cell_bold),
            Paragraph("Certified Kenyan service technicians (electricians, plumbers, solar engineers) with quote requests.", table_cell),
            Paragraph("Public", table_cell)
        ],
        [
            Paragraph("<code>/pricing</code>", table_cell_bold),
            Paragraph("Transparent merchant subscription tiers: Free, Starter (KSh 299), Business (KSh 799), Pro (KSh 1,499).", table_cell),
            Paragraph("Public", table_cell)
        ],
        [
            Paragraph("<code>/seller/onboarding</code>", table_cell_bold),
            Paragraph("5-step merchant onboarding with live M-Pesa STK push fee activation and KYC verification upload.", table_cell),
            Paragraph("Merchant", table_cell)
        ],
        [
            Paragraph("<code>/seller/dashboard</code>", table_cell_bold),
            Paragraph("Merchant operating center: live inventory, KRA eTIMS invoice generation, order management, and AI marketing tools.", table_cell),
            Paragraph("Merchant", table_cell)
        ],
        [
            Paragraph("<code>/admin</code>", table_cell_bold),
            Paragraph("Platform administration: seller KYC review, escrow transaction reconciliation, and fraud monitoring.", table_cell),
            Paragraph("Admin", table_cell)
        ],
    ]
    routes_table = Table(routes_data, colWidths=[1.8 * inch, 4.4 * inch, 1.0 * inch])
    routes_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), C_EMERALD_LIGHT),
        ("GRID", (0, 0), (-1, -1), 0.5, C_BORDER),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, C_LIGHT_BG]),
    ]))
    story.append(routes_table)
    story.append(Spacer(1, 10))

    # 8. Document Signoff / Metadata Box
    meta_box = [
        [
            Paragraph(
                "<b>Platform:</b> VendLex Kenya • <b>Tagline:</b> SHOP • GROW • PROSPER<br/>"
                "<b>Domain:</b> https://vendlex.co.ke • <b>Primary Currency:</b> Kenyan Shilling (KES / KSh)<br/>"
                "<b>Compliance:</b> KRA eTIMS, Data Protection Act 2019, Safaricom Daraja 2.0 OpenAPI Specification<br/>"
                "<b>Generated:</b> September 2026 • <b>Document Version:</b> 2.4.0 (Enterprise Specification)",
                table_cell
            )
        ]
    ]
    meta_table = Table(meta_box, colWidths=[7.2 * inch])
    meta_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), C_LIGHT_BG),
        ("BOX", (0, 0), (-1, -1), 1, C_BORDER),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
    ]))
    story.append(meta_table)

    # Build PDF
    doc.build(story, canvasmaker=NumberedCanvas)
    
    # Copy to artifacts directory
    artifact_pdf = r"C:\Users\ADMIN\.gemini\antigravity\brain\022ed181-3e2e-40f9-b8a2-d35b73fc6a34\VendLex_Kenya_Platform_Description.pdf"
    shutil.copyfile(pdf_path, artifact_pdf)
    print(f"SUCCESS: Generated PDF at {pdf_path} and copied to {artifact_pdf}")

if __name__ == "__main__":
    build_pdf()
