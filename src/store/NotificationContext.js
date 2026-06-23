import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

const NotificationContext = createContext(null);

const initialNotifications = [
  {
    id: "ready-1",
    type: "order",
    title: "음식 준비 알림",
    message: "오늘의 한식 정식이 곧 준비돼요.",
    createdAt: "방금",
    isRead: false,
  },
  {
    id: "mate-1",
    type: "mate",
    title: "밥친구 모집 알림",
    message: "12:30 학생식당 모임에 새 참여자가 들어왔어요.",
    createdAt: "3분 전",
    isRead: false,
  },
];

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(initialNotifications);

  const addNotification = useCallback((notification) => {
    const nextNotification = {
      id: `${notification.type ?? "notice"}-${Date.now()}`,
      createdAt: "방금",
      isRead: false,
      ...notification,
    };

    setNotifications((currentNotifications) => [nextNotification, ...currentNotifications]);
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) => ({
        ...notification,
        isRead: true,
      })),
    );
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications],
  );

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAllRead,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error("useNotifications must be used inside NotificationProvider");
  }

  return context;
}
