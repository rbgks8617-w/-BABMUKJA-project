import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon, ui } from "../components/AppUI";
import { createDummyPayment } from "../services/paymentService";
import { useCart } from "../store/CartContext";
import { colors } from "../theme/colors";
import type { AppScreenProps } from "../types/app";
import { formatPrice } from "../utils/formatPrice";

const paymentMethods = ["학교 포인트", "체크카드", "간편결제"];

export default function PaymentScreen({ route, navigation }: AppScreenProps<"Payment">) {
  const insets = useSafeAreaInsets();
  const orderItems = route.params?.orderItems ?? [];
  const { clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0]);

  const totalPrice = useMemo(
    () => orderItems.reduce((sum, item) => sum + item.totalPrice, 0),
    [orderItems],
  );

  function handlePayment() {
    const order = createDummyPayment(orderItems, paymentMethod);
    if (route.params?.fromCart) clearCart();
    navigation.replace("OrderComplete", { order });
  }

  if (orderItems.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.title}>주문할 메뉴가 없어요</Text>
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [ui.primaryButton, pressed && ui.pressed]}
          onPress={() => navigation.navigate("RestaurantList", { category: "전체" })}
        >
          <Text style={ui.primaryButtonText}>메뉴 둘러보기</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title} accessibilityRole="header">주문 확인</Text>
        <Text style={styles.notice}>테스트 주문이에요. 실제로 결제되지 않아요.</Text>
        {orderItems.map((item) => (
          <View key={item.cartId ?? item.menuId} style={styles.item}>
            <View style={styles.itemDetails}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemMeta}>
                {item.quantity}개
                {item.selectedOptions.length > 0 && ` · ${item.selectedOptions.map((option) => option.name).join(", ")}`}
              </Text>
            </View>
            <Text style={styles.itemPrice}>{formatPrice(item.totalPrice)}</Text>
          </View>
        ))}
        <Text style={styles.sectionTitle} accessibilityRole="header">결제 수단</Text>
        {paymentMethods.map((method) => (
          <Pressable
            key={method}
            accessibilityRole="radio"
            aria-checked={paymentMethod === method}
            style={({ pressed }) => [
              styles.method,
              paymentMethod === method && styles.methodSelected,
              pressed && ui.pressed,
            ]}
            onPress={() => setPaymentMethod(method)}
          >
            <Icon
              name={paymentMethod === method ? "radio-button-on" : "radio-button-off"}
              size={20}
              color={paymentMethod === method ? colors.primary : colors.textMuted}
            />
            <Text style={styles.methodText}>{method}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <View style={[ui.actionBar, { paddingBottom: Math.max(16, insets.bottom) }]}>
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [ui.primaryButton, pressed && ui.pressed]}
          onPress={handlePayment}
        >
          <Text style={ui.primaryButtonText}>{formatPrice(totalPrice)} 테스트 결제</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surfaceMuted },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, gap: 16 },
  container: {
    padding: 20,
    gap: 12,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "600",
  },
  notice: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: colors.surfaceWarm,
    color: colors.primaryDark,
    fontSize: 14,
    lineHeight: 20,
  },
  sectionTitle: {
    marginTop: 14,
    color: colors.text,
    fontSize: 18,
    fontWeight: "600",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemDetails: { flex: 1, minWidth: 0 },
  itemName: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "600",
  },
  itemMeta: {
    marginTop: 6,
    color: colors.textMuted,
  },
  itemPrice: {
    color: colors.text,
    fontVariant: ["tabular-nums"],
    fontWeight: "600",
  },
  method: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 52,
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  methodSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceWarm,
  },
  methodText: {
    color: colors.text,
    fontWeight: "600",
  },
});
