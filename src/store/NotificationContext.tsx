import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { CampusNotification } from "../types/app";

type AddNotificationInput = Omit<CampusNotification, "id" | "createdAt" | "isRead"> &
  Partial<Pick<CampusNotification, "id" | "createdAt" | "isRead">>;

type NotificationContextValue = {
  notifications: CampusNotification[];
  unreadCount: number;
  addNotification: (notification: AddNotificationInput) => void;
  markRead: (notificationId: string) => void;
  markAllRead: () => void;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);
const MAX_NOTIFICATIONS = 50;

const initialNotifications: CampusNotification[] = [
  {
    id: "ready-1",
    type: "order",
    title: "음식 준비 알림",
    message: "주문한 메뉴가 곧 준비돼요. 픽업 알림을 놓치지 마세요.",
    createdAt: "방금",
    isRead: false,
  },
  {
    id: "mate-1",
    type: "mate",
    title: "나랑 밥먹자 알림",
    message: "12:30 라온식당 모임에 익명 학생이 참여했어요.",
    createdAt: "3분 전",
    isRead: false,
  },
];

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<CampusNotification[]>(initialNotifications);

  const addNotification = useCallback((notification: AddNotificationInput) => {
    const nextNotification: CampusNotification = {
      id: notification.id ?? `${notification.type ?? "system"}-${Date.now()}`,
      isRead: notification.isRead ?? false,
      ...notification,
      createdAt: notification.createdAt ?? "방금",
    };

    // Temporary guard until server-side notification pagination exists.
    setNotifications((currentNotifications) => [nextNotification, ...currentNotifications].slice(0, MAX_NOTIFICATIONS));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) => ({
        ...notification,
        isRead: true,
      })),
    );
  }, []);

  const markRead = useCallback((notificationId: string) => {
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) =>
        notification.id === notificationId
          ? {
              ...notification,
              isRead: true,
            }
          : notification,
      ),
    );
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications],
  );

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      addNotification,
      markRead,
      markAllRead,
    }),
    [addNotification, markAllRead, markRead, notifications, unreadCount],
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error("useNotifications must be used inside NotificationProvider");
  }

  return context;
}
