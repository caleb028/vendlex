/**
 * VendLex In-Memory M-Pesa Transaction & Webhook Ledger
 * Stores real-time transactions, callback payloads, and platform revenue metrics.
 */

export interface MpesaTransaction {
  id: string;
  checkoutRequestId: string;
  merchantRequestId: string;
  mpesaReceiptNumber?: string;
  phoneNumber: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
  purpose: "SUBSCRIPTION" | "LISTING_FEE" | "PRODUCT_PURCHASE" | "FEATURED_BANNER";
  sellerId?: string;
  sellerName?: string;
  status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";
  resultDesc?: string;
  timestamp: string;
  rawCallback?: any;
}

// Global in-memory storage (preserved across API calls in Next.js runtime)
declare global {
  var __VENDLEX_MPESA_TRANSACTIONS: MpesaTransaction[] | undefined;
}

if (!global.__VENDLEX_MPESA_TRANSACTIONS) {
  global.__VENDLEX_MPESA_TRANSACTIONS = [];
}

export const mpesaTransactionsStore = {
  getAll: (): MpesaTransaction[] => {
    return global.__VENDLEX_MPESA_TRANSACTIONS || [];
  },

  getById: (id: string): MpesaTransaction | undefined => {
    return (global.__VENDLEX_MPESA_TRANSACTIONS || []).find((t) => t.id === id);
  },

  getByCheckoutId: (checkoutRequestId: string): MpesaTransaction | undefined => {
    return (global.__VENDLEX_MPESA_TRANSACTIONS || []).find(
      (t) => t.checkoutRequestId === checkoutRequestId
    );
  },

  add: (txn: MpesaTransaction) => {
    if (!global.__VENDLEX_MPESA_TRANSACTIONS) {
      global.__VENDLEX_MPESA_TRANSACTIONS = [];
    }
    global.__VENDLEX_MPESA_TRANSACTIONS.unshift(txn);
  },

  updateStatus: (
    checkoutRequestId: string,
    status: MpesaTransaction["status"],
    mpesaReceiptNumber?: string,
    resultDesc?: string,
    rawCallback?: any
  ) => {
    if (!global.__VENDLEX_MPESA_TRANSACTIONS) return;
    const item = global.__VENDLEX_MPESA_TRANSACTIONS.find(
      (t) => t.checkoutRequestId === checkoutRequestId
    );
    if (item) {
      item.status = status;
      if (mpesaReceiptNumber) item.mpesaReceiptNumber = mpesaReceiptNumber;
      if (resultDesc) item.resultDesc = resultDesc;
      if (rawCallback) item.rawCallback = rawCallback;
    }
  },

  getTotalVolume: (): number => {
    return (global.__VENDLEX_MPESA_TRANSACTIONS || [])
      .filter((t) => t.status === "COMPLETED")
      .reduce((sum, t) => sum + t.amount, 0);
  },
};
