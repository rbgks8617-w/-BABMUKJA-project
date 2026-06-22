import React, { useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import PriceSummary from "../components/PriceSummary";
import QuantitySelector from "../components/QuantitySelector";
import { getMenuById } from "../services/restaurantService";
import { useCart } from "../store/CartContext";
import { formatPrice } from "../utils/formatPrice";

export default function MenuDetailScreen({ route, navigation }) {
  const { menuId } = route.params;
  const menu = getMenuById(menuId);
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [addedMessage, setAddedMessage] = useState("");

  const normalizedSelectedOptions = useMemo(
    () => [...selectedOptions].sort((a, b) => a.id.localeCompare(b.id)),
    [selectedOptions],
  );

  const optionTotal = useMemo(
    () => normalizedSelectedOptions.reduce((sum, option) => sum + option.price, 0),
    [normalizedSelectedOptions],
  );

  if (!menu) {
    return (
      <View style={styles.empty}>
        <Text>메뉴 정보를 찾을 수 없습니다.</Text>
      </View>
    );
  }

  const unitPrice = menu.price + optionTotal;
  const totalPrice = unitPrice * quantity;

  function toggleOption(option) {
    setAddedMessage("");
    setSelectedOptions((prevOptions) => {
      const exists = prevOptions.some((item) => item.id === option.id);
      return exists ? prevOptions.filter((item) => item.id !== option.id) : [...prevOptions, option];
    });
  }

  function makeOrderItem() {
    return {
      menuId: menu.id,
      name: menu.name,
      quantity,
      selectedOptions: normalizedSelectedOptions,
      basePrice: menu.price,
      unitPrice,
      totalPrice,
    };
  }

  function handleAddToCart() {
    addToCart(makeOrderItem());
    setAddedMessage(`${menu.name} ${quantity}개를 장바구니에 담았어요.`);
  }

  function handleDirectPayment() {
    navigation.navigate("Payment", { orderItems: [makeOrderItem()] });
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: menu.imageUrl }} style={styles.image} />
      <Text style={styles.category}>{menu.category}</Text>
      <Text style={styles.name}>{menu.name}</Text>
      <Text style={styles.price}>{formatPrice(menu.price)}</Text>
      <Text style={styles.description}>{menu.description}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>옵션 선택</Text>
        {menu.options.map((option) => {
          const isSelected = selectedOptions.some((item) => item.id === option.id);
          return (
            <Pressable
              key={option.id}
              style={[styles.option, isSelected && styles.optionSelected]}
              onPress={() => toggleOption(option)}
            >
              <Text style={styles.optionName}>{option.name}</Text>
              <Text style={styles.optionPrice}>+ {formatPrice(option.price)}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.quantityRow}>
        <Text style={styles.sectionTitle}>수량</Text>
        <QuantitySelector
          quantity={quantity}
          onDecrease={() => {
            setAddedMessage("");
            setQuantity((value) => Math.max(1, value - 1));
          }}
          onIncrease={() => {
            setAddedMessage("");
            setQuantity((value) => value + 1);
          }}
        />
      </View>

      <PriceSummary price={totalPrice} />

      {addedMessage ? (
        <View style={styles.addedBox}>
          <Text style={styles.addedText}>{addedMessage}</Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        <Pressable style={[styles.actionButton, styles.secondary]} onPress={handleAddToCart}>
          <Text style={styles.secondaryText}>장바구니 담기</Text>
        </Pressable>
        <Pressable style={[styles.actionButton, styles.primary]} onPress={handleDirectPayment}>
          <Text style={styles.primaryText}>바로 결제</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: 240,
    borderRadius: 14,
    marginBottom: 18,
  },
  category: {
    alignSelf: "flex-start",
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#fff0e8",
    color: "#d9532b",
    fontSize: 12,
    fontWeight: "900",
  },
  name: {
    marginTop: 10,
    color: "#222222",
    fontSize: 28,
    fontWeight: "900",
  },
  price: {
    marginTop: 8,
    color: "#d9532b",
    fontSize: 20,
    fontWeight: "900",
  },
  description: {
    marginTop: 10,
    color: "#666666",
    lineHeight: 21,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    color: "#222222",
    fontSize: 18,
    fontWeight: "900",
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "#f0dfcc",
    borderRadius: 10,
    backgroundColor: "#ffffff",
  },
  optionSelected: {
    borderColor: "#d9532b",
    backgroundColor: "#fff0e8",
  },
  optionName: {
    color: "#222222",
    fontWeight: "800",
  },
  optionPrice: {
    color: "#d9532b",
    fontWeight: "800",
  },
  quantityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 24,
  },
  addedBox: {
    marginTop: 14,
    padding: 13,
    borderRadius: 12,
    backgroundColor: "#ecfff5",
    borderWidth: 1,
    borderColor: "#bdebd2",
  },
  addedText: {
    color: "#1f8f5f",
    fontWeight: "900",
    lineHeight: 20,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
  },
  actionButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 15,
    borderRadius: 10,
  },
  primary: {
    backgroundColor: "#d9532b",
  },
  secondary: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d9532b",
  },
  primaryText: {
    color: "#ffffff",
    fontWeight: "900",
  },
  secondaryText: {
    color: "#d9532b",
    fontWeight: "900",
  },
});
