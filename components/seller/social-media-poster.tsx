"use client";

import React, { useState } from "react";
import { Sparkles, Share2, Copy, Check, Camera, Globe, Video } from "lucide-react";

export function AISocialMediaPoster({
  productTitle = "Handmade Savannah Kitenge Peplum Dress",
  price = 4850,
  storeName = "Savanna Fashion House",
}: {
  productTitle?: string;
  price?: number;
  storeName?: string;
}) {
  const [platform, setPlatform] = useState<"instagram" | "facebook" | "tiktok">("instagram");
  const [copied, setCopied] = useState(false);
  const [caption, setCaption] = useState(
    `✨ Upgrade your wardrobe with our authentic ${productTitle}! Hand-crafted in Kenya with premium Kitenge fabrics.\n\n💰 Price: KSh ${price.toLocaleString()}\n📍 Shop: ${storeName}\n💳 Lipa na M-Pesa Available nationwide!\n\n👇 Click link in bio to order now on VendLex Kenya!\n\n#VendLexKenya #NairobiFashion #KitengeVibes #LipaNaMPesa #KenyanDesigners`
  );

  const handleGenerate = (targetPlatform: "instagram" | "facebook" | "tiktok") => {
    setPlatform(targetPlatform);
    if (targetPlatform === "instagram") {
      setCaption(
        `✨ 🔥 Stunning ${productTitle} from ${storeName}! Available in limited quantities.\n\n💵 KSh ${price.toLocaleString()}\n🚚 Delivery across all 47 counties in Kenya!\n\n📲 Order via Lipa na M-Pesa link in bio!\n\n#VendLexKenya #ShopKenya #NairobiShopping #KitengeFashion #KenyanEntrepreneurs`
      );
    } else if (targetPlatform === "tiktok") {
      setCaption(
        `POV: You found the best ${productTitle} in Nairobi 🇰🇪✨\n\nOnly KSh ${price.toLocaleString()} on VendLex Kenya! Hit the link in bio to order via M-Pesa 🎉\n\n#TikTokKenya #NairobiTikTok #KenyanStyle #VendLex #BuyKenyaBuildKenya`
      );
    } else {
      setCaption(
        `📢 NEW ARRIVAL at ${storeName}!\n\nCheck out our ${productTitle} available for immediate delivery countrywide.\nPrice: KSh ${price.toLocaleString()}\nPayment: Lipa na M-Pesa Escrow Protected\n\nVisit our storefront on VendLex Kenya to place your order today!`
      );
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-3xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-md">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-foreground flex items-center gap-1.5">
              <span>AI Social Media Auto-Poster</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </h3>
            <p className="text-xs text-muted-foreground">Generate high-converting captions &amp; viral Kenyan hashtags for Instagram, TikTok &amp; Facebook.</p>
          </div>
        </div>
      </div>

      {/* Platform Switcher Chips */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleGenerate("instagram")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
            platform === "instagram"
              ? "bg-pink-600 text-white shadow-sm"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Instagram Caption</span>
        </button>

        <button
          onClick={() => handleGenerate("tiktok")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
            platform === "tiktok"
              ? "bg-black dark:bg-white text-white dark:text-black shadow-sm"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          <Video className="w-4 h-4" />
          <span>TikTok Video Script</span>
        </button>

        <button
          onClick={() => handleGenerate("facebook")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
            platform === "facebook"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Facebook Post</span>
        </button>
      </div>

      {/* Caption Preview Area */}
      <div className="relative bg-muted/30 dark:bg-brand-dark-bg/60 border border-border rounded-2xl p-4">
        <textarea
          rows={6}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="w-full bg-transparent text-xs text-foreground resize-none focus:outline-none font-sans leading-relaxed"
        />
        <button
          onClick={handleCopy}
          className="absolute bottom-3 right-3 bg-brand-emerald hover:bg-brand-emerald-dark text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? "Copied to Clipboard!" : "Copy Caption"}</span>
        </button>
      </div>
    </div>
  );
}
