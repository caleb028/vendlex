import React from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, Sparkles, ShieldCheck, Smartphone, Lock, CheckCircle2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-brand-charcoal text-white pt-16 pb-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Seller Onboarding Callout Banner */}
        <div className="bg-gradient-to-r from-brand-emerald-dark via-brand-emerald to-brand-emerald-dark p-6 sm:p-8 rounded-3xl mb-14 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 border border-emerald-500/30">
          <div className="space-y-1.5 text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 bg-brand-gold text-brand-charcoal font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              Biashara ya Kidijitali
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Are you a Kenyan Business Owner or Service Provider?
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl leading-relaxed">
              Get discovered by thousands of buyers daily. Launch your digital storefront, receive direct M-Pesa payments with zero transaction fees, and automate your invoicing today.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/seller/onboarding"
              className="bg-white text-brand-emerald hover:bg-emerald-50 font-extrabold px-6 py-3.5 rounded-xl text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all active:scale-98"
            >
              Start Selling Free &rarr;
            </Link>
          </div>
        </div>

        {/* 5-Column Navigation Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 pb-12 border-b border-gray-800">
          {/* Brand & Mission Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1 space-y-3">
            <Link href="/" className="inline-block bg-white p-2.5 rounded-xl border border-white/40 shadow-sm max-w-full">
              <img
                src="/logo/vendlex-logo.png"
                alt="VendLex - SHOP • GROW • PROSPER"
                className="h-10 sm:h-12 w-auto max-w-[200px] object-contain"
              />
            </Link>
            <div className="text-[10px] sm:text-[11px] font-extrabold tracking-[0.16em] text-brand-gold uppercase select-none">
              SHOP • GROW • PROSPER
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Kenya&apos;s digital commerce and SaaS ecosystem. Connecting shoppers, merchants, and service experts across all 47 counties.
            </p>
            <div className="space-y-2 text-xs text-gray-400 pt-1">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Nairobi, Kenya • 47 Counties</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <a href="tel:+254798159503" className="hover:text-white transition-colors font-medium">+254 798 159 503</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href="mailto:karibu@vendlex.vercel.app" className="hover:text-white transition-colors font-medium">karibu@vendlex.vercel.app</a>
              </div>
            </div>
          </div>

          {/* COLUMN 1: SHOP */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider">
              SHOP
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <Link href="/marketplace" className="hover:text-white transition-colors">
                  Marketplace Catalog
                </Link>
              </li>
              <li>
                <Link href="/deals" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>Today&apos;s Deals</span>
                  <span className="text-[9px] bg-red-900/80 text-red-300 px-1.5 py-0.5 rounded font-black">HOT</span>
                </Link>
              </li>
              <li>
                <Link href="/marketplace" className="hover:text-white transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/customer/wishlist" className="hover:text-white transition-colors">
                  Saved Wishlist
                </Link>
              </li>
              <li>
                <Link href="/delivery" className="hover:text-white transition-colors">
                  Delivery Tracking
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 2: SELL */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider">
              SELL &amp; GROW
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <Link href="/seller/onboarding" className="hover:text-white transition-colors font-bold text-amber-200">
                  Start Selling
                </Link>
              </li>
              <li>
                <Link href="/advertise" className="hover:text-white transition-colors font-bold text-amber-300">
                  Advertise Business (KES 1,020)
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  Merchant Plans &amp; Pricing
                </Link>
              </li>
              <li>
                <Link href="/seller/dashboard" className="hover:text-white transition-colors">
                  Seller Dashboard
                </Link>
              </li>
              <li>
                <Link href="/seller/inventory" className="hover:text-white transition-colors">
                  Inventory Manager
                </Link>
              </li>
              <li>
                <Link href="/seller/invoices" className="hover:text-white transition-colors">
                  eTIMS Digital Invoicing
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 3: SERVICES */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-teal-400 uppercase tracking-wider">
              LOCAL SERVICES
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  Find Verified Trades
                </Link>
              </li>
              <li>
                <Link href="/seller/onboarding?type=service" className="hover:text-white transition-colors">
                  Become a Service Pro
                </Link>
              </li>
              <li>
                <Link href="/services?category=Electrician" className="hover:text-white transition-colors">
                  Electricians &amp; Solar
                </Link>
              </li>
              <li>
                <Link href="/services?category=Plumber" className="hover:text-white transition-colors">
                  Plumbing &amp; Drainage
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  Request Instant Quote
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 4: COMPANY & APP */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-gray-200 uppercase tracking-wider">
              COMPANY &amp; APP
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <Link href="/download" className="hover:text-white transition-colors font-bold text-amber-300 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                  <span>Download APK &bull; Android</span>
                </Link>
              </li>
              <li>
                <span className="text-[10px] text-gray-500 block leading-tight">
                  Direct standalone download (Not PlayStore)
                </span>
              </li>
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  About VendLex Kenya
                </Link>
              </li>
              <li>
                <Link href="/b2b" className="hover:text-white transition-colors">
                  Corporate B2B Hub
                </Link>
              </li>
              <li>
                <Link href="/discover" className="hover:text-white transition-colors">
                  Discover Feed
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-white transition-colors">
                  Help Center &amp; Disputes
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 5: TRUST & COMPLIANCE */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-gray-200 uppercase tracking-wider">
              SECURITY &amp; LEGAL
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-white transition-colors">
                  Returns &amp; Escrow Policy
                </Link>
              </li>
              <li>
                <Link href="/customer/disputes" className="hover:text-white transition-colors">
                  Dispute Resolution
                </Link>
              </li>
              <li>
                <Link href="/account/documents" className="hover:text-white transition-colors">
                  Document Verification
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Official Kenyan Payment & Trust Standards Strip */}
        <div className="py-6 border-b border-gray-800 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[11px] font-bold text-gray-300 uppercase">Accepted Payments:</span>
            <span className="bg-emerald-950 text-emerald-300 border border-emerald-800/80 px-2.5 py-1 rounded-md text-[11px] font-bold">
              📱 Lipa na M-Pesa STK
            </span>
            <span className="bg-red-950 text-red-300 border border-red-800/80 px-2.5 py-1 rounded-md text-[11px] font-bold">
              Airtel Money
            </span>
            <span className="bg-blue-950 text-blue-300 border border-blue-800/80 px-2.5 py-1 rounded-md text-[11px] font-bold">
              Visa &amp; Mastercard (3D Secure)
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap text-[11px]">
            <div className="flex items-center gap-1.5 text-gray-300">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>256-Bit TLS Bank Encryption</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Kenya Data Protection Act (2019)</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Slogan & Region */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span>&copy; {new Date().getFullYear()} VendLex Technologies Kenya Ltd. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-2 font-black tracking-wider text-amber-400 text-xs sm:text-sm">
            <span>SHOP • GROW • PROSPER</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-3 py-1 rounded-full text-[11px]">
              <span>Coverage: All 47 Counties</span>
              <span>🇰🇪</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
