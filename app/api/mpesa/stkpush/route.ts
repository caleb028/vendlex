import { NextRequest, NextResponse } from "next/server";
import { initiateSTKPush, formatPhoneForDaraja, DEFAULT_DARAJA_CONFIG } from "@/lib/mpesa/daraja";
import { mpesaTransactionsStore } from "@/lib/mpesa/transaction-store";
import {
  isValidKenyanPhone,
  sanitizeInput,
  validateTransactionAmount,
  checkRateLimit,
} from "@/lib/security";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      phoneNumber,
      amount,
      accountReference = "VENDLEX",
      transactionDesc = "Payment",
      purpose = "ORDER",
      sellerId,
      sellerName = "Merchant",
    } = body;

    // 1. Strict Phone Validation
    if (!phoneNumber || !isValidKenyanPhone(phoneNumber)) {
      return NextResponse.json(
        { error: "Invalid Kenyan phone number. Use format 07XXXXXXXX or 2547XXXXXXXX." },
        { status: 400 }
      );
    }

    // 2. Strict Amount Validation
    const amountValidation = validateTransactionAmount(amount, 1, 300000);
    if (!amountValidation.valid || !amountValidation.amount) {
      return NextResponse.json(
        { error: amountValidation.error || "Invalid transaction amount." },
        { status: 400 }
      );
    }

    const numAmount = amountValidation.amount;
    const formattedPhone = formatPhoneForDaraja(phoneNumber);

    // 3. Per-Phone Rate Limiting (Prevent SMS STK Push spam & toll fraud)
    const phoneRateKey = `stk_phone:${formattedPhone}`;
    const { allowed: phoneAllowed } = checkRateLimit(phoneRateKey, 5, 2 * 60 * 1000);
    if (!phoneAllowed) {
      return NextResponse.json(
        { error: "Too many payment prompts sent to this phone number. Please wait 2 minutes." },
        { status: 429 }
      );
    }

    // 4. Sanitize Metadata
    const safeAccountRef = sanitizeInput(accountReference, 30) || "VENDLEX";
    const safeTxnDesc = sanitizeInput(transactionDesc, 50) || "Marketplace Purchase";
    const safeSellerName = sanitizeInput(sellerName, 60) || "Merchant";
    const safeSellerId = sellerId ? sanitizeInput(sellerId, 40) : undefined;

    // 5. Call Daraja API
    const darajaResponse = await initiateSTKPush({
      phoneNumber: formattedPhone,
      amount: numAmount,
      accountReference: safeAccountRef,
      transactionDesc: safeTxnDesc,
    });

    // 6. Record initial transaction in pending state
    const txnRecord = {
      id: `txn-${Date.now()}`,
      checkoutRequestId: darajaResponse.CheckoutRequestID,
      merchantRequestId: darajaResponse.MerchantRequestID,
      phoneNumber: formattedPhone,
      amount: numAmount,
      accountReference: safeAccountRef,
      transactionDesc: safeTxnDesc,
      purpose: purpose as any,
      sellerId: safeSellerId,
      sellerName: safeSellerName,
      status: "PENDING" as const,
      resultDesc: darajaResponse.ResponseDescription,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
    };

    mpesaTransactionsStore.add(txnRecord);

    return NextResponse.json({
      success: true,
      message: darajaResponse.CustomerMessage,
      checkoutRequestId: darajaResponse.CheckoutRequestID,
      merchantRequestId: darajaResponse.MerchantRequestID,
      responseCode: darajaResponse.ResponseCode,
      shortcode: DEFAULT_DARAJA_CONFIG.shortcode,
      environment: DEFAULT_DARAJA_CONFIG.environment,
    });
  } catch (error: any) {
    console.error("STK Push API Route error:", error);
    return NextResponse.json(
      { error: "Failed to initiate M-Pesa STK Push. Please check your network and try again." },
      { status: 500 }
    );
  }
}
