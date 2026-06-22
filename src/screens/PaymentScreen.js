import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import PriceSummary from "../components/PriceSummary";
import { createDummyPayment } from "../services/paymentService";
import { useCart } from "../store/CartContext";
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
    color: "#222222",
    fontSize: 26,
    fontWeight: "900",
  },
  sectionTitle: {
    marginTop: 14,
    color: "#222222",
    fontSize: 18,
    fontWeight: "900",
  },
  item: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#f0dfcc",
  },
  itemName: {
    color: "#222222",
    fontSize: 17,
    fontWeight: "900",
  },
  itemMeta: {
    marginTop: 6,
    color: "#666666",
  },
  itemPrice: {
    marginTop: 8,
    color: "#d9532b",
    fontWeight: "900",
  },
  method: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#f0dfcc",
  },
  methodSelected: {
    borderColor: "#d9532b",
    backgroundColor: "#fff0e8",
  },
  methodText: {
    color: "#222222",
    fontWeight: "800",
  },
  payButton: {
    alignItems: "center",
    paddingVertical: 15,
    borderRadius: 10,
    backgroundColor: "#d9532b",
  },
  payButtonText: {
    color: "#ffffff",
    fontWeight: "900",
  },
});
