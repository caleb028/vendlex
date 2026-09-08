"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Store,
  Wrench,
  Package,
  Truck,
  ArrowRight,
  TrendingUp,
  Tag,
  Search,
} from "lucide-react";

const ALL_47_COUNTIES = [
  { code: "001", name: "Mombasa", region: "Coast", sellers: 1840, services: 490, products: 12400, popular: "Electronics & Marine Gear", deals: "15% off Beachwear & Gadgets", delivery: "Same-Day (Mombasa Island, Nyali)" },
  { code: "002", name: "Kwale", region: "Coast", sellers: 310, services: 85, products: 1950, popular: "Hospitality & Handcrafts", deals: "10% off Diani Craftwork", delivery: "24h Courier Delivery" },
  { code: "003", name: "Kilifi", region: "Coast", sellers: 620, services: 140, products: 3800, popular: "Cashew Crafts & Solar", deals: "Free shipping over KSh 3,000", delivery: "24h Courier (Malindi & Kilifi Town)" },
  { code: "004", name: "Tana River", region: "Coast", sellers: 120, services: 35, products: 750, popular: "Agri-produce & Honey", deals: "Fresh Mango Batches", delivery: "48h Courier Delivery" },
  { code: "005", name: "Lamu", region: "Coast", sellers: 195, services: 45, products: 1100, popular: "Wood Carving & Kiondos", deals: "Heritage Craft Discounts", delivery: "48h Courier Delivery" },
  { code: "006", name: "Taita Taveta", region: "Coast", sellers: 280, services: 70, products: 1650, popular: "Gemstone Crafts & Macadamia", deals: "10% Mining Gear Deals", delivery: "24h-48h Delivery" },
  { code: "007", name: "Garissa", region: "North Eastern", sellers: 390, services: 80, products: 2400, popular: "Livestock & Textiles", deals: "Somali Fabric Promotions", delivery: "48h Courier Delivery" },
  { code: "008", name: "Wajir", region: "North Eastern", sellers: 210, services: 40, products: 1300, popular: "Solar Energy & Livestock", deals: "Solar Pump Discounts", delivery: "48h Courier Delivery" },
  { code: "009", name: "Mandera", region: "North Eastern", sellers: 180, services: 35, products: 980, popular: "Wholesale Staples & Solar", deals: "Border Commerce Specials", delivery: "48h Courier Delivery" },
  { code: "010", name: "Marsabit", region: "Eastern", sellers: 220, services: 50, products: 1400, popular: "Wind Energy & Livestock", deals: "Clean Energy Bundles", delivery: "48h Courier Delivery" },
  { code: "011", name: "Isiolo", region: "Eastern", sellers: 310, services: 75, products: 1850, popular: "Transport Logistics & Beef", deals: "Transit Hub Specials", delivery: "24h-48h Delivery" },
  { code: "012", name: "Meru", region: "Eastern", sellers: 980, services: 240, products: 6200, popular: "Miraa Agribusiness & Dairy", deals: "Agri-input Flash Sale", delivery: "24h Courier (Meru Town, Maua)" },
  { code: "013", name: "Tharaka Nithi", region: "Eastern", sellers: 290, services: 65, products: 1700, popular: "Grains & Green Grams", deals: "Bulk Cereal Offers", delivery: "24h-48h Delivery" },
  { code: "014", name: "Embu", region: "Eastern", sellers: 540, services: 130, products: 3400, popular: "Macadamia, Coffee & Honey", deals: "Direct Farm Produce", delivery: "24h Courier Delivery" },
  { code: "015", name: "Kitui", region: "Eastern", sellers: 460, services: 110, products: 2800, popular: "Honey, Cotton & Mining", deals: "Kitui Garment Specials", delivery: "24h-48h Delivery" },
  { code: "016", name: "Machakos", region: "Eastern", sellers: 1150, services: 290, products: 7600, popular: "Building Materials & Tech", deals: "Machakos Town Same-Day", delivery: "Same-Day (Athi River, Syokimau)" },
  { code: "017", name: "Makueni", region: "Eastern", sellers: 420, services: 95, products: 2600, popular: "Mango Processing & Grains", deals: "Fruit Concentrate Discounts", delivery: "24h Courier Delivery" },
  { code: "018", name: "Nyandarua", region: "Central", sellers: 480, services: 105, products: 2900, popular: "Potatoes & Fresh Produce", deals: "Farm Produce Direct", delivery: "24h Courier Delivery" },
  { code: "019", name: "Nyeri", region: "Central", sellers: 890, services: 210, products: 5800, popular: "Coffee, Tea & Hardware", deals: "Mount Kenya Hardware Deals", delivery: "24h Courier Delivery" },
  { code: "020", name: "Kirinyaga", region: "Central", sellers: 610, services: 150, products: 3900, popular: "Mwea Pishori Rice & Tomatoes", deals: "Authentic Pishori 10% Off", delivery: "24h Courier Delivery" },
  { code: "021", name: "Murang'a", region: "Central", sellers: 740, services: 175, products: 4600, popular: "Avocado Farming & Dairy", deals: "Hass Avocado Crates", delivery: "24h Courier Delivery" },
  { code: "022", name: "Kiambu", region: "Central", sellers: 1284, services: 326, products: 8492, popular: "Real Estate, Fashion & Tech", deals: "15% Off Thika Road Stores", delivery: "Same-Day (Ruiru, Thika, Kikuyu)" },
  { code: "023", name: "Turkana", region: "Rift Valley", sellers: 280, services: 60, products: 1600, popular: "Fish, Basketry & Solar", deals: "Lake Turkana Fresh Fish", delivery: "48h Courier Delivery" },
  { code: "024", name: "West Pokot", region: "Rift Valley", sellers: 190, services: 45, products: 1150, popular: "Honey & Cattle Agribusiness", deals: "Pure Pokot Honey Sale", delivery: "48h Courier Delivery" },
  { code: "025", name: "Samburu", region: "Rift Valley", sellers: 160, services: 40, products: 950, popular: "Beadwork & Traditional Crafts", deals: "Authentic Shuka & Beads", delivery: "48h Courier Delivery" },
  { code: "026", name: "Trans Nzoia", region: "Rift Valley", sellers: 720, services: 160, products: 4300, popular: "Maize Seeds & Farm Machinery", deals: "Planting Season Promos", delivery: "24h Courier Delivery (Kitale)" },
  { code: "027", name: "Uasin Gishu", region: "Rift Valley", sellers: 1450, services: 380, products: 9200, popular: "Electronics, Agri-tech & Sports", deals: "Eldoret Tech Deals", delivery: "Same-Day (Eldoret CBD)" },
  { code: "028", name: "Elgeyo Marakwet", region: "Rift Valley", sellers: 210, services: 50, products: 1300, popular: "Athletic Gear & Potatoes", deals: "Training Gear Discounts", delivery: "24h-48h Delivery (Iten)" },
  { code: "029", name: "Nandi", region: "Rift Valley", sellers: 410, services: 95, products: 2500, popular: "Tea Processing & Dairy", deals: "Direct Factory Tea Packs", delivery: "24h Courier Delivery" },
  { code: "030", name: "Baringo", region: "Rift Valley", sellers: 310, services: 70, products: 1800, popular: "Honey, Cotton & Meat", deals: "Lake Baringo Produce", delivery: "24h-48h Delivery" },
  { code: "031", name: "Laikipia", region: "Rift Valley", sellers: 580, services: 140, products: 3600, popular: "Beef, Solar & Eco-Crafts", deals: "Nanyuki Artisans Sale", delivery: "24h Courier Delivery (Nanyuki)" },
  { code: "032", name: "Nakuru", region: "Rift Valley", sellers: 1620, services: 410, products: 10800, popular: "Hardware, Vegetables & Motors", deals: "Nakuru City Discounts", delivery: "Same-Day (Nakuru City)" },
  { code: "033", name: "Narok", region: "Rift Valley", sellers: 490, services: 110, products: 3100, popular: "Wheat, Barley & Tourism Crafts", deals: "Maasai Mara Curios", delivery: "24h Courier Delivery" },
  { code: "034", name: "Kajiado", region: "Rift Valley", sellers: 840, services: 195, products: 5400, popular: "Building Stone, Meat & Solar", deals: "Kitengela & Ngong Specials", delivery: "Same-Day (Rongai, Kitengela)" },
  { code: "035", name: "Kericho", region: "Rift Valley", sellers: 680, services: 155, products: 4100, popular: "Premium Tea & Spares", deals: "Direct Tea Auction Packs", delivery: "24h Courier Delivery" },
  { code: "036", name: "Bomet", region: "Rift Valley", sellers: 390, services: 85, products: 2300, popular: "Dairy & Tea", deals: "Dairy Equipment Promos", delivery: "24h Courier Delivery" },
  { code: "037", name: "Kakamega", region: "Western", sellers: 990, services: 250, products: 6100, popular: "Sugarcane, Gold & Hardware", deals: "Western Hub Discounts", delivery: "24h Courier Delivery" },
  { code: "038", name: "Vihiga", region: "Western", sellers: 360, services: 80, products: 2100, popular: "Poultry & Local Vegetables", deals: "Kienyeji Chicken Supplies", delivery: "24h Courier Delivery" },
  { code: "039", name: "Bungoma", region: "Western", sellers: 850, services: 190, products: 5200, popular: "Onions, Sugar & Wholesale", deals: "Webuye Wholesale Deals", delivery: "24h Courier Delivery" },
  { code: "040", name: "Busia", region: "Western", sellers: 640, services: 145, products: 3900, popular: "Cross-Border Trade & Fish", deals: "Border Market Specials", delivery: "24h Courier Delivery" },
  { code: "041", name: "Siaya", region: "Nyanza", sellers: 430, services: 100, products: 2700, popular: "Fish & Traditional Pottery", deals: "Lake Kavirondo Fish", delivery: "24h Courier Delivery" },
  { code: "042", name: "Kisumu", region: "Nyanza", sellers: 1740, services: 460, products: 11500, popular: "Fish, Marine, Tech & Fashion", deals: "Kisumu City Mega Sale", delivery: "Same-Day (Kisumu CBD, Milimani)" },
  { code: "043", name: "Homa Bay", region: "Nyanza", sellers: 510, services: 115, products: 3100, popular: "Tilapia, Cotton & Pineapples", deals: "Fresh Nile Perch Fillets", delivery: "24h Courier Delivery" },
  { code: "044", name: "Migori", region: "Nyanza", sellers: 580, services: 130, products: 3500, popular: "Gold Mining Gear & Sugar", deals: "Isebania Border Deals", delivery: "24h Courier Delivery" },
  { code: "045", name: "Kisii", region: "Nyanza", sellers: 1120, services: 280, products: 7200, popular: "Soapstone Carvings & Bananas", deals: "Kisii Stone Art 15% Off", delivery: "24h Courier Delivery" },
  { code: "046", name: "Nyamira", region: "Nyanza", sellers: 340, services: 75, products: 2050, popular: "Tea, Bananas & Bricks", deals: "Agri-produce Promos", delivery: "24h Courier Delivery" },
  { code: "047", name: "Nairobi", region: "Nairobi", sellers: 4280, services: 1240, products: 28900, popular: "Phones, Laptops, Fashion & Home", deals: "Nairobi CBD Masaku Sale", delivery: "Instant / Same-Day (2 Hours)" },
];

