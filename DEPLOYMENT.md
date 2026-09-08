# VendLex Kenya — Production Deployment Handbook

This document provides the definitive step-by-step engineering guide for deploying the **VendLex Kenya** platform to production using **Vercel** (Next.js React Frontend), **Render** (Node.js Express API Backend), and **PostgreSQL** (Persistent Relational Database).

---

## 1. Production Architecture Overview

```text
                                 INTERNET
                                    │
                                    ▼
                          https://vendlex.vercel.app
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                 VERCEL                          RENDER
          (Next.js React Frontend)         (Node.js API Web Service)
                    │                               │
             • React 19 / TSX                • Express 4 REST API
             • Edge CDN & SSR                • Daraja 2.0 Webhooks
             • PWA & Metadata                • Server-Side PDF Engine
                    │                               │
                    └───────────────┬───────────────┘
                                    │ HTTPS (API)
                                    ▼
                         https://api.vendlex.vercel.app
                                    │
                                    ▼
                                DATABASE
                                    │
                            PostgreSQL Database
                         (Render / RDS / Supabase)
```

---

## 2. Prerequisites

1. **GitHub Repository**: Push this repository to your GitHub account (e.g. `github.com/your-org/vendlex`).
2. **Vercel Account**: [vercel.com](https://vercel.com) (Free / Pro).
3. **Render Account**: [render.com](https://render.com) (Free / Individual / Team).
4. **Domain Registrar**: Access to DNS management for `vendlex.vercel.app`.
5. **Safaricom Daraja Portal**: [developer.safaricom.co.ke](https://developer.safaricom.co.ke) for production Lipa na M-Pesa Shortcode and Passkey.

---

## 3. Step-by-Step Backend & Database Deployment (Render)

### Method A: Blueprint Deployment with `render.yaml` (Recommended)

1. Log into your **Render Dashboard** ([dashboard.render.com](https://dashboard.render.com)).
2. Click **New +** → **Blueprint**.
3. Select your **VendLex GitHub Repository**.
4. Render will detect `render.yaml` and configure two services automatically:
   - `vendlex-postgres` (Managed PostgreSQL Database)
   - `vendlex-api` (Node.js API Web Service)
5. Review the resources and click **Apply**.

---

### Method B: Manual Web Service Setup

If setting up services individually:

#### A. Provision PostgreSQL Database
1. In Render, click **New +** → **PostgreSQL**.
2. **Name**: `vendlex-postgres`
3. **Database**: `vendlex_db`
4. **User**: `vendlex_admin`
5. **Region**: `Frankfurt (EU Central)` or closest to Kenya
6. **Plan**: `Starter` ($7/mo) or `Free`
7. Click **Create Database** and copy the **Internal Database URL**.

#### B. Provision Node.js API Web Service
1. Click **New +** → **Web Service**.
2. Connect your **VendLex GitHub Repository**.
3. Configure the service settings:
   - **Name**: `vendlex-api`
   - **Environment**: `Node`
   - **Region**: Same region as PostgreSQL
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build:server`
   - **Start Command**: `npm run start:server`
   - **Health Check Path**: `/health`
   - **Plan**: `Starter` ($7/mo) or `Free`

4. Add the following **Environment Variables** in the Render Web Service:

| Variable Name | Example / Target Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production optimizations & secure cookies |
| `PORT` | `10000` | Render assigns this automatically |
| `CORS_ORIGIN` | `https://vendlex.vercel.app,https://www.vendlex.vercel.app` | Allowed frontend origins |
| `DATABASE_URL` | `postgresql://...` | Connection string from Render PostgreSQL |
| `JWT_SECRET` | *(Generate 32-byte hex)* | Token cryptography secret |
| `SESSION_SECRET` | *(Generate 32-byte hex)* | Session hash secret |
| `ADMIN_API_SECRET` | *(Secure Admin Passcode)* | Admin command center unlock key |
| `MPESA_ENVIRONMENT` | `production` | Live Daraja environment |
| `MPESA_SHORTCODE` | `XXXXXX` | Live Safaricom Paybill / Till Number |
| `MPESA_CONSUMER_KEY` | `XXXXXX` | Daraja Production Consumer Key |
| `MPESA_CONSUMER_SECRET`| `XXXXXX` | Daraja Production Consumer Secret |
| `MPESA_PASSKEY` | `XXXXXX` | Daraja Live Passkey |
| `MPESA_CALLBACK_URL` | `https://api.vendlex.vercel.app/api/daraja/callback` | Live webhook endpoint |

5. Click **Deploy Web Service**.
6. Verify deployment by visiting: `https://vendlex-api.onrender.com/health` (should return HTTP 200 `{ status: "ok" }`).

---

## 4. Step-by-Step Frontend Deployment (Vercel)

1. Log into your **Vercel Dashboard** ([vercel.com](https://vercel.com)).
2. Click **Add New...** → **Project**.
3. Import your **VendLex GitHub Repository**.
4. Configure Project Settings:
   - **Framework Preset**: `Next.js` (automatically detected)
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Install Command**: `npm install`
5. Configure the following **Environment Variables** in Vercel:

| Variable Name | Production Value | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | `https://vendlex.vercel.app` | Canonical Frontend Domain |
| `NEXT_PUBLIC_API_URL` | `https://api.vendlex.vercel.app` | Render Backend API Domain |
| `NODE_ENV` | `production` | Production environment flag |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | `G-XXXXXXXXXX` | Google Analytics 4 Measurement ID |
| `NEXT_PUBLIC_META_PIXEL_ID` | `123456789012345` | Meta Ads Pixel ID |
| `ADMIN_API_SECRET` | *(Match Render Secret)* | Admin verification passcode |

6. Click **Deploy**.
7. Vercel will build and assign a deployment URL (e.g. `https://vendlex.vercel.app`).

---

## 5. Custom Domain & DNS Configuration

When you are ready to point your official domain (`vendlex.vercel.app`):

### A. Frontend Domain Records (`vendlex.vercel.app`)
In your domain registrar DNS management (e.g. Kenya Web Experts, Safaricom Domains, Namecheap, Cloudflare):

| Type | Host / Name | Value / Destination | TTL | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **A** | `@` | `76.76.21.21` | `300` | Points apex domain to Vercel CDN |
| **CNAME** | `www` | `cname.vercel-dns.com` | `300` | Points www to Vercel CDN |

In Vercel:
- Navigate to **Project Settings** → **Domains**.
- Add `vendlex.vercel.app` and `www.vendlex.vercel.app`.
- Vercel will provision free SSL certificates automatically (Let's Encrypt).

---

### B. Backend API Domain Records (`api.vendlex.vercel.app`)
In your domain registrar DNS management:

| Type | Host / Name | Value / Destination | TTL | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **CNAME** | `api` | `vendlex-api.onrender.com` | `300` | Points API subdomain to Render |

In Render:
- Navigate to **Web Service** (`vendlex-api`) → **Settings** → **Custom Domains**.
- Add `api.vendlex.vercel.app`.
- Render will verify DNS and issue a free SSL certificate automatically.

---

## 6. Live Product Feed Syndication URLs

Once your domain is active, provide these authoritative feed URLs to Google & Meta:

- **Google Merchant Center RSS 2.0 XML**:
  ```text
  https://api.vendlex.vercel.app/api/feeds/google-merchant.xml
  (or https://vendlex.vercel.app/api/feeds/google-merchant.xml)
  ```
- **Meta Ads Facebook/Instagram Catalog CSV**:
  ```text
  https://api.vendlex.vercel.app/api/feeds/meta-catalog.csv
  (or https://vendlex.vercel.app/api/feeds/meta-catalog.csv)
  ```

---

## 7. Post-Deployment Verification Checklist

Execute this checklist once deployed:

- [ ] **API Health**: `curl https://api.vendlex.vercel.app/health` returns `{"status":"ok"}`.
- [ ] **Frontend Home**: Visit `https://vendlex.vercel.app` — Navbar, categories, and hero banner render cleanly.
- [ ] **User Registration & Login**: Test signing up with a Kenyan phone number (+254...) and signing in.
- [ ] **Marketplace Browsing**: Filter products by Nairobi, Kiambu, Mombasa, and category.
- [ ] **Cart & Checkout**: Add product to cart, select county delivery zone, and initiate checkout.
- [ ] **Lipa na M-Pesa STK Push**: Test STK push flow and receipt verification.
- [ ] **Verified Documents**: Download official receipt PDF and test QR code verification URL.
- [ ] **Help & Support**: Submit a support ticket (`TKT-2026-XXXXX`) and verify message reply thread.
- [ ] **Admin Command Center**: Access `/admin`, enter security passcode, and review live KPI dashboard.
- [ ] **PWA Installation**: Test "Add to Home Screen" on Android / iOS Chrome / Safari.
- [ ] **Robots & Sitemap**: Verify `https://vendlex.vercel.app/robots.txt` and `https://vendlex.vercel.app/sitemap.xml`.

---

## 8. Backup & Operational Maintenance

1. **Database Backups**:
   - Render automatically performs daily automated backups of your PostgreSQL database.
   - For manual export:
     ```bash
     pg_dump -U vendlex_admin -h <host> -d vendlex_db > vendlex_backup_$(date +%F).sql
     ```
2. **Zero-Downtime Deployments**:
   - Both Vercel and Render deploy using atomic immutable containers. If a build fails, traffic remains on the previous healthy deployment.
