# 📚 VendLex Marketplace & Business Growth Platform — Master Documentation

**Platform Name:** VendLex Kenya  
**Tagline:** `SHOP • GROW • PROSPER`  
**Version:** 1.0.0 (Production Release)  
**Domain:** `https://vendlex.vercel.app`  
**Target Market:** All 47 Counties in Kenya (Nairobi HQ, Mombasa, Kisumu, Nakuru, Eldoret, etc.)

---

## 📋 Table of Contents
1. [Executive Summary & Platform Overview](#1-executive-summary--platform-overview)
2. [Tech Stack & Architecture](#2-tech-stack--architecture)
3. [User Roles & Access Control](#3-user-roles--access-control)
4. [Public Marketplace & Shopping Flow](#4-public-marketplace--shopping-flow)
5. [Service Booking & Request Engine](#5-service-booking--request-engine)
6. [Business Directory & Merchant Profiles](#6-business-directory--merchant-profiles)
7. [Seller SaaS Hub & Merchant Portal](#7-seller-saas-hub--merchant-portal)
8. [SuperAdmin Command Center](#8-superadmin-command-center)
9. [Safaricom M-Pesa Daraja 2.0 Integration](#9-safaricom-m-pesa-daraja-20-integration)
10. [Escrow Payment & Logistics Protection](#10-escrow-payment--logistics-protection)
11. [State Management & Data Stores](#11-state-management--data-stores)
12. [API Reference Directory](#12-api-reference-directory)
13. [Installation & Deployment Guide](#13-installation--deployment-guide)

---

## 1. Executive Summary & Platform Overview

**VendLex** is Kenya's all-in-one digital marketplace and business growth SaaS platform. It bridges the gap between buyers, local merchants, certified service technicians, and logistics providers across all 47 counties in Kenya.

### Key Pillars:
- **SHOP**: Discover authentic Kenyan electronics, African fashion, agricultural tech, solar systems, and daily goods with direct **Lipa na M-Pesa** payments.
- **GROW**: Equip Kenyan MSMEs with digital storefronts, KRA-compliant eTIMS invoice generators, AI marketing tools, and inventory management.
- **PROSPER**: Escrow payment protection, verified merchant badges, and nationwide logistics tracking (Fargo, G4S, Wells Fargo).

---

## 2. Tech Stack & Architecture

- **Framework**: Next.js 15.1.7 (App Router with Server & Client Components)
- **UI Library**: React 19, Tailwind CSS 3.4
- **Iconography**: Lucide React Icons
- **Animation**: Framer Motion & Canvas Confetti
- **Payment Gateway**: Safaricom M-Pesa Daraja 2.0 REST API (STK Push, C2B, Query status)
- **Styling**: Dark / Light Theme System with CSS Variables & Glassmorphism Panels
- **State Hydration**: Persistent LocalStorage with React Context Providers

---

## 3. User Roles & Access Control

The platform features 3 primary user personas accessible via the instant **Role Switcher** in the top navigation bar:

| Role | Access Scope | Key Features |
| :--- | :--- | :--- |
| **CUSTOMER** | Public Marketplace | Browse items, add to cart/wishlist, M-Pesa checkout, track orders, request service quotes. |
| **SELLER / BUSINESS** | Merchant SaaS Hub (`/seller/*`) | Product catalog, device photo uploads, KRA invoices, AI assistant, promotions, inventory analytics. |
| **ADMIN** | Admin Command Center (`/admin`) | Escrow payout release, courier dispatch tracking, service request assignment, Daraja API credentials, KYC moderation. |

---

## 4. Public Marketplace & Shopping Flow

### Pages:
- **Home (`/`)**: Hero slideshow with Ken-Burns zoom, animated category bubbles, flash deals countdown, featured businesses, service spotlight, and buyer trust stats.
- **Marketplace (`/marketplace`)**: 2-column mobile grid view / 3-column desktop view, keyword search, price range sliders, county filters, verified seller toggles, and Quick View modals.
- **Product Details (`/products/[slug]`)**: Product galleries, stock countdown, seller WhatsApp/Call links, customer reviews, specification tables, related products, and sticky mobile purchase bar.
- **Cart (`/cart`) & Checkout (`/checkout`)**: 5-step wizard (Customer &rarr; Delivery &rarr; Shipping &rarr; M-Pesa Payment &rarr; Receipt Confirmation).

---

## 5. Service Booking & Request Engine

### Pages:
- **Services Directory (`/services`)**: Hire verified plumbers, electricians, commercial photographers, solar engineers, and caterers.
- **Interactive Request Modal (`ServiceRequestModal`)**: Customers input their county, appointment date, and problem description.
- **Admin Dispatch Integration**: Requests populate directly in **Admin Service Requests** for technician dispatch.

---

## 6. Business Directory & Merchant Profiles

### Pages:
- **Business Directory (`/businesses`)**: Search vetted businesses across all 47 counties filtered by category and open hours.
- **Storefront Page (`/businesses/[slug]`)**: Merchant cover photo, business details, county, contact channels (WhatsApp, Phone, Email), store items grid, customer reviews, and verification badge.

---

## 7. Seller SaaS Hub & Merchant Portal

### Dashboard Features (`/seller/*`):
- **Overview (`/seller/dashboard`)**: Metric cards (Total Revenue, Total Orders, Active Listings, Store Views), sales chart, and recent orders.
- **Product Catalog (`/seller/products`)**: Add product modal with **Device File Picker Image Uploads**, live thumbnail previews, and inventory controls.
- **Store Onboarding (`/seller/onboarding`)**: 6-step merchant setup wizard with plan selection (Starter Free, Business, Enterprise).
- **KRA Tax Invoice Generator (`/seller/invoices`)**: Printable KRA-compliant invoices with automatic VAT (16%), ETR signatures, and PDF/Print view.
- **VendLex AI Assistant (`/seller/ai`)**: AI copywriter for generating SEO product descriptions, Instagram marketing posts, and customer reply templates.
- **Inventory & Analytics (`/seller/inventory` & `/seller/analytics`)**: Low stock alerts, stock adjustment modals, and revenue reports.

---

## 8. SuperAdmin Command Center

### Management Modules (`/admin`):
1. **Service Requests & Dispatch**: Review customer service quote requests, dispatch certified providers, and trigger 1-click WhatsApp client chats.
2. **Order Logistics & Escrow Release**: Track customer orders, enter Fargo/G4S tracking numbers, and release escrow payouts to merchants upon delivery.
3. **Safaricom Daraja API Management**: Configure Sandbox/Production Shortcode (174379), Consumer Key, Consumer Secret, Passkey, and test live STK Push prompts.
4. **M-Pesa Transaction Ledger**: Real-time table of all M-Pesa checkout requests, receipts, phone numbers, and payment statuses.
5. **Business KYC & Moderation**: Review uploaded CR12 certificates, business permits, national IDs, and award verified badges.

---

## 9. Safaricom M-Pesa Daraja 2.0 Integration

VendLex includes a complete, production-ready M-Pesa integration:

### Supported Flows:
1. **STK Push (Lipa na M-Pesa Online)**: Triggers an instant M-Pesa PIN prompt directly on the customer's phone (`07XX XXX XXX`).
2. **Callback Webhook (`/api/mpesa/callback`)**: Receives Safaricom payment confirmation, extracts `MpesaReceiptNumber`, `Amount`, `PhoneNumber`, and updates order status.
3. **Transaction Status Query (`/api/mpesa/query`)**: Polls Safaricom API for pending checkout requests.
4. **Transaction Ledger (`/api/mpesa/transactions`)**: Returns transaction history to Admin console.

---

## 10. Escrow Payment & Logistics Protection

To guarantee 100% trust between buyers and sellers:
1. **Payment Lock**: Customer M-Pesa payments are held in escrow upon checkout (`PAID_ESCROW`).
2. **Courier Tracking**: Admin inputs official courier tracking codes (`FARGO-89421`, `G4S-19204`).
3. **Fund Release**: Escrow funds are released to merchant account only after buyer receives verified delivery.

---

## 11. State Management & Data Stores

Located in `lib/store/`:
- `PlatformProvider` (`platform-store.tsx`): Central state synchronization between public website actions and Admin Command Center.
- `CartProvider` (`cart-store.tsx`): Shopping cart state, delivery county fee calculation, promo codes (`KARIBU10`), subtotal/total calculation.
- `AuthProvider` (`auth-store.tsx`): Manages current active user role (`CUSTOMER`, `SELLER`, `ADMIN`).
- `WishlistProvider` (`wishlist-store.tsx`): Saved items list with persistent storage.
- `NotificationProvider` (`notification-store.tsx`): Real-time toast alerts and admin notifications.

---

## 12. API Reference Directory

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/api/mpesa/stkpush` | `POST` | Initiates M-Pesa STK Push prompt to user's phone. |
| `/api/mpesa/callback` | `POST` | Safaricom callback URL receiving M-Pesa payment receipts. |
| `/api/mpesa/query` | `POST` | Queries status of pending CheckoutRequestID. |
| `/api/mpesa/transactions` | `GET` | Returns full list of M-Pesa transactions to Admin dashboard. |

---

## 13. Installation & Deployment Guide

### Prerequisites:
- Node.js 18.x or later
- npm or yarn

### Steps:
```bash
# 1. Clone or navigate to project directory
cd C:\Users\ADMIN\.gemini\antigravity\scratch\sokolink

# 2. Install dependencies
npm install

# 3. Development Server
npm run dev

# 4. Production Build Verification
npm run build

# 5. Production Start
npm run start
```

---
*Documentation compiled and verified for VendLex Kenya Platform v1.0.0.*
