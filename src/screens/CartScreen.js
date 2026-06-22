import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import PriceSummary from "../components/PriceSummary";
import QuantitySelector from "../components/QuantitySelector";
import { useCart } from "../store/CartContext";
import { formatPrice } from "../utils/formatPrice";

export default function CartScreen({ navigation }) {
  const { cartItems, changeCartItemQuantity, removeFromCart, totalPrice } = useCart();

  if (cartItems.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>장바구니가 비어 있어요</Text>
        <Pressable style={styles.primaryButton} onPress={() => navigation.navigate("RestaurantList")}>
          <Text style={styles.primaryButtonText}>식당 보러가기</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {cartItems.map((item) => (
        <View key={item.cartId} style={styles.item}>
          <View style={styles.itemHeader}>
            <View style={styles.itemTitleArea}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemMeta}>개당 {formatPrice(item.unitPrice ?? item.basePrice)}</Text>
            </View>
            <Text style={styles.itemPrice}>{formatPrice(item.totalPrice)}</Text>
          </View>

          {item.selectedOptions.length > 0 ? (
            <Text style={styles.itemMeta}>
              옵션: {item.selectedOptions.map((option) => option.name).join(", ")}
            </Text>
          ) : (
            <Text style={styles.itemMeta}>옵션 없음</Text>
          )}

          <View style={styles.itemActions}>
            <QuantitySelector
              quantity={item.quantity}
              onDecrease={() => changeCartItemQuantity(item.cartId, -1)}
              onIncrease={() => changeCartItemQuantity(item.cartId, 1)}
            />
            <Pressable onPress={() => removeFromCart(item.cartId)}>
              <Text style={styles.removeText}>삭제</Text>
            </Pressable>
          </View>
        </View>
      ))}

      <PriceSummary price={totalPrice} />
      <Pressable
        style={styles.primaryButton}
        onPress={() => navigation.navigate("Payment", { orderItems: cartItems })}
      >
        <Text style={styles.primaryButtonText}>결제하기</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 14,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyTitle: {
    marginBottom: 16,
    color: "#222222",
    fontSize: 22,
    fontWeight: "900",
  },
  item: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#f0dfcc",
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  itemTitleArea: {
    flex: 1,
  },
  itemName: {
    color: "#222222",
    fontSize: 18,
    fontWeight: "900",
  },
  itemPrice: {
    color: "#d9532b",
    fontWeight: "900",
  },
  itemMeta: {
    marginTop: 8,
    color: "#666666",
  },
  itemActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    marginTop: 14,
  },
  removeText: {
    color: "#d9532b",
    fontWeight: "800",
  },
  primaryButton: {
    alignItems: "center",
    marginTop: 6,
    paddingVertical: 15,
    borderRadius: 10,
    backgroundColor: "#d9532b",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "900",
  },
});
