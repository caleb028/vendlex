"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  ShoppingBag,
  Heart,
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
  Search,
  User,
  MapPin,
  Sparkles,
  HelpCircle,
  Briefcase,
  Gift,
  Compass,
  Store,
  Info,
  ShieldCheck,
  LogOut,
  Lock,
  FileText,
  Megaphone,
  Smartphone,
  Download,
  Flame,
} from "lucide-react";
import { useCart } from "@/lib/store/cart-store";
import { useWishlist } from "@/lib/store/wishlist-store";
import { useAuth } from "@/lib/store/auth-store";
import { CartDrawer } from "./cart-drawer";
import { NotificationDropdown } from "./notification-dropdown";
import { KENYAN_COUNTIES } from "@/lib/data/kenya-data";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCounty, setSelectedCounty] = useState("Nairobi");
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);

  const moreRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { itemCount, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, role, logout } = useAuth();

  const handleSignOut = async () => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    await logout();
    router.push("/login");
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setMoreDropdownOpen(false);
      }
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setLocationDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("vendlex_theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
    const savedCounty = localStorage.getItem("vendlex_county");
    if (savedCounty) {
      setSelectedCounty(savedCounty);
    }
  }, []);

  const toggleTheme = () => {
    if (darkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("vendlex_theme", "light");
      setDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("vendlex_theme", "dark");
      setDarkMode(true);
    }
  };

  const handleSelectCounty = (county: string) => {
    setSelectedCounty(county);
    localStorage.setItem("vendlex_county", county);
    setLocationDropdownOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/marketplace?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Exactly 4 primary links per Section 9
  const primaryLinks = [
    { href: "/marketplace", label: "Shop" },
    { href: "/businesses", label: "Businesses" },
    { href: "/services", label: "Services" },
    { href: "/deals", label: "Deals" },
  ];

  // Categorized More items for a structured, polished dropdown
  const moreCategories = [
    {
      group: "Explore & Deals",
      items: [
        { href: "/deals", label: "Today's Hot Deals", desc: "Limited-time flash discounts", icon: Flame },
        { href: "/counties", label: "All 47 Counties", desc: "Explore Kenya region by region", icon: MapPin },
        { href: "/account/documents", label: "Verified Documents", desc: "Digital receipts & certificates", icon: ShieldCheck },
        { href: "/customer/dashboard", label: "Rewards & Vouchers", desc: "VendPoints loyalty perks", icon: Gift },
      ],
    },
    {
      group: "Business & Growth",
      items: [
        { href: "/advertise", label: "Advertise Business", desc: "KES 1,020 / 30 Days local promo", icon: Megaphone },
        { href: "/b2b", label: "Corporate B2B Hub", desc: "Wholesale & institutional procurement", icon: Briefcase },
        { href: "/discover", label: "Discover Feed", desc: "Trending local commerce posts", icon: Compass },
      ],
    },
    {
      group: "Mobile & Trust",
      items: [
        { href: "/download", label: "Download App (APK)", desc: "Direct Android APK & WebAPK (Not PlayStore)", icon: Smartphone },
        { href: "/help", label: "Help & Buyer Protection", desc: "24/7 Escrow & dispute care", icon: HelpCircle },
        { href: "/", label: "About VendLex", desc: "Our platform mission & standards", icon: Info },
      ],
    },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-200 ${
          isScrolled
            ? "bg-white/95 dark:bg-brand-dark-bg/95 backdrop-blur-md border-b border-border/80 dark:border-brand-dark-border/80 shadow-sm py-2"
            : "bg-white dark:bg-brand-dark-bg border-b border-border/50 dark:border-brand-dark-border/50 py-2.5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 lg:gap-4">
            {/* 1. LARGE BRANDING CONTAINER */}
            <div className="flex items-center gap-3 lg:gap-5 xl:gap-6 shrink-0">
              <Link
                href="/"
                className="flex items-center gap-2.5 sm:gap-3 group shrink-0 select-none py-0.5 rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-emerald"
                aria-label="VendLex Kenya - Home"
              >
                {/* Large Logo / Mark: 40–52px height desktop, 36–40px mobile */}
                <div className="relative flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-[1.02]">
                  <img
                    src="/logo/vendlex-mark.png"
                    alt="VendLex Logo"
                    className="h-9 sm:h-10 lg:h-11 xl:h-12 w-auto object-contain transition-all duration-200 group-hover:brightness-105"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/logo/vendlex-logo.png";
                    }}
                  />
                </div>

                {/* Authoritative Brand Name: VENDLEX with Official Slogan */}
                <div className="flex flex-col justify-center leading-none">
                  <span className="text-[18px] sm:text-[21px] lg:text-[24px] xl:text-[26px] font-black tracking-[-0.02em] text-foreground transition-colors duration-200 group-hover:text-brand-emerald">
                    VENDLEX
                  </span>
                  <span className="text-[7.5px] sm:text-[8.5px] lg:text-[9.5px] font-extrabold tracking-[0.16em] text-brand-gold uppercase mt-0.5 select-none">
                    SHOP • GROW • PROSPER
                  </span>
                </div>
              </Link>

              {/* 2. PRIMARY DESKTOP NAV LINKS */}
              <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                {primaryLinks.map((link) => {
                  const isActive = pathname.startsWith(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`px-3 py-1.5 rounded-lg transition-colors ${
                        isActive
                          ? "text-brand-emerald font-bold bg-emerald-50 dark:bg-emerald-950/40"
                          : "hover:text-foreground hover:bg-muted/40"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}

                {/* "More ▾" Structured Mega Dropdown */}
                <div ref={moreRef} className="relative">
                  <button
                    onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                      moreDropdownOpen
                        ? "text-foreground bg-muted/60"
                        : "hover:text-foreground hover:bg-muted/40"
                    }`}
                  >
                    <span>More</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${moreDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {moreDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-[480px] bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-2xl shadow-modal p-4 z-50 animate-scaleUp grid grid-cols-2 gap-4">
                      {moreCategories.map((cat, idx) => (
                        <div key={idx} className={idx === 2 ? "col-span-2 pt-2 border-t border-border/60 dark:border-brand-dark-border/60" : "space-y-1"}>
                          <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground px-2 block mb-1">
                            {cat.group}
                          </span>
                          <div className={idx === 2 ? "grid grid-cols-3 gap-2" : "space-y-1"}>
                            {cat.items.map((item) => {
                              const Icon = item.icon;
                              return (
                                <Link
                                  key={item.href}
                                  href={item.href}
                                  onClick={() => setMoreDropdownOpen(false)}
                                  className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-muted/50 transition-colors group"
                                >
                                  <div className="p-1.5 rounded-lg bg-muted text-muted-foreground group-hover:text-brand-emerald group-hover:bg-brand-emerald-soft transition-colors mt-0.5 shrink-0">
                                    <Icon className="w-3.5 h-3.5" />
                                  </div>
                                  <div>
                                    <span className="text-xs font-bold text-foreground block group-hover:text-brand-emerald transition-colors leading-snug">
                                      {item.label}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground block leading-tight line-clamp-1">
                                      {item.desc}
                                    </span>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </nav>
            </div>

            {/* 3. SEARCH BAR (Protected width to prevent right actions from shifting) */}
            <div className="hidden md:flex flex-1 min-w-[140px] max-w-xs lg:max-w-sm xl:max-w-md mx-1 lg:mx-2">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, businesses or services..."
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-muted/40 dark:bg-brand-dark-bg/60 border border-border dark:border-brand-dark-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/10 transition-all font-medium"
                />
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
              </form>
            </div>

            {/* 4. RIGHT ACTIONS: Location, Wishlist, Cart, Account, Sell CTA */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* County Location Pill (Compact) */}
              <div ref={locationRef} className="relative hidden xl:block">
                <button
                  onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-muted/40 hover:bg-muted/70 text-xs font-semibold text-foreground border border-border/60 transition-colors"
                  title="Deliver to county"
                >
                  <MapPin className="w-3 h-3 text-brand-emerald shrink-0" />
                  <span className="truncate max-w-[90px]">{selectedCounty}</span>
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </button>

                {locationDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-56 max-h-72 overflow-y-auto bg-white dark:bg-brand-dark-card border border-border rounded-2xl shadow-xl p-1.5 z-50 scrollbar-thin">
                    <div className="px-2.5 py-1.5 text-[10px] font-bold text-muted-foreground uppercase border-b border-border mb-1">
                      Deliver to Kenya County:
                    </div>
                    {KENYAN_COUNTIES.map((county) => (
                      <button
                        key={county}
                        onClick={() => handleSelectCounty(county)}
                        className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg transition-colors ${
                          selectedCounty === county
                            ? "bg-brand-emerald text-white font-bold"
                            : "hover:bg-muted text-foreground font-medium"
                        }`}
                      >
                        {county}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Wishlist */}
              <Link
                href="/customer/wishlist"
                className="relative p-2 rounded-xl text-muted-foreground hover:text-brand-red hover:bg-muted/40 transition-colors"
                title="Wishlist"
                aria-label="Wishlist"
              >
                <Heart className="w-4 h-4" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-brand-red text-white text-[9px] font-black rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 rounded-xl text-muted-foreground hover:text-brand-emerald hover:bg-muted/40 transition-colors"
                title="Shopping Cart"
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="w-4 h-4" />
                {itemCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-brand-emerald text-white text-[9px] font-black rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* Notifications */}
              <NotificationDropdown />

              {/* Account Dropdown Menu with Sign Out Option - Elevated Polish */}
              {user ? (
                <div ref={userMenuRef} className="relative hidden sm:block">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all text-xs font-semibold ${
                      userDropdownOpen
                        ? "bg-muted/80 border-brand-emerald/60 text-foreground ring-2 ring-brand-emerald/20"
                        : "bg-muted/40 hover:bg-muted/70 border-border/80 text-foreground hover:border-brand-emerald/40"
                    }`}
                    title="User Account Menu"
                    aria-expanded={userDropdownOpen}
                  >
                    <div className="w-6 h-6 rounded-full bg-brand-emerald text-white flex items-center justify-center font-black text-[11px] shadow-xs shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col text-left leading-none">
                      <span className="max-w-[85px] truncate text-xs font-bold text-foreground">
                        {user.name.split(" ")[0]}
                      </span>
                      <span className="text-[9px] text-brand-emerald font-semibold uppercase tracking-wider">
                        {user.role === "SUPER_ADMIN" ? "Admin" : user.role === "SELLER" ? "Seller" : "Account"}
                      </span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${userDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-2xl shadow-2xl p-2 z-50 animate-scaleUp">
                      {/* User Header */}
                      <div className="px-3 py-2.5 border-b border-border/80 dark:border-brand-dark-border/80 mb-1">
                        <div className="font-bold text-xs text-foreground truncate">{user.name}</div>
                        <div className="text-[11px] text-muted-foreground truncate">{user.email || user.phone}</div>
                        <div className="mt-1.5">
                          <span className="inline-block text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-brand-emerald-soft text-brand-emerald border border-brand-emerald/20">
                            {user.role}
                          </span>
                        </div>
                      </div>

                      {/* Navigation Links */}
                      <div className="space-y-0.5 py-1">
                        <Link
                          href={
                            role === "ADMIN" || role === "SUPER_ADMIN"
                              ? "/admin"
                              : role === "SELLER" || role === "BUSINESS_OWNER"
                              ? "/seller/dashboard"
                              : "/customer/dashboard"
                          }
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-muted/50 hover:text-brand-emerald transition-colors"
                        >
                          <Store className="w-4 h-4 text-muted-foreground" />
                          <span>{role === "ADMIN" || role === "SUPER_ADMIN" ? "Admin Portal" : role === "SELLER" || role === "BUSINESS_OWNER" ? "Seller Dashboard" : "My Account & Orders"}</span>
                        </Link>

                        <Link
                          href="/account/advertisements"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-muted/50 hover:text-brand-emerald transition-colors"
                        >
                          <Megaphone className="w-4 h-4 text-muted-foreground" />
                          <span>My Advertisements</span>
                        </Link>

                        <Link
                          href="/account/security"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-muted/50 hover:text-brand-emerald transition-colors"
                        >
                          <Lock className="w-4 h-4 text-muted-foreground" />
                          <span>Security &amp; Sessions</span>
                        </Link>

                        <Link
                          href="/account/documents"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-muted/50 hover:text-brand-emerald transition-colors"
                        >
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span>Verified Documents</span>
                        </Link>
                      </div>

                      {/* Sign Out Option */}
                      <div className="border-t border-border/80 dark:border-brand-dark-border/80 pt-1 mt-1">
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4 text-red-600 dark:text-red-400" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="px-3 py-1.5 rounded-xl border border-brand-emerald/30 bg-emerald-50/70 dark:bg-emerald-950/40 hover:bg-brand-emerald hover:text-white text-brand-emerald dark:text-emerald-300 transition-all hidden sm:flex items-center gap-1.5 text-xs font-bold shadow-xs active:scale-98"
                  title="Sign In or Create Account"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
              )}

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                aria-label="Toggle theme"
              >
                {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Primary CTA (Section 9: Sell on VendLex) */}
              <Link
                href={
                  user && (role === "SELLER" || role === "BUSINESS_OWNER")
                    ? "/seller/dashboard"
                    : "/seller/onboarding"
                }
                className="bg-brand-emerald hover:bg-brand-emerald-dark text-white font-bold text-xs py-2 px-3.5 rounded-xl shadow-xs hover:shadow-sm transition-all shrink-0 ml-1 hidden sm:inline-flex items-center gap-1"
              >
                <span>
                  {user && (role === "SELLER" || role === "BUSINESS_OWNER")
                    ? "Seller Hub"
                    : "Sell on VendLex"}
                </span>
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors ml-1"
                aria-label="Open mobile menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar Row (When on phone) */}
          <div className="mt-2.5 md:hidden">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, businesses or services..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-muted/40 dark:bg-brand-dark-bg/60 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand-emerald font-medium"
              />
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
            </form>
          </div>
        </div>

        {/* Mobile Slide-Over Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-brand-dark-card border-b border-border px-4 py-4 space-y-3 animate-fadeIn">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase px-2">Marketplace</span>
              {primaryLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-xs font-bold text-foreground hover:bg-muted/50"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="border-t border-border pt-2 space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase px-2">Discover &amp; Services</span>
              {moreCategories.flatMap((c) => c.items).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-xs font-medium text-foreground hover:bg-muted/50"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Mobile User Profile & Sign Out or Sign In */}
            {user ? (
              <div className="border-t border-border pt-3 space-y-2">
                <div className="px-2">
                  <div className="text-xs font-bold text-foreground">{user.name}</div>
                  <div className="text-[11px] text-muted-foreground">{user.email || user.phone}</div>
                </div>
                <Link
                  href={
                    role === "ADMIN" || role === "SUPER_ADMIN"
                      ? "/admin"
                      : role === "SELLER" || role === "BUSINESS_OWNER"
                      ? "/seller/dashboard"
                      : "/customer/dashboard"
                  }
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-muted/50"
                >
                  {role === "ADMIN" || role === "SUPER_ADMIN" ? "Admin Portal" : role === "SELLER" || role === "BUSINESS_OWNER" ? "Seller Dashboard" : "My Account & Orders"}
                </Link>
                <Link
                  href="/account/security"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-muted/50"
                >
                  Security &amp; Sessions
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-red-600 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="border-t border-border pt-3 space-y-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full block text-center bg-muted/60 text-foreground font-bold text-xs py-2.5 rounded-xl hover:bg-muted"
                >
                  Sign In / Register
                </Link>
                <Link
                  href="/seller/onboarding"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full block text-center bg-brand-emerald text-white font-bold text-xs py-2.5 rounded-xl shadow-xs"
                >
                  Sell on VendLex
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Cart Drawer */}
      <CartDrawer />
    </>
  );
}