export default function CountiesPage() {
  const [selectedCode, setSelectedCode] = useState("022"); // Kiambu (022) default
  const [search, setSearch] = useState("");

  const activeCounty =
    ALL_47_COUNTIES.find((c) => c.code === selectedCode) || ALL_47_COUNTIES[21];

  const filteredCounties = ALL_47_COUNTIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.includes(search) ||
      c.region.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-brand-off-white dark:bg-brand-dark-bg min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-brand-emerald text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-xs">
            <MapPin className="w-3.5 h-3.5 text-brand-emerald" />
            <span>47 Counties of Kenya</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight">
            Kenya Commerce &amp; Services Directory
          </h1>
          <p className="text-xs sm:text-base text-muted-foreground leading-relaxed">
            Select any county to inspect verified merchants, certified technicians, live product catalogs, and courier delivery availability.
          </p>
        </div>

        {/* County Selector & Filter Bar */}
        <div className="bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-3xl p-4 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs font-bold text-foreground">
              Select a County ({filteredCounties.length} Available):
            </span>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search county name or code..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-muted/40 border border-border text-foreground focus:outline-none focus:border-brand-emerald"
              />
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {filteredCounties.map((county) => (
              <button
                key={county.code}
                onClick={() => setSelectedCode(county.code)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all ${
                  selectedCode === county.code
                    ? "bg-brand-emerald text-white shadow-sm scale-102"
                    : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/60"
                }`}
              >
                <span>{county.name}</span>
                <span className="ml-1 text-[10px] opacity-70">#{county.code}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected County Showcase Card */}
        <div className="bg-gradient-to-br from-white via-brand-off-white to-emerald-50/50 dark:from-brand-dark-card dark:via-brand-dark-bg dark:to-brand-dark-card border-2 border-brand-emerald/40 rounded-3xl p-6 sm:p-10 shadow-xl space-y-8 animate-fadeIn">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-brand-emerald text-white font-mono text-xs font-black rounded-lg">
                  COUNTY {activeCounty.code}
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-foreground uppercase tracking-tight">
                  {activeCounty.name}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Region: <strong className="text-foreground">{activeCounty.region}</strong> • Live Coverage on VendLex
              </p>
            </div>

            <Link
              href={`/marketplace?county=${encodeURIComponent(activeCounty.name)}`}
              className="bg-brand-emerald hover:bg-brand-emerald-dark text-white font-black px-8 py-3.5 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 shrink-0"
            >
              <span>Explore {activeCounty.name} Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 3 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-2xl p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-bold uppercase tracking-wider">Verified Merchants</span>
                <Store className="w-5 h-5 text-brand-emerald" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-foreground">
                {activeCounty.sellers.toLocaleString()} Sellers
              </div>
              <p className="text-[11px] text-muted-foreground">KYC registered &amp; M-Pesa enabled</p>
            </div>

            <div className="bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-2xl p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-bold uppercase tracking-wider">Service Providers</span>
                <Wrench className="w-5 h-5 text-teal-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-foreground">
                {activeCounty.services.toLocaleString()} Providers
              </div>
              <p className="text-[11px] text-muted-foreground">Certified electricians, plumbers &amp; technicians</p>
            </div>

            <div className="bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-2xl p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-bold uppercase tracking-wider">Live Catalog Items</span>
                <Package className="w-5 h-5 text-brand-gold" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-foreground">
                {activeCounty.products.toLocaleString()} Products
              </div>
              <p className="text-[11px] text-muted-foreground">In-stock across verified local stores</p>
            </div>
          </div>

          {/* Local County Commerce Attributes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
            <div className="p-4 rounded-2xl bg-white dark:bg-brand-dark-card border border-border space-y-1">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <TrendingUp className="w-4 h-4 text-brand-emerald" />
                <span>Popular Categories</span>
              </div>
              <p className="text-muted-foreground font-semibold">{activeCounty.popular}</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-brand-dark-card border border-border space-y-1">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <Tag className="w-4 h-4 text-brand-red" />
                <span>Local County Deals</span>
              </div>
              <p className="text-muted-foreground font-semibold">{activeCounty.deals}</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-brand-dark-card border border-border space-y-1">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <Truck className="w-4 h-4 text-blue-500" />
                <span>Delivery Availability</span>
              </div>
              <p className="text-emerald-600 dark:text-emerald-400 font-bold">{activeCounty.delivery}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
