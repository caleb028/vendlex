"use client";

import React, { useState } from "react";
import {
  Bot,
  Sparkles,
  Send,
  Copy,
  Check,
  Zap,
  Tag,
  DollarSign,
  AlertTriangle,
  Share2,
  Languages,
  TrendingUp,
} from "lucide-react";

type AICapability =
  | "product_desc"
  | "pricing"
  | "inventory_shortage"
  | "social_posts"
  | "translate"
  | "growth_advice";

export default function SellerAIPage() {
  const [activeCap, setActiveCap] = useState<AICapability>("product_desc");
  const [prompt, setPrompt] = useState("Original 24,000mAh Power Bank with 65W fast charging for laptops and phones");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [output, setOutput] = useState<string>(
    `⚡ High-Capacity 24,000mAh Laptop Power Bank (65W Fast Charge)\n\nNever get caught off-guard during power rationing or field assignments! Engineered for Kenyan professionals, students, and travelers, this heavy-duty portable power station powers your MacBook, Dell XPS, or smartphone at full speed.\n\n• Output: 65W Power Delivery (USB-C + USB-A Dual Ports)\n• Capacity: Charges an iPhone up to 5 times or a laptop up to 1.5 times\n• Flight Approved: Safe for domestic and international travel\n• Warranty: 12-Month Official VendLex Warranty\n\nDelivery across all 47 Kenyan counties via G4S & Fargo. Pay on delivery via Lipa na M-Pesa.`
  );

  const capabilities = [
    {
      id: "product_desc" as const,
      title: "Product Descriptions",
      icon: Tag,
      desc: "SEO-optimized e-commerce copy with Kenyan context",
      defaultPrompt: "Original 24,000mAh Power Bank with 65W fast charging for laptops and phones",
      defaultOutput: (p: string) => `⚡ ${p} (VendLex Verified)\n\nDesigned for heavy daily commercial use across Kenya. Compatible with all major brands with built-in surge protection.\n\n• High efficiency rating\n• Same-day delivery in Nairobi County\n• Full 1-Year Local Warranty\n• Lipa na M-Pesa verified checkout`,
    },
    {
      id: "pricing" as const,
      title: "Suggest Pricing",
      icon: DollarSign,
      desc: "Competitive Nairobi & county market price analysis",
      defaultPrompt: "Sony WH-1000XM5 ANC Headphones imported from Dubai",
      defaultOutput: (p: string) => `📊 Pricing Recommendation for: "${p}"\n\n• Average Kenyan Market Retail: KSh 45,000 - KSh 49,500\n• VendLex Recommended Price: KSh 43,999 (High conversion sweet spot)\n• Wholesale / Landed Cost Est.: KSh 36,000\n• Gross Profit Margin: 18.2% (~KSh 7,999 profit per unit)\n• Promotional Strategy: Offer free same-day courier in Nairobi to beat brick-and-mortar CBD stores.`,
    },
    {
      id: "inventory_shortage" as const,
      title: "Predict Shortages",
      icon: AlertTriangle,
      desc: "Forecast demand surges and restocking dates",
      defaultPrompt: "Smartphones & power accessories ahead of end-of-month salary dates",
      defaultOutput: (p: string) => `⚠️ Demand Surge & Shortage Forecast:\n\n1. Category: ${p}\n2. Forecast Window: 25th to 5th of next month\n3. Anticipated Demand Spike: +44% based on historical Nairobi tech sales\n4. Risk: 7 SKUs in your inventory are below 10 units.\n5. Recommended Action: Restock at least 25 additional units of high-rotation items by Wednesday to avoid out-of-stock bounce rates.`,
    },
    {
      id: "social_posts" as const,
      title: "Social Media Posts",
      icon: Share2,
      desc: "Instagram, TikTok & WhatsApp broadcast copy",
      defaultPrompt: "Flash deal on air fryers and kitchen blenders for Nairobi families",
      defaultOutput: (p: string) => `🔥 END-MONTH KITCHEN SALE NA VENDLEX! 🔥\n\nPika chakula bila mafuta mengi! Jipatie NutriCook 8.5L Dual Air Fryer leo kwa KSh 16,499 pekee (Was KSh 19,999)!\n\n📍 Visit our Store: Nairobi Tech Hub, CBD\n🚚 Same-day delivery across Nairobi County\n💳 Lipa na M-Pesa ukipokea bidhaa yako!\n\n👉 Bonyeza link hapa kuagiza sasa:\nvendlex.co.ke/store/nairobi-tech-hub\n\n#VendLexKenya #NairobiDeals #KitchenwareKenya #LipaNaMpesa #ShopGrowProsper`,
    },
    {
      id: "translate" as const,
      title: "English ⟷ Swahili",
      icon: Languages,
      desc: "Translate product listings and customer chats",
      defaultPrompt: "We offer 1-year warranty on all solar inverters and provide free technical installation across Kiambu County.",
      defaultOutput: (p: string) => `🇰🇪 Swahili Translation:\n\n"Tunatoa udhamini wa mwaka mmoja (1 year warranty) kwa solar inverters zote, pamoja na huduma ya bure ya ufungaji wa kiufundi kote katika Kaunti ya Kiambu. Wasiliana nasi leo kupitia WhatsApp kupata nukuu ya bei."\n\n• Tone: Biashara rasmi & wazi kwa mteja wa kawaida.`,
    },
    {
      id: "growth_advice" as const,
      title: "Business Growth",
      icon: TrendingUp,
      desc: "Actionable strategic advice to double digital sales",
      defaultPrompt: "How to expand my hardware and plumbing store from Nakuru to western counties like Kisumu and Kakamega",
      defaultOutput: (p: string) => `🚀 VendLex Growth Strategy for Inter-County Expansion:\n\n1. Courier Partnerships: Partner with Speedaf and Fargo Express for 24-hr linehaul between Nakuru and Kisumu/Kakamega (standard freight KSh 350-500).\n2. Bundle Offers: Create 'Contractor Starter Packs' (Pipes + Valves + Fittings) that qualify for bulk delivery discounts.\n3. Verified Technician Network: Recruit 5 verified plumbers on VendLex Prosper in Kisumu; offer them 5% referral commissions on materials purchased from your store.\n4. M-Pesa Till Visibility: Activate automated eTIMS receipts on VendLex to attract corporate and school contractors.`,
    },
  ];

  const handleSelectCap = (cap: (typeof capabilities)[0]) => {
    setActiveCap(cap.id);
    setPrompt(cap.defaultPrompt);
    setOutput(cap.defaultOutput(cap.defaultPrompt));
  };

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setTimeout(() => {
      const activeObj = capabilities.find((c) => c.id === activeCap);
      if (activeObj) {
        setOutput(activeObj.defaultOutput(prompt));
      }
      setIsGenerating(false);
    }, 700);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header per Guideline #25 */}
      <div className="bg-gradient-to-r from-brand-charcoal via-gray-900 to-brand-emerald-dark rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-brand-emerald/30 space-y-2">
        <div className="inline-flex items-center gap-2 bg-emerald-950/90 border border-emerald-400/60 text-amber-300 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>VendLex AI Copilot</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black">
          Merchant Intelligence &amp; Business Copilot
        </h1>
        <p className="text-xs sm:text-sm text-gray-300 max-w-2xl">
          Empowering Kenyan merchants with AI-powered listing optimization, pricing intelligence, shortage forecasting, bilingual translation, and growth strategies.
        </p>
      </div>

      {/* 6 Quick Action Capabilities per Guideline #25 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {capabilities.map((cap) => {
          const Icon = cap.icon;
          const isSelected = activeCap === cap.id;
          return (
            <button
              key={cap.id}
              onClick={() => handleSelectCap(cap)}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                isSelected
                  ? "border-brand-emerald bg-brand-emerald-soft/50 dark:bg-brand-dark-card shadow-sm"
                  : "border-border bg-white dark:bg-brand-dark-card hover:border-brand-emerald/40"
              }`}
            >
              <div className="space-y-2">
                <div
                  className={`p-2 rounded-xl w-fit ${
                    isSelected ? "bg-brand-emerald text-white" : "bg-muted text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-xs text-foreground leading-snug">{cap.title}</h4>
              </div>
              <span className="text-[10px] text-muted-foreground mt-2 block line-clamp-2">
                {cap.desc}
              </span>
            </button>
          );
        })}
      </div>

      {/* Interactive Prompt & Output Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Interactive Prompt Box */}
        <div className="bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Input Prompt &amp; Context:
            </span>
            <span className="text-[10px] text-brand-emerald font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
              Kenya Context Active
            </span>
          </div>

          <textarea
            rows={6}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type your product details, store question, or marketing theme..."
            className="w-full p-4 rounded-2xl border border-border bg-muted/30 text-xs sm:text-sm text-foreground focus:outline-none focus:border-brand-emerald leading-relaxed"
          />

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full bg-brand-emerald hover:bg-brand-emerald-dark text-white font-black py-3.5 px-4 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 btn-glow-emerald disabled:opacity-50"
          >
            {isGenerating ? (
              <span>Generating Intelligence...</span>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Run VendLex AI Copilot</span>
              </>
            )}
          </button>
        </div>

        {/* Right: AI Output Display */}
        <div className="bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-brand-emerald" />
                <span className="text-xs font-bold text-foreground">AI Intelligence Output</span>
              </div>

              <button
                onClick={handleCopy}
                className="text-xs font-bold text-brand-emerald hover:underline flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied ✓" : "Copy Output"}</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-muted/30 text-xs sm:text-sm font-sans leading-relaxed text-foreground whitespace-pre-line border border-border/60">
              {output}
            </div>
          </div>

          <div className="pt-2 text-[11px] text-muted-foreground flex items-center justify-between">
            <span>Tuned for Kenyan retail, WhatsApp marketing &amp; 47-county courier logistics.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
