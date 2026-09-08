export interface AIRequest {
  type: "product_description" | "social_post" | "customer_reply" | "growth_ideas" | "seo_tags";
  businessName?: string;
  category?: string;
  inputPrompt: string;
  tone?: "professional" | "enthusiastic" | "persuasive" | "swahili_blend";
}

export interface AIResponse {
  result: string;
  tokenCount: number;
  suggestions: string[];
}

export function generateAIContent(request: AIRequest): AIResponse {
  const { type, businessName = "Your Business", category = "Retail", inputPrompt, tone = "persuasive" } = request;

  let result = "";
  const suggestions: string[] = [];

  switch (type) {
    case "product_description":
      result = `🌟 **Premium ${inputPrompt} - Exclusive Quality**

Elevate your experience with the authentic **${inputPrompt}**, sourced directly by **${businessName}**. Designed for durability, performance, and modern Kenyan style.

✨ **Key Highlights:**
• 100% Genuine & Quality Inspected
• Optimized for long-lasting daily use
• Backed by verified ${businessName} warranty and after-sales support
• Fast same-day delivery across Nairobi & 24-hour courier countrywide

📦 **What's in the Box:**
1x ${inputPrompt}, official warranty card, user guide, and care instructions.

💡 *Order today on VendLex with secure M-Pesa STK push checkout!*`;
      suggestions.push("Add bullet points for exact dimensions or technical specs", "Include a limited-time 10% discount call to action");
      break;

    case "social_post":
      if (tone === "swahili_blend") {
        result = `🔥 HABARI NAIROBI & KENYA NZIMA! 🔥

Unatafuta ${inputPrompt}? Hatuna jokes! ${businessName} tumekuletea original quality kwa bei nafuu sana. 

📍 Location: Tuko tayari kukutumia popote ulipo Kenya (Nairobi, Mombasa, Kisumu, Nakuru, Eldoret)!
💳 Malipo: Lipa Salama na M-Pesa ukipokea au kupitia VendLex.
⚡ Delivery: Ndani ya masaa 2 kwa Nairobi!

👇 Bofya link kwenye bio kuagiza sasa au WhatsApp us direct!
WhatsApp: 0712 345 678 📲

#KenyaShopping #BiasharaKenya #NairobiDeals #MadeInKenya #VendLex #KenyanEntrepreneurs #LipaNaMpesa`;
      } else {
        result = `✨ UPGRADE YOUR LIFESTYLE TODAY WITH ${businessName.toUpperCase()}! ✨

Looking for premium **${inputPrompt}**? We've got you covered with certified quality and unbeatable value.

✅ 100% Genuine & Verified
🚚 Same-day doorstep delivery in Nairobi | 24-hr countrywide
💳 Safe & Instant M-Pesa STK Push Checkout on VendLex

🔥 **Special Promo:** Use code **KARIBU10** at checkout for 10% OFF your first order!

Tap the link to shop directly on our VendLex verified storefront:
👉 vendlex.vercel.app/store/${businessName.toLowerCase().replace(/\s+/g, "-")}

#NairobiCommerce #KenyaTech #OnlineShoppingKenya #VendLex #KenyanBrands #BusinessGrowth`;
      }
      suggestions.push("Attach high-resolution photos with price tag overlay", "Post between 11:30 AM - 1:30 PM or 7:00 PM for maximum Kenyan engagement");
      break;

    case "customer_reply":
      result = `Hello! Thank you for reaching out to **${businessName}** regarding "${inputPrompt}". 

We appreciate your interest! Yes, this item is currently in stock and ready for immediate dispatch. 

🚚 **Delivery Details:**
• Nairobi & environs: Delivered within 2-4 hours (KSh 250 flat fee)
• Upcountry (Mombasa, Kisumu, Nakuru, Eldoret, etc.): Delivered within 24 hours via Fargo Courier (KSh 500)

💳 **Payment:**
You can place your order securely through our verified VendLex storefront using instant M-Pesa STK Push.

Would you like me to reserve one for you or assist you with placing your order right away? Let us know your preferred delivery location! 😊`;
      suggestions.push("Send direct product link for instant one-click M-Pesa checkout", "Offer a bundle discount if they buy 2 or more");
      break;

    case "growth_ideas":
      result = `🚀 **Strategic Growth Recommendations for ${businessName} (${category}):**

1. **End-of-Month 'Payday Flash Sale' (25th - 3rd):**
   Run a 48-hour 15% flash discount on your top 3 bestsellers. Send a WhatsApp broadcast to previous buyers with an exclusive VIP coupon code.

2. **Bundle Complementary Products:**
   Package high-margin accessories with your main items (e.g. Free screen protector with phones, or discounted styling cream with dresses) to increase your Average Order Value (AOV) by 35%.

3. **Leverage Customer Photo Reviews on VendLex:**
   Offer buyers a KSh 200 coupon on their next purchase in exchange for uploading a photo review on your VendLex storefront. Social proof increases conversion by 4.2x.

4. **Expand Upcountry Distribution:**
   Highlight '24-hour Countrywide Delivery' in your bio. 42% of online Kenyan purchases originate from growing economic hubs like Eldoret, Nakuru, Thika, and Kisumu.`;
      suggestions.push("Run a weekly featured deal on VendLex homepage", "Activate automated invoice receipts for corporate clients");
      break;

    case "seo_tags":
      result = `🏷️ **Optimized VendLex & Google Search Keywords:**

• ${inputPrompt} Kenya
• Buy ${inputPrompt} in Nairobi
• ${businessName} best price Kenya
• Best ${category} shops in Nairobi CBD
• Cheap ${inputPrompt} delivery Kenya
• Genuine ${inputPrompt} M-Pesa payment
• Online marketplace Kenya ${category}
• VendLex ${businessName.toLowerCase()}`;
      suggestions.push("Include these tags in your product listing specifications", "Use in Instagram hashtags and product meta titles");
      break;
  }

  return {
    result,
    tokenCount: Math.round(result.length / 4),
    suggestions,
  };
}
