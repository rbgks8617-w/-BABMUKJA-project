import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import CachedRemoteImage from "../components/CachedRemoteImage";
import PriceSummary from "../components/PriceSummary";
import QuantitySelector from "../components/QuantitySelector";
import { getMenuById } from "../services/restaurantService";
import { useCart } from "../store/CartContext";
import type { AppScreenProps, MenuOption, OrderItem } from "../types/app";
import { formatPrice } from "../utils/formatPrice";

export default function MenuDetailScreen({ route, navigation }: AppScreenProps<"MenuDetail">) {
  const { menuId } = route.params;
  const menu = getMenuById(menuId);
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<MenuOption[]>([]);
  const [addedMessage, setAddedMessage] = useState("");
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTranslateY = useRef(new Animated.Value(28)).current;
  const toastAnimation = useRef<Animated.CompositeAnimation | null>(null);

  const normalizedSelectedOptions = useMemo(
    () => [...selectedOptions].sort((a, b) => a.id.localeCompare(b.id)),
    [selectedOptions],
  );

  const optionTotal = useMemo(
    () => normalizedSelectedOptions.reduce((sum, option) => sum + option.price, 0),
    [normalizedSelectedOptions],
  );

  useEffect(() => {
    return () => {
      if (toastAnimation.current) {
        toastAnimation.current.stop();
      }
    };
  }, []);

  if (!menu) {
    return (
      <View style={styles.empty}>
        <Text>메뉴 정보를 찾을 수 없습니다.</Text>
      </View>
    );
  }

  const currentMenu = menu;
  const unitPrice = currentMenu.price + optionTotal;
  const totalPrice = unitPrice * quantity;

  function toggleOption(option: MenuOption) {
    setAddedMessage("");
    setSelectedOptions((prevOptions) => {
      const exists = prevOptions.some((item) => item.id === option.id);
      return exists ? prevOptions.filter((item) => item.id !== option.id) : [...prevOptions, option];
    });
  }

  function makeOrderItem(): OrderItem {
    return {
      menuId: currentMenu.id,
      name: currentMenu.name,
      quantity,
      selectedOptions: normalizedSelectedOptions,
      basePrice: currentMenu.price,
      unitPrice,
      totalPrice,
    };
  }

  function showAddedToast(message: string) {
    if (toastAnimation.current) {
      toastAnimation.current.stop();
    }

    setAddedMessage(message);
    toastOpacity.setValue(0);
    toastTranslateY.setValue(28);

    toastAnimation.current = Animated.sequence([
      Animated.parallel([
        Animated.timing(toastOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: false,
        }),
        Animated.timing(toastTranslateY, {
          toValue: 0,
          duration: 220,
          useNativeDriver: false,
        }),
      ]),
      Animated.delay(2300),
      Animated.parallel([
        Animated.timing(toastOpacity, {
          toValue: 0,
          duration: 420,
          useNativeDriver: false,
        }),
        Animated.timing(toastTranslateY, {
          toValue: 18,
          duration: 420,
          useNativeDriver: false,
        }),
      ]),
    ]);

    toastAnimation.current.start(({ finished }: { finished: boolean }) => {
      if (finished) {
        setAddedMessage("");
      }
    });
  }

  function handleAddToCart() {
    addToCart(makeOrderItem());
    showAddedToast(`${currentMenu.name} ${quantity}개가 추가되었습니다.`);
  }

  function handleGoToCart() {
    if (toastAnimation.current) {
      toastAnimation.current.stop();
    }

    setAddedMessage("");
    navigation.navigate("Cart");
  }

  function handleDirectPayment() {
    navigation.navigate("Payment", { orderItems: [makeOrderItem()] });
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <CachedRemoteImage uri={currentMenu.imageUrl} style={styles.image} />
        <Text style={styles.category}>{currentMenu.category}</Text>
        <Text style={styles.name}>{currentMenu.name}</Text>
        <Text style={styles.price}>{formatPrice(currentMenu.price)}</Text>
        <Text style={styles.description}>{currentMenu.description}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>옵션 선택</Text>
          {currentMenu.options.map((option) => {
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

        <View style={styles.actions}>
          <Pressable style={[styles.actionButton, styles.secondary]} onPress={handleAddToCart}>
            <Text style={styles.secondaryText}>장바구니 담기</Text>
          </Pressable>
          <Pressable style={[styles.actionButton, styles.primary]} onPress={handleDirectPayment}>
            <Text style={styles.primaryText}>바로 결제</Text>
          </Pressable>
        </View>
      </ScrollView>

      {addedMessage ? (
        <Animated.View
          style={[
            styles.toast,
            {
              opacity: toastOpacity,
              transform: [{ translateY: toastTranslateY }],
            },
          ]}
        >
          <Text style={styles.toastText}>{addedMessage}</Text>
          <Pressable hitSlop={8} style={styles.toastAction} onPress={handleGoToCart}>
            <Text style={styles.toastActionText}>장바구니로 가기</Text>
          </Pressable>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fffaf4",
  },
  container: {
    padding: 20,
    paddingBottom: 120,
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
  toast: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: "rgba(24, 24, 24, 0.94)",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 8,
  },
  toastText: {
    flex: 1,
    flexShrink: 1,
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20,
  },
  toastAction: {
    flexShrink: 0,
    minHeight: 34,
    justifyContent: "center",
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "#fff0e8",
  },
  toastActionText: {
    color: "#d9532b",
    fontSize: 13,
    fontWeight: "900",
    lineHeight: 18,
  },
});
