import React from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, Sparkles, Send, ShieldCheck, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-brand-charcoal text-white pt-16 pb-12 border-t border-brand-dark-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Seller Onboarding Callout Banner */}
        <div className="bg-gradient-to-r from-brand-emerald-dark to-brand-emerald p-6 sm:p-8 rounded-3xl mb-14 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 bg-brand-gold text-brand-charcoal font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Biashara ya Kidijitali
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              Are you a Kenyan Business Owner?
            </h3>
            <p className="text-sm text-emerald-100 max-w-xl">
              Get discovered by thousands of shoppers daily. Launch your digital storefront, receive direct M-Pesa payments, and automate your inventory today.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/seller/onboarding"
              className="bg-white text-brand-emerald hover:bg-emerald-50 font-bold px-6 py-3.5 rounded-xl text-sm shadow-md transition-all"
            >
              Start Selling Free &rarr;
            </Link>
          </div>
        </div>

        {/* 5-Column Grid per Guideline #32 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-8 pb-12 border-b border-gray-800">
          {/* Brand & Mission Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1 space-y-3">
            <Link href="/" className="inline-block bg-white p-2 rounded-xl border border-white/40 shadow-sm max-w-full">
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
              Kenya&apos;s digital commerce and services ecosystem. Connecting customers, businesses, sellers and services across all 47 counties.
            </p>
            <div className="space-y-1.5 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-emerald-light shrink-0" />
                <span>Nairobi, Kenya • 47 Counties</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-gold-light shrink-0" />
                <a href="tel:+254798159503" className="hover:text-white transition-colors">+254 798 159 503</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href="mailto:calebngiciri075@gmail.com" className="hover:text-white transition-colors">calebngiciri075@gmail.com</a>
              </div>
            </div>
          </div>

          {/* COLUMN 1: SHOP per Guideline #32 */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider text-emerald-400">
              SHOP
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <Link href="/marketplace" className="hover:text-white transition-colors">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link href="/deals" className="hover:text-white transition-colors flex items-center gap-1">
                  <span>Deals</span>
                  <span className="text-[10px] bg-red-950 text-red-400 px-1.5 py-0.2 rounded font-bold">HOT</span>
                </Link>
              </li>
              <li>
                <Link href="/marketplace" className="hover:text-white transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/customer/wishlist" className="hover:text-white transition-colors">
                  Wishlist
                </Link>
              </li>
              <li>
                <Link href="/delivery" className="hover:text-white transition-colors">
                  Delivery Tracking
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 2: SELL per Guideline #32 */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider text-amber-300">
              SELL
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <Link href="/seller/onboarding" className="hover:text-white transition-colors font-bold text-amber-200">
                  Start Selling
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  Pricing &amp; Plans
                </Link>
              </li>
              <li>
                <Link href="/seller/dashboard" className="hover:text-white transition-colors">
                  Merchant Dashboard
                </Link>
              </li>
              <li>
                <Link href="/seller/inventory" className="hover:text-white transition-colors">
                  Inventory Manager
                </Link>
              </li>
              <li>
                <Link href="/seller/invoices" className="hover:text-white transition-colors">
                  eTIMS Invoicing
                </Link>
              </li>
              <li>
                <Link href="/seller/ai" className="hover:text-white transition-colors">
                  Business Copilot AI
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 3: SERVICES per Guideline #32 */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider text-teal-400">
              SERVICES
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  Find Professionals
                </Link>
              </li>
              <li>
                <Link href="/seller/onboarding?type=service" className="hover:text-white transition-colors">
                  Become a Provider
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  Service Categories
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  Request Quotes
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 4: COMPANY per Guideline #32 */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider text-gray-200">
              COMPANY
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  About VendLex
                </Link>
              </li>
              <li>
                <Link href="/b2b" className="hover:text-white transition-colors">
                  Corporate B2B
                </Link>
              </li>
              <li>
                <Link href="/discover" className="hover:text-white transition-colors">
                  Discover Feed
                </Link>
              </li>
              <li>
                <a href="mailto:careers@vendlex.co.ke" className="hover:text-white transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <Link href="/help" className="hover:text-white transition-colors">
                  Help Center &amp; Support
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 5: LEGAL per Guideline #32 */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider text-gray-200">
              LEGAL
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
                  Returns &amp; Refunds
                </Link>
              </li>
              <li>
                <Link href="/customer/disputes" className="hover:text-white transition-colors">
                  Dispute Center
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar per Guideline #32 */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span>&copy; {new Date().getFullYear()} VendLex Kenya Ltd. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-2 font-black tracking-wider text-amber-400 text-xs sm:text-sm">
            <span>SHOP • GROW • PROSPER</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-3 py-1 rounded-full text-[11px]">
              <span>Built for Kenya</span>
              <span>🇰🇪</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
