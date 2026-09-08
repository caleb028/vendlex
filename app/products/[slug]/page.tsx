"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { MOCK_PRODUCTS, MOCK_BUSINESSES, KENYAN_COUNTIES } from "@/lib/data/kenya-data";
import { formatKSh } from "@/lib/utils";
import { useCart } from "@/lib/store/cart-store";
import { useWishlist } from "@/lib/store/wishlist-store";
import { VerifiedBadge } from "@/components/ui/badge";
import { ProductCard } from "@/components/marketplace/product-card";
import { Modal } from "@/components/ui/modal";
import {
  Star,
  ShoppingBag,
  Heart,
  Truck,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  Plus,
  Minus,
  MessageCircle,
  Phone,
  Store,
  Share2,
  Flag,
  RotateCcw,
  Zap,
} from "lucide-react";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();

  const product = MOCK_PRODUCTS.find((p) => p.slug === resolvedParams.slug);

  const [selectedImg, setSelectedImg] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [deliveryCounty, setDeliveryCounty] = useState(product?.county || "Nairobi");

  const { addToCart, setIsCartOpen } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Product Not Found</h1>
        <p className="text-sm text-muted-foreground">The product you are looking for does not exist or has been removed.</p>
        <Link href="/marketplace" className="inline-block bg-brand-emerald text-white px-5 py-2.5 rounded-xl font-bold text-xs">
          Back to Marketplace
        </Link>
      </div>
    );
  }

  const seller = MOCK_BUSINESSES.find((b) => b.id === product.businessId) || {
    name: product.businessName,
    slug: product.businessSlug,
    phone: "+254 712 345 678",
    whatsapp: "+254 712 345 678",
    rating: 4.9,
    reviewCount: 120,
    physicalLocation: "Nairobi CBD",
  };

  const inWishlist = isInWishlist(product.id);
  const related = MOCK_PRODUCTS.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    router.push("/checkout");
  };

  return (
    <div className="bg-brand-off-white dark:bg-brand-dark-bg min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link href="/marketplace" className="hover:text-foreground">Marketplace</Link>
          <span>/</span>
          <span className="text-brand-emerald font-semibold truncate max-w-xs">{product.title}</span>
        </div>

        {/* Main Product Display Card */}
        <div className="bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-3xl p-6 sm:p-8 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Gallery Column (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-muted border border-border">
              <img
                src={product.images[selectedImg] || product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              {product.discountPercentage && (
                <span className="absolute top-4 left-4 bg-brand-red text-white text-xs font-black px-3 py-1 rounded-xl shadow-md">
                  -{product.discountPercentage}% OFF
                </span>
              )}
            </div>

            {/* Thumbnail selector */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImg(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      selectedImg === idx
                        ? "border-brand-emerald shadow-sm scale-105"
                        : "border-border opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-center text-[11px] text-muted-foreground">
              <div className="p-2.5 rounded-xl bg-muted/40 dark:bg-brand-dark-bg/60 border border-border">
                <ShieldCheck className="w-4 h-4 text-brand-emerald mx-auto mb-1" />
                <span className="font-semibold block text-foreground">Escrow Safe</span>
                <span>Protected M-Pesa</span>
              </div>
              <div className="p-2.5 rounded-xl bg-muted/40 dark:bg-brand-dark-bg/60 border border-border">
                <Truck className="w-4 h-4 text-brand-emerald mx-auto mb-1" />
                <span className="font-semibold block text-foreground">Fast Dispatch</span>
                <span>Same-Day Nairobi</span>
              </div>
              <div className="p-2.5 rounded-xl bg-muted/40 dark:bg-brand-dark-bg/60 border border-border">
                <RotateCcw className="w-4 h-4 text-brand-emerald mx-auto mb-1" />
                <span className="font-semibold block text-foreground">Easy Returns</span>
                <span>48h Return Policy</span>
              </div>
            </div>
          </div>

          {/* Details & Actions Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Category & Location */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-bold text-brand-emerald uppercase tracking-wider">
                  {product.category}
                </span>
                <div className="flex items-center gap-1.5 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-brand-red" />
                  <span>{product.town}, {product.county}</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-foreground tracking-tight leading-tight">
                {product.title}
              </h1>

              {/* SKU & Ratings */}
              <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                <span className="text-muted-foreground font-mono">SKU: {product.sku}</span>
                <div className="flex items-center gap-1.5 text-amber-500 font-bold">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{product.rating}</span>
                  <span className="text-muted-foreground font-normal">
                    ({product.reviewCount} customer reviews)
                  </span>
                </div>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{product.inStock ? `In Stock (${product.stockCount} left)` : "Out of Stock"}</span>
                </span>
              </div>

              {/* Price Display */}
              <div className="p-4 rounded-2xl bg-brand-emerald-soft/40 dark:bg-brand-dark-bg/60 border border-brand-emerald/20 flex flex-wrap items-baseline gap-4">
                <span className="text-3xl sm:text-4xl font-black text-brand-emerald">
                  {formatKSh(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-base text-muted-foreground line-through">
                    {formatKSh(product.originalPrice)}
                  </span>
                )}
                {product.discountPercentage && (
                  <span className="text-xs font-bold text-brand-red bg-red-100 dark:bg-red-950/60 px-2 py-0.5 rounded-full">
                    Save {formatKSh(product.originalPrice! - product.price)}
                  </span>
                )}
              </div>

              {/* Delivery Note */}
              <div className="p-3 bg-muted/40 dark:bg-brand-dark-bg/40 rounded-xl flex items-center gap-2.5 text-xs text-muted-foreground">
                <Truck className="w-4 h-4 text-brand-emerald shrink-0" />
                <span>{product.deliveryInfo}</span>
              </div>

              {/* Seller Card */}
              <div className="p-4 rounded-2xl border border-border dark:border-brand-dark-border bg-muted/20 dark:bg-brand-dark-bg/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-brand-emerald-soft dark:bg-brand-dark-border flex items-center justify-center text-brand-emerald shrink-0">
                    <Store className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/businesses/${product.businessSlug}`}
                        className="font-bold text-sm text-foreground hover:text-brand-emerald transition-colors"
                      >
                        {product.businessName}
                      </Link>
                      {product.businessVerified && <VerifiedBadge />}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Verified Kenyan Store • {product.county}
                    </p>
                  </div>
                </div>

                {/* Direct Contact Links */}
                <div className="flex items-center gap-2">
                  <a
                    href={`https://wa.me/${seller.whatsapp.replace(/\D/g, "")}?text=Hello,%20I%20am%20interested%20in%20${encodeURIComponent(product.title)}%20on%20VendLex`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                    title="Chat with Seller on WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href={`tel:${seller.phone}`}
                    className="p-2 rounded-xl bg-brand-emerald hover:bg-brand-emerald-dark text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                    title="Call Seller"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call</span>
                  </a>
                  <Link
                    href={`/businesses/${product.businessSlug}`}
                    className="p-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <span>Store</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Is this product available in your county? Per Guideline #7 */}
            <div className="p-4 rounded-2xl bg-brand-off-white dark:bg-brand-dark-bg/60 border border-border dark:border-brand-dark-border space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-emerald" />
                  <span>Is this product available in your county?</span>
                </span>
                <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                  ✓ Available Countrywide
                </span>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={deliveryCounty}
                  onChange={(e) => setDeliveryCounty(e.target.value)}
                  className="flex-1 bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-xl px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:border-brand-emerald"
                >
                  {KENYAN_COUNTIES.map((c) => (
                    <option key={c} value={c}>
                      {c} County
                    </option>
                  ))}
                </select>
                <div className="text-xs text-muted-foreground font-medium shrink-0 px-2">
                  {deliveryCounty.toLowerCase() === product.county.toLowerCase()
                    ? "🚀 Same-Day Dispatch"
                    : "📦 24h-48h Courier Delivery"}
                </div>
              </div>
            </div>

            {/* Purchase CTA Buttons per Guideline #7 */}
            <div className="space-y-4 pt-2 border-t border-border dark:border-brand-dark-border">
              {/* Quantity selector */}
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-foreground">Quantity:</span>
                <div className="flex items-center border border-border dark:border-brand-dark-border rounded-xl bg-muted/40 overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-muted text-muted-foreground hover:text-foreground"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-4 text-xs font-bold text-foreground">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 hover:bg-muted text-muted-foreground hover:text-foreground"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Action buttons per Guideline #7: BUY NOW, ADD TO CART, CHAT SELLER */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  onClick={handleBuyNow}
                  className="w-full bg-brand-emerald hover:bg-brand-emerald-dark text-white font-black py-3.5 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-glow-green transition-all"
                >
                  <Zap className="w-4 h-4" />
                  <span>BUY NOW</span>
                </button>

                <button
                  onClick={handleAddToCart}
                  className="w-full bg-brand-emerald-soft dark:bg-brand-dark-border hover:bg-brand-emerald/20 text-brand-emerald dark:text-brand-emerald-light font-bold py-3.5 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 border border-brand-emerald/30 transition-all"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{addedToast ? "ADDED ✓" : "ADD TO CART"}</span>
                </button>

                <a
                  href={`https://wa.me/${seller.whatsapp.replace(/\D/g, "")}?text=Hello,%20I%20am%20interested%20in%20${encodeURIComponent(product.title)}%20on%20VendLex`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>CHAT SELLER</span>
                </a>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                <button
                  onClick={() => toggleWishlist(product)}
                  className="flex items-center gap-1.5 hover:text-brand-red transition-colors"
                >
                  <Heart className={`w-4 h-4 ${inWishlist ? "fill-brand-red text-brand-red" : ""}`} />
                  <span>{inWishlist ? "Saved in Wishlist" : "Add to Wishlist"}</span>
                </button>

                <button
                  onClick={() => setReportModalOpen(true)}
                  className="flex items-center gap-1 hover:text-brand-red transition-colors"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Report Listing</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description & Specifications Tabs */}
        <div className="mt-10 bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3">
              Product Description & Overview
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {/* Specifications Table */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-foreground mb-4">
                Specifications & Features
              </h3>
              <div className="border border-border dark:border-brand-dark-border rounded-2xl overflow-hidden divide-y divide-border/60">
                {Object.entries(product.specifications).map(([key, val], idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-1 sm:grid-cols-3 p-3 text-xs bg-muted/10 dark:bg-brand-dark-bg/20"
                  >
                    <span className="font-bold text-foreground">{key}</span>
                    <span className="sm:col-span-2 text-muted-foreground">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Related Products Grid */}
        {related.length > 0 && (
          <div className="mt-12 space-y-6">
            <h3 className="text-xl font-extrabold text-foreground">
              Related Products in {product.category}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Report Modal */}
      <Modal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        title="Report this Listing to VendLex Moderation"
      >
        {reportSuccess ? (
          <div className="text-center py-6 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-brand-emerald mx-auto" />
            <h4 className="text-base font-bold text-foreground">Report Received</h4>
            <p className="text-xs text-muted-foreground">
              Thank you for keeping VendLex safe. Our Kenyan moderation team will review this item within 24 hours.
            </p>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setReportSuccess(true);
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Reason for Report</label>
              <select className="w-full bg-muted border rounded-xl p-2.5 text-xs text-foreground">
                <option>Counterfeit or Fake Product</option>
                <option>Misleading Price or Description</option>
                <option>Unresponsive or Suspicious Seller</option>
                <option>Inappropriate Content</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Additional Details</label>
              <textarea
                rows={3}
                placeholder="Explain the issue..."
                className="w-full bg-muted border rounded-xl p-2.5 text-xs text-foreground resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-brand-red text-white font-bold py-2.5 rounded-xl text-xs"
            >
              Submit Report to Admin
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
}
