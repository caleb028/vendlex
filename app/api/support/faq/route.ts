import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  badge?: string;
}

const VENDLEX_FAQS: FAQItem[] = [
  {
    id: "faq-1",
    category: "ORDER_ESCROW",
    question: "How does VendLex Lipa na M-Pesa Escrow Protection work?",
    answer: "When you pay for an item via M-Pesa on VendLex, your money does not go directly to the merchant. Instead, funds are deposited into the secure VendLex Escrow vault. The merchant is notified to dispatch your order with live courier tracking. Only after the parcel arrives and you confirm receipt does VendLex release the payout to the merchant.",
    badge: "Buyer Protection",
  },
  {
    id: "faq-2",
    category: "ORDER_ESCROW",
    question: "What happens if an item is defective, damaged, or not as described?",
    answer: "You have 48 hours after delivery to inspect your package. If the item is defective or incorrect, you can lodge a formal dispute in your Dispute Center. The escrow funds remain frozen while VendLex mediation verifies the claim with the courier. You will receive a 100% refund via M-Pesa reversal or a free merchant replacement.",
    badge: "Guaranteed Refund",
  },
  {
    id: "faq-3",
    category: "PAYMENT_MPESA",
    question: "How do I make a payment on VendLex?",
    answer: "VendLex utilizes official Safaricom Daraja Lipa na M-Pesa STK Push. Enter your Safaricom phone number at checkout, tap Pay, and an automatic PIN prompt will pop up on your mobile screen. Enter your M-Pesa PIN and press OK. Confirmation is instant.",
    badge: "Instant STK Push",
  },
  {
    id: "faq-4",
    category: "PAYMENT_MPESA",
    question: "What should I do if my M-Pesa account was debited but the order shows unpaid?",
    answer: "If network latency delays Safaricom webhook confirmation, our Daraja query engine automatically polls the transaction. You can also paste your M-Pesa Receipt code (e.g. QKH89421A) into the order status page or submit a support ticket here for immediate manual reconciliation.",
    badge: "Daraja 2.0",
  },
  {
    id: "faq-5",
    category: "SELLER_STORE",
    question: "How do I open an official verified store on VendLex?",
    answer: "Visit the Seller Onboarding portal (/seller/onboarding), enter your business name, county location, upload your CR12 or national ID for KYC verification, select your growth tier, and activate your store via M-Pesa. You will receive an official timestamped Merchant Accreditation Certificate (PDF) with QR seal verification.",
    badge: "Merchant Hub",
  },
  {
    id: "faq-6",
    category: "DELIVERY_COURIER",
    question: "Which courier partners handle shipping across Kenya's 47 counties?",
    answer: "VendLex partners with licensed nationwide logistics couriers including Fargo Courier, G4S Kenya, and Wells Fargo Courier. Same-day delivery is standard within Nairobi and Kiambu, while countrywide deliveries to Mombasa, Kisumu, Nakuru, Eldoret, and upcountry take 24–48 hours with real-time tracking.",
    badge: "47 Counties",
  },
  {
    id: "faq-7",
    category: "SECURITY_FRAUD",
    question: "How does VendLex verify genuine products and prevent scams?",
    answer: "All merchants undergo mandatory business document KYC verification. Sellers offering high-value electronics and luxury goods must submit supplier invoices or authorization letters. Furthermore, every transaction generates a cryptographic SHA-256 verifiable receipt stamped with the exact transaction timestamp.",
    badge: "Platform Stamp",
  },
  {
    id: "faq-8",
    category: "SERVICES_DIRECTORY",
    question: "How do I book a verified plumber, electrician, or service professional?",
    answer: "Explore our Services directory (/services) to search licensed Kenyan technicians. You can request a free custom quote, view provider reviews, communicate on WhatsApp, and pay for labor and materials securely through escrow.",
    badge: "Certified Pros",
  },
];

export async function GET() {
  return NextResponse.json({
    success: true,
    faqs: VENDLEX_FAQS,
  });
}
