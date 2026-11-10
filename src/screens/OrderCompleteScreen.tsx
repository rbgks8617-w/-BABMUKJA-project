import React, { useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Icon, ui } from "../components/AppUI";
import { useNotifications } from "../store/NotificationContext";
import { colors } from "../theme/colors";
import type { AppScreenProps } from "../types/app";
import { formatPrice } from "../utils/formatPrice";

export default function OrderCompleteScreen({ route, navigation }: AppScreenProps<"OrderComplete">) {
  const { order } = route.params;
  const { addNotification } = useNotifications();

  useEffect(() => {
    addNotification({
      type: "order",
      title: "테스트 주문 알림",
      message: `테스트 주문번호 ${order.orderNumber} · 준비 시간 예시 약 ${order.estimatedMinutes}분`,
    });
  }, [addNotification, order.estimatedMinutes, order.orderNumber]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.completeBox}>
        <View style={styles.check}>
          <Icon name="checkmark" size={28} color={colors.surface} />
        </View>
        <Text accessibilityRole="header" style={styles.title}>테스트 주문이 완료됐어요</Text>
        <Text style={styles.orderNumber}>주문번호 {order.orderNumber}</Text>
      </View>

      <View style={styles.summary}>
        <Text style={styles.sectionTitle}>주문 메뉴</Text>
        {order.orderItems.map((item) => (
          <View key={item.cartId ?? item.menuId} style={styles.row}>
            <Text style={styles.itemName}>{item.name} x {item.quantity}</Text>
            <Text style={styles.itemPrice}>{formatPrice(item.totalPrice)}</Text>
          </View>
        ))}
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.totalLabel}>총 결제 금액</Text>
          <Text style={styles.totalPrice}>{formatPrice(order.totalPrice)}</Text>
        </View>
      </View>

      <View style={styles.readyBox}>
        <Text style={styles.readyLabel}>준비 시간 예시</Text>
        <Text style={styles.readyTime}>약 {order.estimatedMinutes}분</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        style={({ pressed }) => [ui.primaryButton, pressed && ui.pressed]}
        onPress={() => navigation.replace("RestaurantList", { category: "전체" })}
      >
        <Text style={ui.primaryButtonText}>홈으로 돌아가기</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
  },
  completeBox: {
    alignItems: "center",
    padding: 28,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  check: {
    width: 56,
    height: 56,
    marginBottom: 16,
    borderRadius: 28,
    backgroundColor: colors.success,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: colors.text,
    fontSize: 25,
    fontWeight: "600",
    textAlign: "center",
  },
  orderNumber: {
    marginTop: 8,
    color: colors.textMuted,
    fontWeight: "700",
  },
  summary: {
    padding: 18,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    marginBottom: 14,
    color: colors.text,
    fontSize: 18,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 14,
    marginBottom: 10,
  },
  itemName: {
    flex: 1,
    color: colors.text,
    fontWeight: "700",
  },
  itemPrice: {
    color: colors.primary,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    marginVertical: 10,
    backgroundColor: colors.border,
  },
  totalLabel: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  totalPrice: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "600",
  },
  readyBox: {
    padding: 18,
    borderRadius: 16,
    backgroundColor: colors.ink,
  },
  readyLabel: {
    color: "#ffffff",
    fontWeight: "700",
  },
  readyTime: {
    marginTop: 6,
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "700",
  },
});
