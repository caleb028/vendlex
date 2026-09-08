"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./auth-store";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "order" | "payment" | "review" | "system" | "promo";
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (item: Omit<NotificationItem, "id" | "timestamp" | "read">) => void;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const formatRelativeTime = (isoString?: string): string => {
    if (!isoString) return "Just now";
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diffSeconds < 60) return "Just now";
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} mins ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} hours ago`;
    return `${Math.floor(diffSeconds / 86400)} days ago`;
  };

  const mapServerTypeToClientType = (type?: string): NotificationItem["type"] => {
    const t = (type || "").toLowerCase();
    if (t.includes("order")) return "order";
    if (t.includes("payment")) return "payment";
    if (t.includes("review")) return "review";
    if (t.includes("promo")) return "promo";
    return "system";
  };

  const refreshNotifications = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      setNotifications([]);
      return;
    }

    try {
      const res = await fetch(`/api/notifications?userId=${encodeURIComponent(user.id)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.notifications)) {
          const formatted: NotificationItem[] = data.notifications.map((n: any) => ({
            id: n.id,
            title: n.title,
            message: n.message,
            type: mapServerTypeToClientType(n.type),
            timestamp: formatRelativeTime(n.createdAt),
            read: !!n.isRead,
            actionUrl: n.link || n.actionUrl,
          }));
          setNotifications(formatted);
          return;
        }
      }
    } catch (e) {
      console.warn("Failed to fetch notifications:", e);
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch (e) {
      console.warn("Failed to sync mark-as-read:", e);
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    for (const id of unreadIds) {
      try {
        await fetch("/api/notifications", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
      } catch (e) {
        // silent
      }
    }
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
        refreshNotifications,
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
