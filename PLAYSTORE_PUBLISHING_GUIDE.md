# 🚀 VendLex Google Play Store Publishing Guide

This guide provides the complete, step-by-step instructions to package and publish **VendLex** to the **Google Play Store**.

---

## 📱 Architecture: Google Trusted Web Activity (TWA)

VendLex is built with **Google Trusted Web Activity (TWA)**, the official Google-recommended architecture for publishing Next.js Progressive Web Apps directly to Google Play.

### Key Advantages:
1. **Zero Maintenance Overhead**: Any update, product addition, UI improvement, or fix deployed to Vercel (`https://vendlex.vercel.app`) reflects **instantly** inside users' installed Android apps without needing to rebuild or re-submit to Google.
2. **Native Android App Experience**: Runs in full-screen standalone mode (no browser address bar), with a native launcher icon, branded splash screen, and push notifications.
3. **Ultra-lightweight**: Install size is under 2MB compared to 50MB+ for traditional apps, ensuring fast downloads for Kenyan users across mobile data networks.

---

## 🛠️ Step 1: Pre-Configured Files in Codebase

The repository is already configured with all Google Play Store compliance files:

- `public/manifest.json`: Web App Manifest with icons, theme colors (`#087443`), shortcuts, and orientation.
- `public/sw.js`: Service worker for offline caching and PWA installability criteria.
- `public/.well-known/assetlinks.json`: Digital Asset Links linking `vendlex.vercel.app` with Android package `ke.co.vendlex.app`.
- `twa-manifest.json`: Google Bubblewrap configuration for automated Android Studio build.

---

## 📦 Step 2: Generate the Android App Bundle (.aab)

You have two simple ways to generate your Google Play `.aab` package:

### Method A: Using PWABuilder (Easiest - 1 Click, No Android Studio Needed)

1. Open **[PWABuilder.com](https://www.pwabuilder.com)** in your browser.
2. Enter your URL: `https://vendlex.vercel.app` and click **Start**.
3. PWABuilder will analyze your PWA (it will score 100% with the manifest and service worker).
4. Click **Package for Stores** &rarr; Choose **Google Play**.
5. Fill in the options:
   - **Package ID**: `ke.co.vendlex.app`
   - **App Name**: `VendLex - Kenyan Marketplace`
   - **Launcher Name**: `VendLex`
   - **Theme Color**: `#087443`
   - **Background Color**: `#071A13`
   - **Signing key**: Choose *Create new* (or use your existing keystore).
6. Click **Generate Package**.
7. Download the `.zip` file containing your signed `app-release.aab`.

---

### Method B: Using Google Bubblewrap CLI (Command Line)

If you have Node.js and Java (JDK 17+) installed:

```bash
# 1. Install Google Bubblewrap CLI globally
npm install -g @bubblewrap/cli

# 2. Initialize and build using the pre-configured twa-manifest.json
bubblewrap init --manifest=https://vendlex.vercel.app/manifest.json

# 3. Build the signed release bundle (.aab)
bubblewrap build
```

The generated `app-release-bundle.aab` will be created in your build directory.

---

## 🌐 Step 3: Google Play Console Setup

1. **Register Developer Account**:
   - Go to **[play.google.com/console](https://play.google.com/console)**.
   - Pay the one-time **$25 USD** Google developer registration fee.
   - Complete your developer identity verification.

2. **Create New App**:
   - Click **Create App**.
   - **App name**: `VendLex - Kenya Marketplace`
   - **Default language**: English (United States) or English (Kenya)
   - **App or Game**: App
   - **Free or Paid**: Free
   - Accept the Developer Program Policies.

---

## 📝 Step 4: Store Listing Details

Copy and paste these pre-written metadata fields into your Google Play Store Listing:

### 1. App Title
`VendLex: Kenya Marketplace & Deals` *(30 chars)*

### 2. Short Description
`Buy verified products, discover local businesses & pay with Lipa na M-Pesa.` *(78 chars)*

### 3. Full Description
```
Karibu VendLex — Kenya's trusted digital marketplace and business hub connecting buyers, verified sellers, and local service providers across all 47 counties.

Key Features:
🛍️ BROWSE & SHOP AUTHENTIC PRODUCTS
Discover smartphones, laptops, electronics, authentic African fashion, home decor, and agricultural essentials from verified Kenyan retailers.

⚡ INSTANT LIPA NA M-PESA & ESCROW
Checkout seamlessly with Lipa na M-Pesa STK push. Your payments are protected by escrow until your goods or services are delivered.

🔧 LOCAL SERVICES & TRADES DIRECTORY
Find and hire verified electricians, plumbers, solar technicians, phone repair specialists, mechanics, and caterers in your county.

💼 POWERFUL SELLER TOOLS
Manage your store catalog, automate PDF customer receipts, track real-time inventory, and reach thousands of shoppers across Kenya.

🇰🇪 47 COUNTIES NATIONWIDE DELIVERY
Fast courier dispatch and countrywide delivery to Nairobi, Mombasa, Kisumu, Nakuru, Eldoret, and all 47 counties.

Download VendLex today and experience modern Kenyan commerce.
```

### 4. Graphic Assets
- **App Icon**: 512x512 PNG (Located in `public/logo/vendlex-icon.png`)
- **Feature Graphic**: 1024x500 JPEG/PNG (Banner image with VendLex branding)
- **Screenshots**: Upload 2 to 8 mobile screenshots (take screenshots of Homepage, Marketplace, Product Detail, and Checkout).

### 5. Categorization & Contact
- **Category**: Shopping / Business
- **Website**: `https://vendlex.vercel.app`
- **Email**: `karibu@vendlex.vercel.app`
- **Privacy Policy URL**: `https://vendlex.vercel.app/help`

---

## 🔒 Step 5: Content Rating & Data Safety Declarations

In the Google Play Console **App Content** section:
1. **Privacy Policy**: Enter `https://vendlex.vercel.app/help`.
2. **Target Age**: 18 and older (or 13+).
3. **Ads Declaration**: Select *No, my app does not contain third-party ads* (or select Yes if displaying internal sponsored business directory).
4. **Data Safety**:
   - Location (Optional, for county-based discovery).
   - Name & Phone Number (For M-Pesa order fulfillment and account creation).
   - All data is encrypted in transit via HTTPS.

---

## 🚀 Step 6: Upload & Release

1. In the Play Console, navigate to **Production** (or **Closed Testing**).
2. Click **Create new release**.
3. Upload the `app-release.aab` file generated in Step 2.
4. Enter Release notes: `Initial official release of VendLex Kenya Marketplace.`
5. Click **Next** &rarr; **Review Release** &rarr; **Start Rollout to Production**.

Google typically reviews and approves new apps within **24 to 72 hours**, after which VendLex will be live and searchable for millions of Android users on the Google Play Store!
