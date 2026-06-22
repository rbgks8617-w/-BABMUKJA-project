import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import PriceSummary from "../components/PriceSummary";
import { createDummyPayment } from "../services/paymentService";
import { useCart } from "../store/CartContext";
import { colors } from "../theme/colors";
import { formatPrice } from "../utils/formatPrice";

const paymentMethods = ["학교 포인트", "체크카드", "간편결제"];

export default function PaymentScreen({ route, navigation }) {
  const orderItems = route.params?.orderItems ?? [];
  const { clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0]);

  const totalPrice = useMemo(
    () => orderItems.reduce((sum, item) => sum + item.totalPrice, 0),
    [orderItems],
  );

  function handlePayment() {
    const order = createDummyPayment(orderItems, paymentMethod);
    clearCart();
    navigation.replace("OrderComplete", { order });
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>주문 확인</Text>

      {orderItems.map((item) => (
        <View key={item.cartId ?? item.menuId} style={styles.item}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemMeta}>수량 {item.quantity}개</Text>
          <Text style={styles.itemPrice}>{formatPrice(item.totalPrice)}</Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>결제 수단</Text>
      {paymentMethods.map((method) => (
        <Pressable
          key={method}
          style={[styles.method, paymentMethod === method && styles.methodSelected]}
          onPress={() => setPaymentMethod(method)}
        >
          <Text style={styles.methodText}>{method}</Text>
        </Pressable>
      ))}

      <PriceSummary price={totalPrice} />
      <Pressable style={styles.payButton} onPress={handlePayment}>
        <Text style={styles.payButtonText}>더미 결제 완료</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 12,
  },
  title: {
    marginBottom: 4,
    color: colors.text,
    fontSize: 26,
    fontWeight: "800",
  },
  sectionTitle: {
    marginTop: 14,
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  item: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemName: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "800",
  },
  itemMeta: {
    marginTop: 6,
    color: colors.textMuted,
  },
  itemPrice: {
    marginTop: 8,
    color: colors.primary,
    fontWeight: "800",
  },
  method: {
    padding: 15,
    borderRadius: 14,
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
    fontWeight: "800",
  },
  payButton: {
    alignItems: "center",
    paddingVertical: 15,
    borderRadius: 14,
    backgroundColor: colors.primary,
  },
  payButtonText: {
    color: "#ffffff",
    fontWeight: "900",
  },
});
