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
  global.__VENDLEX_MPESA_TRANSACTIONS = [
    {
      id: "txn-1",
      checkoutRequestId: "ws_CO_31082026094012_891240",
      merchantRequestId: "MR-89412-10",
      mpesaReceiptNumber: "SKLQG89124",
      phoneNumber: "254712345678",
      amount: 799,
      accountReference: "SUB-BUSINESS",
      transactionDesc: "Business Monthly Subscription Plan",
      purpose: "SUBSCRIPTION",
      sellerId: "biz-1",
      sellerName: "Nairobi Tech Hub",
      status: "COMPLETED",
      resultDesc: "The service request is processed successfully.",
      timestamp: "2026-08-31 09:40:15",
    },
    {
      id: "txn-2",
      checkoutRequestId: "ws_CO_31082026071015_291041",
      merchantRequestId: "MR-78210-04",
      mpesaReceiptNumber: "SKLQG78210",
      phoneNumber: "254722998877",
      amount: 1499,
      accountReference: "SUB-PRO",
      transactionDesc: "Pro Annual Subscription Plan",
      purpose: "SUBSCRIPTION",
      sellerId: "biz-3",
      sellerName: "Kilifi Coconut Crafts",
      status: "COMPLETED",
      resultDesc: "The service request is processed successfully.",
      timestamp: "2026-08-31 07:10:18",
    },
    {
      id: "txn-3",
      checkoutRequestId: "ws_CO_30082026154500_334102",
      merchantRequestId: "MR-55410-01",
      mpesaReceiptNumber: "SKLQG55410",
      phoneNumber: "254733445566",
      amount: 299,
      accountReference: "SUB-STARTER",
      transactionDesc: "Starter Monthly Subscription Plan",
      purpose: "SUBSCRIPTION",
      sellerId: "biz-2",
      sellerName: "Savanna Kicks & Apparel",
      status: "COMPLETED",
      resultDesc: "The service request is processed successfully.",
      timestamp: "2026-08-30 15:45:04",
    },
  ];
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
