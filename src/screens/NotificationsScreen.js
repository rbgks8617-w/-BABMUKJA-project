import React, { useEffect } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useNotifications } from "../store/NotificationContext";
import { colors } from "../theme/colors";

export default function NotificationsScreen() {
  const { notifications, markAllRead } = useNotifications();

  useEffect(() => {
    const timerId = setTimeout(markAllRead, 700);
    return () => clearTimeout(timerId);
  }, [markAllRead]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>캠퍼스 알림</Text>
        <Text style={styles.title}>놓치면 아쉬운 소식만 모았어요</Text>
        <Text style={styles.description}>음식 준비, 밥친구 참여, 모집 마감 같은 중요한 알림이 여기에 쌓여요.</Text>
      </View>

      {notifications.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>아직 알림이 없어요</Text>
          <Text style={styles.emptyText}>주문이나 밥친구 활동이 생기면 바로 알려줄게요.</Text>
        </View>
      ) : (
        notifications.map((notification) => (
          <View key={notification.id} style={[styles.noticeCard, !notification.isRead && styles.noticeCardUnread]}>
            <View style={styles.noticeTop}>
              <View style={[styles.noticeDot, notification.type === "order" && styles.noticeDotOrder]} />
              <Text style={styles.noticeTitle}>{notification.title}</Text>
              <Text style={styles.noticeTime}>{notification.createdAt}</Text>
            </View>
            <Text style={styles.noticeMessage}>{notification.message}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 36,
    backgroundColor: colors.background,
  },
  hero: {
    marginBottom: 16,
    padding: 18,
    borderRadius: 24,
    backgroundColor: "#eaf7fc",
    borderWidth: 1,
    borderColor: "#ccebf7",
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
  },
  title: {
    marginTop: 8,
    color: colors.ink,
    fontSize: 23,
    fontWeight: "900",
    lineHeight: 30,
  },
  description: {
    marginTop: 8,
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 21,
  },
  noticeCard: {
    marginBottom: 12,
    padding: 15,
    borderRadius: 22,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: colors.border,
  },
  noticeCardUnread: {
    borderColor: "#9ed9f0",
    backgroundColor: "#fbfeff",
  },
  noticeTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  noticeDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  noticeDotOrder: {
    backgroundColor: colors.orange,
  },
  noticeTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  noticeTime: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: "800",
  },
  noticeMessage: {
    marginTop: 10,
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20,
  },
  emptyCard: {
    alignItems: "center",
    padding: 28,
    borderRadius: 24,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
  },
  emptyText: {
    marginTop: 6,
    color: colors.textMuted,
    fontWeight: "800",
  },
});
