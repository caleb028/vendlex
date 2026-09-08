"use client";

import React, { useState } from "react";
import { Sparkles, Send, Copy, Check, Bot, Zap, ArrowRight } from "lucide-react";
import { generateAIContent } from "@/lib/ai-engine";
import Link from "next/link";

export function AiAssistantPreview() {
  const [prompt, setPrompt] = useState("Create a high-converting Facebook promotion for my Nairobi shoe shop with a 15% payday discount.");
  const [tone, setTone] = useState<"swahili_blend" | "persuasive">("swahili_blend");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [output, setOutput] = useState<string>(
    `🔥 HABARI NAIROBI! PAYDAY MEGA SHOE SALE IS LIVE! 🔥\n\nUnatafuta stylish, durable sneakers and official leather shoes? Savanna Kicks tumekuletea original quality kwa bei nafuu sana.\n\n💥 SPECIAL OFFER: Enjoy 15% OFF this weekend only!\n📍 Location: Nairobi CBD & Westlands\n⚡ Delivery: Same-day delivery across Nairobi (masaa 2 tu!) na 24-hr courier countrywide.\n💳 Payment: Lipa Salama na M-Pesa unapopokea kupitia VendLex!\n\n👇 Bofya link kwenye bio kuagiza sasa:\n👉 vendlex.co.ke/store/savanna-kicks\n\n#KenyaShopping #BiasharaKenya #NairobiDeals #MadeInKenya #VendLex #LipaNaMpesa`
  );

  const samplePrompts = [
    "Create a Facebook promotion for my shoe business",
    "Write an SEO description for Samsung Galaxy S24 Ultra",
    "Draft a polite customer WhatsApp reply about delivery timeline to Mombasa",
    "Give me 4 growth ideas to increase my electronics store sales this month",
  ];

  const handleGenerate = (customText?: string) => {
    const textToUse = customText || prompt;
    if (!textToUse.trim()) return;

    setIsGenerating(true);
    setTimeout(() => {
      let reqType: any = "social_post";
      if (textToUse.toLowerCase().includes("description")) reqType = "product_description";
      else if (textToUse.toLowerCase().includes("reply")) reqType = "customer_reply";
      else if (textToUse.toLowerCase().includes("growth") || textToUse.toLowerCase().includes("ideas")) reqType = "growth_ideas";

      const res = generateAIContent({
        type: reqType,
        businessName: "Savanna Store KE",
        category: "Fashion & Retail",
        inputPrompt: textToUse,
        tone: tone,
      });

      setOutput(res.result);
      setIsGenerating(false);
    }, 600);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-20 bg-gradient-to-b from-brand-off-white to-white dark:from-brand-dark-bg dark:to-brand-dark-card border-t border-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-brand-gold-dark to-brand-gold text-brand-charcoal text-xs font-black uppercase tracking-wider shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>VendLex AI Engine</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
            Your Digital Business Assistant
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Generate high-converting social media marketing, SEO product descriptions, customer WhatsApp replies, and sales strategies in seconds.
          </p>
        </div>

        {/* Interactive Assistant Widget */}
        <div className="max-w-4xl mx-auto bg-white dark:bg-brand-dark-card border border-border dark:border-brand-dark-border rounded-3xl shadow-xl overflow-hidden">
          {/* Top Bar */}
          <div className="p-4 sm:p-5 border-b border-border dark:border-brand-dark-border bg-muted/30 dark:bg-brand-dark-bg/60 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-emerald to-brand-emerald-dark text-white flex items-center justify-center shadow-sm">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">VendLex AI Assistant</h4>
                <p className="text-[11px] text-muted-foreground">Trained on Kenyan commerce & bilingual Swahili/English copy</p>
              </div>
            </div>

            {/* Language & Tone toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTone("swahili_blend")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  tone === "swahili_blend"
                    ? "bg-brand-emerald text-white shadow-sm"
                    : "bg-muted dark:bg-brand-dark-border text-muted-foreground hover:text-foreground"
                }`}
              >
                🇰🇪 Swahili / Sheng Blend
              </button>
              <button
                onClick={() => setTone("persuasive")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  tone === "persuasive"
                    ? "bg-brand-emerald text-white shadow-sm"
                    : "bg-muted dark:bg-brand-dark-border text-muted-foreground hover:text-foreground"
                }`}
              >
                Official English
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Input Box */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider">
                What would you like help with?
              </label>
              <div className="relative">
                <textarea
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. Write a promotion for my clothing boutique in Mombasa..."
                  className="w-full bg-muted/20 dark:bg-brand-dark-bg/60 border border-border dark:border-brand-dark-border rounded-2xl p-4 text-xs sm:text-sm text-foreground focus:outline-none focus:border-brand-emerald focus:ring-2 focus:ring-brand-emerald/20 resize-none"
                />
              </div>

              {/* Sample Prompt Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-semibold text-muted-foreground">Try asking:</span>
                {samplePrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setPrompt(p);
                      handleGenerate(p);
                    }}
                    className="text-[11px] bg-muted/60 hover:bg-muted dark:bg-brand-dark-border dark:hover:bg-brand-dark-border/80 text-muted-foreground hover:text-foreground px-2.5 py-1 rounded-xl transition-colors truncate max-w-xs"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <div className="flex justify-end">
              <button
                onClick={() => handleGenerate()}
                disabled={isGenerating}
                className="bg-brand-emerald hover:bg-brand-emerald-dark disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-md hover:shadow-glow-green transition-all"
              >
                <Zap className="w-4 h-4" />
                <span>{isGenerating ? "Generating Copy..." : "Generate with VendLex AI"}</span>
              </button>
            </div>

            {/* Output Display */}
            <div className="relative bg-muted/30 dark:bg-brand-dark-bg/60 border border-border dark:border-brand-dark-border rounded-2xl p-5 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-brand-emerald flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Generated Output
                </span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground bg-white dark:bg-brand-dark-card border border-border px-3 py-1 rounded-lg transition-colors shadow-sm"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Result</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="font-sans text-xs sm:text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                {output}
              </pre>
            </div>
          </div>

          {/* Bottom Callout */}
          <div className="p-4 bg-brand-emerald-soft/50 dark:bg-brand-dark-bg/80 border-t border-border dark:border-brand-dark-border text-center sm:flex items-center justify-between px-8 text-xs">
            <span className="text-muted-foreground">
              Included in all VendLex Business & Pro seller subscription plans.
            </span>
            <Link
              href="/seller/ai"
              className="text-brand-emerald font-bold hover:underline inline-flex items-center gap-1 mt-2 sm:mt-0"
            >
              <span>Explore AI Merchant Suite</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
