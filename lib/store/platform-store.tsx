"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface PlatformOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  county: string;
  productTitle: string;
  storeName: string;
  amount: number;
  mpesaReceipt: string;
  orderDate: string;
  courierTracking?: string;
  status: "PAID_ESCROW" | "DISPATCHED" | "DELIVERED" | "ESCROW_RELEASED";
}

export interface PlatformServiceRequest {
  id: string;
  customerName: string;
  customerPhone: string;
  county: string;
  town: string;
  serviceTitle: string;
  category: string;
  providerName: string;
  quoteAmount: number;
  requestDate: string;
  notes: string;
  status: "PENDING" | "DISPATCHED" | "COMPLETED" | "CANCELLED";
}

export interface PlatformKYC {
  id: string;
  bizName: string;
  ownerName: string;
  regNumber: string;
  nationalId: string;
  county: string;
  submittedDate: string;
  docUrl: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

export interface PlatformReport {
  id: string;
  productTitle: string;
  sellerName: string;
  reason: string;
  details: string;
  date: string;
  status: "PENDING_REVIEW" | "RESOLVED" | "REMOVED";
}

interface PlatformContextType {
  orders: PlatformOrder[];
  serviceRequests: PlatformServiceRequest[];
  businessKYCs: PlatformKYC[];
  flaggedReports: PlatformReport[];
  addOrder: (order: Omit<PlatformOrder, "id" | "orderNumber" | "orderDate" | "status">) => void;
  updateOrderStatus: (id: string, status: PlatformOrder["status"], trackingNumber?: string) => void;
  addServiceRequest: (req: Omit<PlatformServiceRequest, "id" | "requestDate" | "status">) => void;
  updateServiceStatus: (id: string, status: PlatformServiceRequest["status"], providerName?: string) => void;
  submitKYC: (kyc: Omit<PlatformKYC, "id" | "submittedDate" | "status">) => void;
  updateKYCStatus: (id: string, status: PlatformKYC["status"]) => void;
  addReport: (report: Omit<PlatformReport, "id" | "date" | "status">) => void;
  updateReportStatus: (id: string, status: PlatformReport["status"]) => void;
}

const DEFAULT_ORDERS: PlatformOrder[] = [
  {
    id: "ord-101",
    orderNumber: "ORD-9842",
    customerName: "David Ochieng",
    customerPhone: "0722 123 456",
    county: "Nairobi",
    productTitle: "Apple iPhone 15 Pro Max 256GB Titanium",
    storeName: "Nairobi Tech Hub",
    amount: 185000,
    mpesaReceipt: "QKH89421A",
    orderDate: "August 31, 2026",
    courierTracking: "FARGO-89421",
    status: "PAID_ESCROW",
  },
  {
    id: "ord-102",
    orderNumber: "ORD-9843",
    customerName: "Grace Wanjiku",
    customerPhone: "0711 987 654",
    county: "Kiambu",
    productTitle: "SunKing Home 500X Complete Solar System with 32\" TV",
    storeName: "Rift Solar & Power KE",
    amount: 38500,
    mpesaReceipt: "QKH91022B",
    orderDate: "August 31, 2026",
    courierTracking: "G4S-19204",
    status: "DISPATCHED",
  },
];

const DEFAULT_SERVICES: PlatformServiceRequest[] = [
  {
    id: "sr-101",
    customerName: "Peter Kamau",
    customerPhone: "0720 555 444",
    county: "Nairobi",
    town: "Westlands",
    serviceTitle: "Commercial & Residential Emergency Plumbing",
    category: "Plumbing & Repairs",
    providerName: "Nairobi Flow Masters",
    quoteAmount: 4500,
    requestDate: "August 31, 2026",
    notes: "Leaking main water supply pipe under kitchen sink.",
    status: "PENDING",
  },
  {
    id: "sr-102",
    customerName: "Sarah Cherono",
    customerPhone: "0733 888 222",
    county: "Uasin Gishu",
    town: "Eldoret CBD",
    serviceTitle: "Solar PV Panel & Inverter System Installation",
    category: "Electrical & Solar",
    providerName: "Rift Solar Technicians",
    quoteAmount: 25000,
    requestDate: "August 31, 2026",
    notes: "Install 5kW hybrid inverter and 4 solar panels on roof.",
    status: "DISPATCHED",
  },
];

const DEFAULT_KYCS: PlatformKYC[] = [
  {
    id: "kyc-1",
    bizName: "Savanna Fashion House",
    ownerName: "Amina Hassan",
    regNumber: "BN/2024/782194",
    nationalId: "28914521",
    county: "Nairobi (Kilimani)",
    submittedDate: "August 30, 2026",
    docUrl: "CR12_Certificate_Savanna.pdf",
    status: "PENDING",
  },
  {
    id: "kyc-2",
    bizName: "Coast Agro Supplies",
    ownerName: "Ali Salim",
    regNumber: "BN/2023/119042",
    nationalId: "19482019",
    county: "Mombasa (Nyali)",
    submittedDate: "August 29, 2026",
    docUrl: "BusinessPermit_CoastAgro.pdf",
    status: "APPROVED",
  },
];

const DEFAULT_REPORTS: PlatformReport[] = [
  {
    id: "rep-1",
    productTitle: "Refurbished Smartphone",
    sellerName: "Quick Electronics KE",
    reason: "Misleading Price / Refurbished marked as Brand New",
    details: "Buyer received opened box with non-original charger.",
    date: "August 31, 2026",
    status: "PENDING_REVIEW",
  },
];

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

export function PlatformProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<PlatformOrder[]>(DEFAULT_ORDERS);
  const [serviceRequests, setServiceRequests] = useState<PlatformServiceRequest[]>(DEFAULT_SERVICES);
  const [businessKYCs, setBusinessKYCs] = useState<PlatformKYC[]>(DEFAULT_KYCS);
  const [flaggedReports, setFlaggedReports] = useState<PlatformReport[]>(DEFAULT_REPORTS);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const savedOrders = localStorage.getItem("vendlex_orders");
    const savedServices = localStorage.getItem("vendlex_services");
    const savedKYCs = localStorage.getItem("vendlex_kycs");
    const savedReports = localStorage.getItem("vendlex_reports");

