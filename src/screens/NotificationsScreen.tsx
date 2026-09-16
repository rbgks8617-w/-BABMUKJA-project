import React from "react";
import { Icon } from "../components/AppUI";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useNotifications } from "../store/NotificationContext";
import { colors } from "../theme/colors";
import type { AppScreenProps, CampusNotification, RootStackParamList } from "../types/app";

export default function NotificationsScreen({ navigation }: AppScreenProps<"Notifications">) {
  const { notifications, markAllRead, markRead, unreadCount } = useNotifications();

  function openNotification(notification: CampusNotification) {
    markRead(notification.id);

    if (!notification.target) {
      return;
    }

    if (notification.target.screen === "Community") {
      navigation.navigate("Community", notification.target.params as RootStackParamList["Community"]);
    }
    if (notification.target.screen === "CommunityPostDetail" && notification.target.params) {
      navigation.navigate("CommunityPostDetail", notification.target.params as RootStackParamList["CommunityPostDetail"]);
    }
    if (notification.target.screen === "MealMate") navigation.navigate("MealMate");
    if (notification.target.screen === "MealMateChat" && notification.target.params) {
      navigation.navigate("MealMateChat", notification.target.params as RootStackParamList["MealMateChat"]);
    }
  }

  const renderNotification = ({ item: notification }: { item: CampusNotification }) => (
    <Pressable
      style={({ pressed }) => [
        styles.noticeCard,
        !notification.isRead && styles.noticeCardUnread,
        pressed && styles.noticeCardPressed,
      ]}
      onPress={() => openNotification(notification)}
    >
      <View style={styles.noticeTop}>
        <View style={[styles.noticeDot, notification.type === "order" && styles.noticeDotOrder]} />
        <Text style={styles.noticeTitle}>{notification.title}</Text>
        <Text style={styles.noticeTime}>{notification.createdAt}</Text>
      </View>
      <Text style={styles.noticeMessage}>{notification.message}</Text>
    </Pressable>
  );

  return (
    <FlatList
      data={notifications}
      keyExtractor={(notification) => notification.id}
      renderItem={renderNotification}
      ListHeaderComponent={
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <Text style={styles.eyebrow}>새로운 소식 {unreadCount}</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{unreadCount}</Text>
            </View>
          </View>
          <Text style={styles.title}>내 캠퍼스의 새 소식</Text>
          <Pressable accessibilityRole="button" onPress={markAllRead} style={{ flexDirection: "row", gap: 6, alignItems: "center", alignSelf: "flex-end", minHeight: 44 }}><Icon name="checkmark-done-outline" size={16} color={colors.primary} /><Text style={{ color: colors.primary, fontSize: 12 }}>모두 읽음</Text></Pressable>
        </View>
      }
      ListEmptyComponent={
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>아직 알림이 없어요</Text>
          <Text style={styles.emptyText}>주문이나 나랑 밥먹자 활동이 생기면 바로 알려줄게요.</Text>
        </View>
      }
      contentContainerStyle={styles.container}
      initialNumToRender={8}
      maxToRenderPerBatch={8}
      windowSize={7}
      removeClippedSubviews
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 36,
    backgroundColor: colors.background,
  },
  hero: {
    marginBottom: 14,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderColor: "#ccebf7",
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
  },
  countBadge: {
    minWidth: 25,
    height: 25,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    borderRadius: 13,
    backgroundColor: "#ff3b30",
  },
  countBadgeText: {
    color: "#ffffff",
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
    paddingVertical: 20,
    paddingHorizontal: 10,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  noticeCardUnread: {
    borderColor: "#9ed9f0",
    backgroundColor: "#F2F6FF",
  },
  noticeCardPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
  noticeTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minHeight: 24,
  },
  noticeDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  noticeDotOrder: {
    backgroundColor: colors.orange ?? "#f26b3a",
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
    textAlign: "center",
  },
});
