export interface KnowledgeArticle {
  id: string;
  topic: string;
  category: "buyer" | "seller" | "payments" | "delivery" | "disputes" | "general" | "services";
  keywords: string[];
  summary: string;
  details: string;
  referenceUrl: string;
}

export const VENDLEX_KNOWLEDGE_BASE: KnowledgeArticle[] = [
  {
    id: "kb-overview",
    topic: "VendLex Kenya Overview & Tagline",
    category: "general",
    keywords: ["what is vendlex", "about", "tagline", "brand", "mission", "47 counties", "kenya"],
    summary: "VendLex Kenya is Kenya's premier digital commerce & services ecosystem operating under the brand motto SHOP • GROW • PROSPER.",
    details: "VendLex connects verified multi-vendor merchants, local Kenyan businesses, certified professional service providers, and consumers across all 47 counties in Kenya. It combines a consumer marketplace, Kenyan business directory, merchant SaaS tools, escrow delivery protection, and corporate procurement.",
    referenceUrl: "/",
  },
  {
    id: "kb-mpesa-payments",
    topic: "Lipa na M-Pesa & Escrow Payment Protection",
    category: "payments",
    keywords: ["mpesa", "lipa na mpesa", "stk push", "escrow", "payment safe", "till", "paybill", "money"],
    summary: "All transactions on VendLex are powered by direct Safaricom Daraja 2.0 Lipa na M-Pesa STK Push protected by Escrow.",
    details: "When a customer completes checkout, an instant M-Pesa STK prompt is sent to their registered Safaricom mobile line (07XX / 01XX). The payment is immediately held securely in the VendLex Escrow vault (status: PAID_ESCROW). Funds are only released to the seller after the buyer receives and verifies the parcel. No M-Pesa PIN is ever entered or stored on the website.",
    referenceUrl: "/checkout",
  },
  {
    id: "kb-delivery-shipping",
    topic: "Nationwide Courier Delivery Timelines & Fees",
    category: "delivery",
    keywords: ["delivery", "shipping", "timeline", "fargo", "g4s", "boda", "same day", "how long", "cost"],
    summary: "Standard delivery is 2–4 hours within Nairobi (KSh 250) and 24 hours countrywide via Fargo Courier & G4S (KSh 500).",
    details: "Nairobi County orders enjoy same-day delivery via verified motorcycle dispatchers within 2 to 4 hours. Deliveries to all other 46 counties (Mombasa, Kisumu, Nakuru, Eldoret, Thika, etc.) are fulfilled via insured courier partners (Fargo Courier and G4S) within 24 to 48 hours. Live waybill tracking codes (e.g. FARGO-89421) are provided for every parcel.",
    referenceUrl: "/marketplace",
  },
  {
    id: "kb-seller-onboarding",
    topic: "How to Sell on VendLex (Merchant Onboarding)",
    category: "seller",
    keywords: ["how to sell", "seller onboarding", "register store", "open shop", "merchant", "list business", "cost to sell"],
    summary: "Selling on VendLex starts free with a 3-step digital onboarding at /seller/onboarding.",
    details: "Any Kenyan entrepreneur, shop owner, or artisan can create their digital mini-store in under 5 minutes. Steps: 1) Provide Business Name, Category, County, and Town. 2) Enter Lipa na M-Pesa Till/Paybill number for automated payouts. 3) Upload CR12, National ID, or Single Business Permit for KYC verification. Basic listings are free, with optional STARTER (KSh 299/mo) and BUSINESS (KSh 799/mo) upgrades.",
    referenceUrl: "/seller/onboarding",
  },
  {
    id: "kb-returns-refunds",
    topic: "Disputes, Returns & Refund Policy",
    category: "disputes",
    keywords: ["refund", "return", "dispute", "broken", "wrong item", "money back", "cancel order"],
    summary: "Buyers have a 48-hour inspection window upon delivery to file a dispute and freeze escrow funds at /customer/disputes.",
    details: "If a buyer receives an item that is damaged, counterfeit, or differs significantly from the listing, they can open a dispute from /customer/disputes. Filing an issue immediately freezes the seller's escrow payout. If validated, 100% of the funds are refunded directly to the buyer's original M-Pesa mobile number via B2C reversal within 15 minutes.",
    referenceUrl: "/customer/disputes",
  },
  {
    id: "kb-verified-badge",
    topic: "Blue Check Verification & Seller Trust Score",
    category: "seller",
    keywords: ["verified badge", "blue check", "trust score", "kyc", "is it legit", "safe seller"],
    summary: "The blue '✓ Verified' check requires KRA PIN, Business Registration/Permit verification, and a 4.5+ star customer record.",
    details: "To earn the VendLex Verified badge, merchants undergo automated CR12 business verification or submission of a County Single Business Permit. In addition, their on-time delivery rate must exceed 90% and customer dispute rate must stay below 2%. Verified sellers get priority ranking in search results.",
    referenceUrl: "/seller/settings",
  },
  {
    id: "kb-services-booking",
    topic: "Booking Professional Services & Certified Technicians",
    category: "services",
    keywords: ["hire technician", "plumber", "electrician", "solar installation", "mechanic", "quote", "repair"],
    summary: "Book certified Kenyan technicians across 10 trade categories with free competitive quotes at /services.",
    details: "VendLex features verified professionals in Electrical, Plumbing, Solar Systems, Appliance Repair, Mobile Repair, Computer Tech, and Mechanics. Customers can submit a project requirement to compare up to 3 competitive bids or directly contact technicians via verified WhatsApp links.",
    referenceUrl: "/services",
  },
  {
    id: "kb-corporate-b2b",
    topic: "Corporate B2B & Institutional Procurement",
    category: "general",
    keywords: ["b2b", "corporate", "wholesale", "etims", "bulk order", "30 day credit", "ngo", "schools"],
    summary: "Enterprises, NGOs, and institutions can request bulk RFQs with KRA eTIMS compliant VAT invoices at /b2b.",
    details: "VendLex Business provides dedicated corporate accounts with volume discounts, 30-day net payment credit terms for approved corporate buyers, and standardized Kenya Revenue Authority eTIMS electronic tax receipts.",
    referenceUrl: "/b2b",
  },
  {
    id: "kb-loyalty-rewards",
    topic: "VendPoints Rewards & Loyalty Vouchers",
    category: "buyer",
    keywords: ["rewards", "vendpoints", "points", "discount voucher", "loyalty", "free delivery voucher"],
    summary: "Earn 1 VendPoint for every KSh 100 spent, redeemable for discount vouchers and free delivery in /customer/dashboard.",
    details: "VendPoints are automatically credited upon delivery confirmation. 500 VendPoints redeem a KSh 500 store voucher, while 1,000 VendPoints unlock free same-day courier shipping nationwide.",
    referenceUrl: "/customer/dashboard",
  },
];

/**
 * Search the verified knowledge base for relevant platform articles.
 */
export function searchKnowledgeBase(query: string, maxResults = 3): KnowledgeArticle[] {
  const normalizedQuery = query.toLowerCase().trim();
  const queryTokens = normalizedQuery.split(/\s+/).filter((t) => t.length > 2);

  const scoredArticles = VENDLEX_KNOWLEDGE_BASE.map((article) => {
    let score = 0;

    // Check exact keywords
    for (const kw of article.keywords) {
      if (normalizedQuery.includes(kw)) score += 5;
    }

    // Check token overlap in topic, keywords, and summary
    for (const token of queryTokens) {
      if (article.topic.toLowerCase().includes(token)) score += 3;
      if (article.summary.toLowerCase().includes(token)) score += 2;
      if (article.details.toLowerCase().includes(token)) score += 1;
    }

    return { article, score };
  });

  return scoredArticles
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map((item) => item.article);
}
