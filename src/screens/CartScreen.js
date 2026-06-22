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
          <Pressable
            accessibilityLabel={`${item.name} 삭제`}
            style={styles.deleteButton}
            onPress={() => removeFromCart(item.cartId)}
          >
            <Text style={styles.deleteButtonText}>삭제</Text>
          </Pressable>

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

          <View style={styles.quantityPanel}>
            <Text style={styles.quantityLabel}>수량</Text>
            <QuantitySelector
              quantity={item.quantity}
              onDecrease={() => changeCartItemQuantity(item.cartId, -1)}
              onIncrease={() => changeCartItemQuantity(item.cartId, 1)}
            />
            <Text style={styles.minHint}>최소 1개, 제거는 삭제 버튼</Text>
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
    position: "relative",
    padding: 16,
    paddingTop: 18,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#f0dfcc",
  },
  deleteButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 2,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#fff0e8",
  },
  deleteButtonText: {
    color: "#d9532b",
    fontSize: 12,
    fontWeight: "900",
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 74,
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
    textAlign: "right",
  },
  itemMeta: {
    marginTop: 8,
    color: "#666666",
    lineHeight: 19,
  },
  quantityPanel: {
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#fffaf2",
    borderWidth: 1,
    borderColor: "#f0dfcc",
  },
  quantityLabel: {
    marginBottom: 10,
    color: "#222222",
    fontSize: 14,
    fontWeight: "900",
  },
  minHint: {
    marginTop: 10,
    color: "#8a7566",
    fontSize: 12,
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
