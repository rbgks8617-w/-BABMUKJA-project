import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { formatPrice } from "../utils/formatPrice";

export default function OrderCompleteScreen({ route, navigation }) {
  const { order } = route.params;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.completeBox}>
        <Text style={styles.check}>✓</Text>
        <Text style={styles.title}>주문이 완료됐어요</Text>
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
        <Text style={styles.readyLabel}>예상 준비 시간</Text>
        <Text style={styles.readyTime}>약 {order.estimatedMinutes}분</Text>
      </View>

      <Pressable style={styles.homeButton} onPress={() => navigation.replace("RestaurantList")}>
        <Text style={styles.homeButtonText}>홈으로 돌아가기</Text>
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
    borderRadius: 14,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#f0dfcc",
  },
  check: {
    width: 58,
    height: 58,
    marginBottom: 14,
    borderRadius: 29,
    backgroundColor: "#1f8f5f",
    color: "#ffffff",
    fontSize: 38,
    fontWeight: "900",
    textAlign: "center",
    lineHeight: 58,
  },
  title: {
    color: "#222222",
    fontSize: 25,
    fontWeight: "900",
  },
  orderNumber: {
    marginTop: 8,
    color: "#666666",
    fontWeight: "700",
  },
  summary: {
    padding: 18,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#f0dfcc",
  },
  sectionTitle: {
    marginBottom: 14,
    color: "#222222",
    fontSize: 18,
    fontWeight: "900",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 14,
    marginBottom: 10,
  },
  itemName: {
    flex: 1,
    color: "#222222",
    fontWeight: "700",
  },
  itemPrice: {
    color: "#d9532b",
    fontWeight: "900",
  },
  divider: {
    height: 1,
    marginVertical: 10,
    backgroundColor: "#f0dfcc",
  },
  totalLabel: {
    color: "#222222",
    fontSize: 16,
    fontWeight: "900",
  },
  totalPrice: {
    color: "#d9532b",
    fontSize: 18,
    fontWeight: "900",
  },
  readyBox: {
    padding: 18,
    borderRadius: 14,
    backgroundColor: "#222222",
  },
  readyLabel: {
    color: "#ffffff",
    fontWeight: "700",
  },
  readyTime: {
    marginTop: 6,
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "900",
  },
  homeButton: {
    alignItems: "center",
    paddingVertical: 15,
    borderRadius: 10,
    backgroundColor: "#d9532b",
  },
  homeButtonText: {
    color: "#ffffff",
    fontWeight: "900",
  },
});
