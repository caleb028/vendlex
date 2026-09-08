"use client";

import React, { createContext, useContext, useState } from "react";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "order" | "payment" | "review" | "system" | "promo";
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "💰 M-Pesa Payment Received",
    message: "KSh 154,999 received from Grace Wanjiku for Order #SKL-89412 (Samsung Galaxy S24 Ultra).",
    type: "payment",
    timestamp: "10 mins ago",
    read: false,
    actionUrl: "/seller/orders"
  },
  {
    id: "notif-2",
    title: "⭐ 5-Star Review Left",
    message: "Brian Otieno gave 'Savannah Kitenge Dress' 5 stars: 'Exceptional tailoring, fits like a glove!'",
    type: "review",
    timestamp: "1 hour ago",
    read: false,
    actionUrl: "/seller/reviews"
  },
  {
    id: "notif-3",
    title: "📦 Order Ready for Dispatch",
    message: "Fargo Courier assigned for Order #SKL-89390 to Mombasa Nyali.",
    type: "order",
    timestamp: "3 hours ago",
    read: true,
    actionUrl: "/seller/orders"
  },
  {
    id: "notif-4",
    title: "🇰🇪 VendLex Verification Approved",
    message: "Congratulations! Your business Nairobi Tech Hub is now officially Verified.",
    type: "system",
    timestamp: "1 day ago",
    read: true,
    actionUrl: "/seller/settings"
  }
];

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (item: Omit<NotificationItem, "id" | "timestamp" | "read">) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const addNotification = (
    item: Omit<NotificationItem, "id" | "timestamp" | "read">
  ) => {
    const newNotif: NotificationItem = {
      ...item,
      id: `notif-${Date.now()}`,
      timestamp: "Just now",
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
