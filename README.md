# 🇰🇪 VendLex Kenya — Enterprise Marketplace & Business SaaS Platform

[![Next.js 15](https://img.shields.io/badge/Next.js-15.0-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-249%20Passing-brightgreen)](https://github.com/caleb028/vendlex)
[![License](https://img.shields.io/badge/License-Proprietary-red)]()

**VendLex Kenya** is a high-performance, full-stack digital marketplace and business operating system engineered specifically for Kenya's commerce ecosystem. Connecting verified merchants, artisans, and service providers across all **47 Kenyan counties**, VendLex integrates secure M-Pesa escrow payments, official document stamping, an AI business copilot, and end-to-end Google & Meta conversion tracking.

---

## 🌟 Key Platform Capabilities

### 1. 🛒 Multi-Vendor Marketplace & County Discovery
* **47 Counties Engine**: County-specific discovery hubs, regional logistics estimators, and local artisan highlights.
* **Smart Search & Filters**: Multi-attribute filtering (county, category, price in KES, delivery speed, seller rating).
* **Interactive Cart & Escrow Checkout**: Instant checkout with automated M-Pesa Daraja STK push and buyer protection escrow.

### 2. 📄 Official Document Engine & Auto-Stamping
* **Cryptographic Auto-Stamping**: Every invoice, receipt, and verified seller certificate is automatically stamped with the official VendLex verification seal, date/time hash, and QR code verification link.
* **Instant PDF Downloads**: High-resolution downloadable certificates and official invoices for accounting and regulatory compliance.
* **Public Verification Portal**: Instant verification lookup via `/verify/[documentId]` ensuring zero forgery.

### 3. 💳 Daraja 2.0 M-Pesa Integration
* **Automated STK Push**: Seamless mobile prompt for Lipa na M-Pesa.
* **Instant Webhook Reconciliation**: Asynchronous validation, automatic status transitions (`PENDING` → `COMPLETED` / `REVERSED`), and customer receipt generation.
* **Escrow Hold & Release**: Funds held securely in escrow until buyer confirms delivery or dispute window expires.

### 4. 📈 Google & Meta Marketing & Attribution Engine
* **Conversions API (CAPI) & Pixel**: Real-time server-side and client-side event tracking for Google Ads and Meta Ads.
* **UTM & Attribution Pipeline**: First-touch, last-touch, and multi-touch attribution modeling tracking campaign ROI from ad click to KES revenue.
* **Merchant Center & Product Feeds**: Auto-generated XML/JSON product feeds formatted for Google Merchant Center and Facebook/Instagram Shop Catalogs.

### 5. 🤖 AI Merchant Copilot & Business Suite
* **AI Product Optimizer**: Automatic enhancement of product descriptions, SEO tags, and competitive KES pricing analysis.
* **County Demand Heatmaps**: Real-time sales analytics revealing top-performing products across Nairobi, Mombasa, Kisumu, Nakuru, Eldoret, and beyond.
* **Loan Eligibility Scorer**: Transaction-based financial health assessment helping MSMEs access working capital.

### 6. 🛡️ Enterprise Security & Admin Oversight
* **Role-Based Access Control (RBAC)**: Secure isolation between `CUSTOMER`, `SELLER`, `BUSINESS_OWNER`, and `ADMIN`/`SUPER_ADMIN`.
* **Central Admin Command Center**: Platform-wide user management, vendor credential verification, dispute arbitration, real-time audit logs, and transaction monitoring.
* **Help & Support Desk**: Live chat, support ticket lifecycle management, and intelligent FAQ assistant.

---

## 🏗️ Architecture & Tech Stack

```
                                  VENDLEX KENYA
                                        │
                 ┌──────────────────────┴──────────────────────┐
                 ▼                                             ▼
       Next.js 15 App Router                         Express / Node.js API
       (Vercel Edge Deployment)                      (Render Cloud Backend)
                 │                                             │
                 ├──────────────────────┬──────────────────────┤
                 ▼                      ▼                      ▼
        M-Pesa Daraja Engine    PDF Document Engine    Marketing Engine
         (Safaricom API)        (Official Stamping)    (Google & Meta CAPI)
                                        │
                                        ▼
                             PostgreSQL / SQLite
                            (Prisma ORM & ServerDB)
```

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 15 (App Router), React 18, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons |
| **Backend & APIs** | Next.js API Routes, Express.js (`server/index.ts`), Prisma ORM, Node.js |
| **Payments** | Safaricom Daraja 2.0 M-Pesa API (STK Push, C2B, B2C, Reconciliations) |
| **Documents** | Custom Canvas/PDF Generator (`lib/documents/pdf-engine.ts`) with Stamping Engine |
| **Attribution** | Meta Conversions API (v19.0), Google Ads Enhanced Conversions, Google Tag Manager |
| **Testing** | Node Test Runner, Vitest / Custom Automated Integration Test Suites |

---

## 🚀 Quick Start & Local Setup

### Prerequisites
* **Node.js** 18.x or 20.x LTS
* **npm** or **pnpm**

### 1. Clone the Repository
```bash
git clone https://github.com/caleb028/vendlex.git
cd vendlex
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
# Platform URL & Environment
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# M-Pesa Daraja Sandbox / Production Credentials
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_PASSKEY=your_daraja_passkey
MPESA_SHORTCODE=174379

# Marketing & Ads Engine (Optional)
NEXT_PUBLIC_META_PIXEL_ID=your_pixel_id
META_CAPI_ACCESS_TOKEN=your_meta_token
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
GOOGLE_ADS_CONVERSION_ID=AW-XXXXXXXXXX
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to view the platform.

---

## 🧪 Automated Testing

Run the full platform verification test suite:
```bash
npm test
```
**Test Results**: 249 / 249 tests passing across 7 test suites:
* `authentication-system.test.ts`
* `documents-system.test.ts` (Auto-Stamping & Certificates)
* `marketing-engine.test.ts` (Google & Meta CAPI)
* `help-support-admin.test.ts`
* `ai-copilot.test.ts`
* `production-deployment.test.ts`
* `platform-launch-readiness.test.ts`

---

## 🌐 Production Deployment

### Frontend (Vercel)
Connect the GitHub repository to [Vercel](https://vercel.com):
* **Framework Preset**: Next.js
* **Build Command**: `npm run build`
* **Output Directory**: `.next`

### Backend Server (Render)
The repository includes a ready-to-use [`render.yaml`](./render.yaml) blueprint:
```bash
npm run build:server
npm run start:server
```

---

## 📄 License & Copyright

&copy; 2026 **VendLex Technologies Kenya**. All rights reserved. Built with pride for Kenyan entrepreneurs and digital commerce across all 47 counties 🇰🇪.