    if (savedOrders) setOrders(JSON.parse(savedOrders));
    if (savedServices) setServiceRequests(JSON.parse(savedServices));
    if (savedKYCs) setBusinessKYCs(JSON.parse(savedKYCs));
    if (savedReports) setFlaggedReports(JSON.parse(savedReports));
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("vendlex_orders", JSON.stringify(orders));
      localStorage.setItem("vendlex_services", JSON.stringify(serviceRequests));
      localStorage.setItem("vendlex_kycs", JSON.stringify(businessKYCs));
      localStorage.setItem("vendlex_reports", JSON.stringify(flaggedReports));
    }
  }, [orders, serviceRequests, businessKYCs, flaggedReports, isMounted]);

  const addOrder = (orderData: Omit<PlatformOrder, "id" | "orderNumber" | "orderDate" | "status">) => {
    const newOrd: PlatformOrder = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      orderDate: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      status: "PAID_ESCROW",
    };
    setOrders((prev) => [newOrd, ...prev]);
  };

  const updateOrderStatus = (id: string, status: PlatformOrder["status"], trackingNumber?: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id
          ? {
              ...o,
              status,
              courierTracking: trackingNumber || o.courierTracking,
            }
          : o
      )
    );
  };

  const addServiceRequest = (reqData: Omit<PlatformServiceRequest, "id" | "requestDate" | "status">) => {
    const newReq: PlatformServiceRequest = {
      ...reqData,
      id: `sr-${Date.now()}`,
      requestDate: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      status: "PENDING",
    };
    setServiceRequests((prev) => [newReq, ...prev]);
  };

  const updateServiceStatus = (
    id: string,
    status: PlatformServiceRequest["status"],
    providerName?: string
  ) => {
    setServiceRequests((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              status,
              providerName: providerName || s.providerName,
            }
          : s
      )
    );
  };

  const submitKYC = (kycData: Omit<PlatformKYC, "id" | "submittedDate" | "status">) => {
    const newKyc: PlatformKYC = {
      ...kycData,
      id: `kyc-${Date.now()}`,
      submittedDate: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      status: "PENDING",
    };
    setBusinessKYCs((prev) => [newKyc, ...prev]);
  };

  const updateKYCStatus = (id: string, status: PlatformKYC["status"]) => {
    setBusinessKYCs((prev) =>
      prev.map((k) => (k.id === id ? { ...k, status } : k))
    );
  };

  const addReport = (reportData: Omit<PlatformReport, "id" | "date" | "status">) => {
    const newRep: PlatformReport = {
      ...reportData,
      id: `rep-${Date.now()}`,
      date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      status: "PENDING_REVIEW",
    };
    setFlaggedReports((prev) => [newRep, ...prev]);
  };

  const updateReportStatus = (id: string, status: PlatformReport["status"]) => {
    setFlaggedReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
  };

  return (
    <PlatformContext.Provider
      value={{
        orders,
        serviceRequests,
        businessKYCs,
        flaggedReports,
        addOrder,
        updateOrderStatus,
        addServiceRequest,
        updateServiceStatus,
        submitKYC,
        updateKYCStatus,
        addReport,
        updateReportStatus,
      }}
    >
      {children}
    </PlatformContext.Provider>
  );
}

export function usePlatform() {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error("usePlatform must be used within a PlatformProvider");
  }
  return context;
}
