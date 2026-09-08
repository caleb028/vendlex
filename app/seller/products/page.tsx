"use client";

import React, { useState, useEffect } from "react";
import { Product, CATEGORIES } from "@/lib/data/kenya-data";
import { formatKSh } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Eye,
  Filter,
  UploadCloud,
  X,
  Image as ImageIcon,
  Check,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/store/auth-store";

export default function SellerProductsPage() {
  const { user, isAuthenticated } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Add Product Form State
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Phones & Accessories");
  const [newPrice, setNewPrice] = useState("");
  const [newOriginalPrice, setNewOriginalPrice] = useState("");
  const [newStock, setNewStock] = useState("10");
  const [newSku, setNewSku] = useState(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
  const [newDesc, setNewDesc] = useState("");

  // Device File Image Upload State
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const sellerQuery = user?.businessId ? `?sellerId=${encodeURIComponent(user.businessId)}` : "";
      const res = await fetch(`/api/products${sellerQuery}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        // If logged-in seller has products, display them; if empty, display all marketplace products for this merchant
        const merchantProds = data.products.filter(
          (p: Product) =>
            !user?.businessId ||
            p.businessId === user.businessId ||
            p.businessSlug === user.businessSlug ||
            (user.businessName && p.businessName.toLowerCase() === user.businessName.toLowerCase())
        );
        setProducts(merchantProds.length > 0 ? merchantProds : data.products);
      }
    } catch (e) {
      console.warn("Failed to fetch seller products:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [isAuthenticated, user?.businessId]);

  const filtered = products.filter((p) => {
    if (
      searchQuery &&
      !p.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !(p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()))
    ) {
      return false;
    }
    if (selectedCat !== "all" && p.category !== selectedCat) {
      return false;
    }
    return true;
  });

  const handleDeviceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImages((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });

    setTimeout(() => {
      setIsUploading(false);
    }, 400);
  };

  const handleRemoveUploadedImage = (indexToRemove: number) => {
    setUploadedImages(uploadedImages.filter((_, idx) => idx !== indexToRemove));
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const priceNum = parseFloat(newPrice) || 1000;
    const origPriceNum = parseFloat(newOriginalPrice) || Math.round(priceNum * 1.15);
    const defaultFallback = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop";
    const finalImages = uploadedImages.length > 0 ? uploadedImages : [defaultFallback];

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          category: newCategory,
          price: priceNum,
          originalPrice: origPriceNum,
          stockCount: parseInt(newStock) || 10,
          sku: newSku,
          description: newDesc || "Authentic quality product from verified Kenyan merchant.",
          images: finalImages,
          county: "Nairobi",
          town: "CBD",
        }),
      });

      const data = await res.json();
      if (data.success && data.product) {
        setProducts((prev) => [data.product, ...prev]);
        setModalOpen(false);
        setNewTitle("");
        setNewPrice("");
        setNewOriginalPrice("");
        setNewDesc("");
        setUploadedImages([]);
        setNewSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
      } else {
        alert(data.error || "Failed to add product.");
      }
    } catch (err: any) {
      alert("Network error creating product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this product from your storefront?")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert(data.error || "Failed to delete product.");
      }
    } catch (err) {
      alert("Network error deleting product.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground">Product Catalog</h1>
          <p className="text-xs text-muted-foreground">Manage your online inventory, upload product photos from your device, and control pricing.</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="bg-brand-emerald hover:bg-brand-emerald-dark text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, SKU..."
            className="w-full bg-muted/40 dark:bg-brand-dark-bg/60 border border-border dark:border-brand-dark-border rounded-xl pl-9 pr-3 py-2 text-xs text-foreground focus:outline-none focus:border-brand-emerald"
          />
        </div>

        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="bg-muted/40 dark:bg-brand-dark-bg/60 border border-border dark:border-brand-dark-border rounded-xl px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:border-brand-emerald"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-muted-foreground flex justify-center items-center gap-2 bg-white dark:bg-brand-dark-card border border-border rounded-3xl p-8">
          <Loader2 className="w-4 h-4 animate-spin text-brand-emerald" />
          <span>Loading merchant catalog...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-xs text-muted-foreground bg-white dark:bg-brand-dark-card border border-border rounded-3xl p-8 space-y-2">
          <Package className="w-8 h-8 mx-auto text-muted-foreground opacity-50" />
          <p className="font-bold">No products found in this category.</p>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-brand-emerald text-white text-xs font-bold px-4 py-2 rounded-xl mt-2 inline-block"
          >
            Add Your First Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-3xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2.5">
                {/* Image */}
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted/40">
                  <img
                    src={product.images[0] || "/placeholder.png"}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        product.inStock && product.stockCount > 0
                          ? "bg-emerald-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {product.inStock && product.stockCount > 0 ? `${product.stockCount} in stock` : "Out of Stock"}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div>
                  <div className="text-[11px] text-brand-emerald font-bold">{product.category}</div>
                  <h3 className="text-xs font-black text-foreground line-clamp-2 leading-snug">
                    {product.title}
                  </h3>
                  {product.sku && <div className="text-[10px] font-mono text-muted-foreground mt-0.5">SKU: {product.sku}</div>}
                </div>

                {/* Price */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-foreground">{formatKSh(product.price)}</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-[11px] text-muted-foreground line-through">
                      {formatKSh(product.originalPrice)}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                <Link
                  href={`/marketplace/${product.slug || product.id}`}
                  target="_blank"
                  className="p-2 rounded-xl bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  title="View on Live Storefront"
                >
                  <Eye className="w-3.5 h-3.5" />
                </Link>

                <button
                  onClick={() => handleDelete(product.id)}
                  disabled={deletingId === product.id}
                  className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/40 dark:hover:bg-red-900/60 transition-colors"
                  title="Delete Product"
                >
                  {deletingId === product.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Product Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add New Product to Store">
        <form onSubmit={handleAddProduct} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-foreground">Product Title</label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Samsung Galaxy S24 Ultra (512GB)"
              className="w-full p-2.5 rounded-xl border border-border bg-muted/40 text-foreground text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-foreground">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-border bg-muted/40 text-foreground text-xs font-semibold"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-foreground">SKU / Code</label>
              <input
                type="text"
                required
                value={newSku}
                onChange={(e) => setNewSku(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-border bg-muted/40 font-mono text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-foreground">Selling Price (KSh)</label>
              <input
                type="number"
                required
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="4500"
                className="w-full p-2.5 rounded-xl border border-border bg-muted/40 text-xs font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-foreground">Original Price (KSh)</label>
              <input
                type="number"
                value={newOriginalPrice}
                onChange={(e) => setNewOriginalPrice(e.target.value)}
                placeholder="5500"
                className="w-full p-2.5 rounded-xl border border-border bg-muted/40 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-foreground">Initial Stock</label>
              <input
                type="number"
                required
                value={newStock}
                onChange={(e) => setNewStock(e.target.value)}
                placeholder="10"
                className="w-full p-2.5 rounded-xl border border-border bg-muted/40 text-xs font-bold"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-foreground">Description</label>
            <textarea
              rows={3}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Describe the product specs, condition, and warranty..."
              className="w-full p-2.5 rounded-xl border border-border bg-muted/40 text-xs text-foreground"
            />
          </div>

          {/* Image Uploader */}
          <div className="space-y-1.5">
            <label className="font-bold text-foreground flex items-center justify-between">
              <span>Product Photos</span>
              <span className="text-[10px] text-muted-foreground font-normal">From local device</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {uploadedImages.map((img, i) => (
                <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-border">
                  <img src={img} alt="Upload" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveUploadedImage(i)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <label className="w-16 h-16 rounded-xl border-2 border-dashed border-border hover:border-brand-emerald flex flex-col items-center justify-center cursor-pointer text-muted-foreground hover:text-brand-emerald transition-colors">
                <UploadCloud className="w-5 h-5" />
                <span className="text-[9px] font-bold mt-0.5">Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleDeviceImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-muted text-muted-foreground font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !newTitle || !newPrice}
              className="px-5 py-2 rounded-xl bg-brand-emerald hover:bg-brand-emerald-dark disabled:opacity-60 text-white font-bold flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <span>Publish to Storefront</span>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
