import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CachedRemoteImage from "../components/CachedRemoteImage";
import QuantitySelector from "../components/QuantitySelector";
import { Icon, ui } from "../components/AppUI";
import FavoriteHeartButton from "../components/FavoriteHeartButton";
import { useFavorites } from "../store/FavoriteContext";
import { getMenuById } from "../services/restaurantService";
import { useCart } from "../store/CartContext";
import { colors } from "../theme/colors";
import type { AppScreenProps, MenuOption, OrderItem } from "../types/app";
import { formatPrice } from "../utils/formatPrice";

export default function MenuDetailScreen({
  route,
  navigation,
}: AppScreenProps<"MenuDetail">) {
  const insets = useSafeAreaInsets();
  const { menuId } = route.params;
  const menu = getMenuById(menuId);
  const { addToCart } = useCart();
  const { isFavoriteMenu, toggleFavoriteMenu } = useFavorites();
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<MenuOption[]>([]);
  const [addedMessage, setAddedMessage] = useState("");

  const normalizedSelectedOptions = useMemo(
    () => [...selectedOptions].sort((a, b) => a.id.localeCompare(b.id)),
    [selectedOptions],
  );

  const optionTotal = useMemo(
    () =>
      normalizedSelectedOptions.reduce((sum, option) => sum + option.price, 0),
    [normalizedSelectedOptions],
  );

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
      return exists
        ? prevOptions.filter((item) => item.id !== option.id)
        : [...prevOptions, option];
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

  function handleAddToCart() {
    addToCart(makeOrderItem());
    setAddedMessage(`${currentMenu.name} ${quantity}개를 담았어요`);
  }

  function handleGoToCart() {
    setAddedMessage("");
    navigation.navigate("Cart");
  }

  function handleDirectPayment() {
    navigation.navigate("Payment", { orderItems: [makeOrderItem()], fromCart: false });
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <View>
          <CachedRemoteImage uri={currentMenu.imageUrl} style={styles.image} />
          <FavoriteHeartButton
            isFavorite={isFavoriteMenu(menuId)}
            onPress={() => toggleFavoriteMenu(menuId)}
            style={{ position: "absolute", right: 14, top: 14 }}
          />
        </View>
        <Text style={styles.category}>{currentMenu.category}</Text>
        <Text accessibilityRole="header" style={styles.name}>{currentMenu.name}</Text>
        <Text style={styles.price}>{formatPrice(currentMenu.price)}</Text>
        <Text style={styles.description}>{currentMenu.description}</Text>

        {currentMenu.options.length > 0 && <View style={styles.section}>
          <Text style={styles.sectionTitle}>옵션 선택</Text>
          {currentMenu.options.map((option) => {
            const isSelected = selectedOptions.some(
              (item) => item.id === option.id,
            );
            return (
              <Pressable
                key={option.id}
                accessibilityRole="checkbox"
                aria-checked={isSelected}
                style={({ pressed }) => [styles.option, isSelected && styles.optionSelected, pressed && ui.pressed]}
                onPress={() => toggleOption(option)}
              >
                <Icon
                  name={isSelected ? "checkbox" : "square-outline"}
                  size={22}
                  color={isSelected ? colors.primary : colors.textSoft}
                />
                <Text style={[styles.optionName, { flex: 1, marginLeft: 10 }]}>
                  {option.name}
                </Text>
                <Text style={styles.optionPrice}>
                  + {formatPrice(option.price)}
                </Text>
              </Pressable>
            );
          })}
        </View>}

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

      </ScrollView>
      <View
        style={[ui.actionBar, { paddingBottom: Math.max(16, insets.bottom) }]}
      >
        {addedMessage ? (
          <View style={styles.confirmation}>
            <Text accessibilityLiveRegion="polite" style={styles.confirmationText}>{addedMessage}</Text>
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.cartLink, pressed && ui.pressed]}
              onPress={handleGoToCart}
            >
              <Text style={styles.secondaryText}>장바구니 보기</Text>
            </Pressable>
          </View>
        ) : null}
        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [ui.primaryButton, styles.actionButton, styles.secondary, pressed && ui.pressed]}
            onPress={handleAddToCart}
          >
            <Text style={styles.secondaryText}>장바구니 담기</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [ui.primaryButton, styles.actionButton, pressed && ui.pressed]}
            onPress={handleDirectPayment}
          >
            <Text style={ui.primaryButtonText}>{formatPrice(totalPrice)} 결제</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  container: {
    padding: 20,
    paddingBottom: 20,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: 216,
    borderRadius: 16,
    marginBottom: 16,
  },
  category: {
    alignSelf: "flex-start",
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: colors.surfaceWarm,
    color: colors.primary,
    fontSize: 12,
    fontWeight: "600",
  },
  name: {
    marginTop: 10,
    color: colors.text,
    fontSize: 28,
    fontWeight: "600",
  },
  price: {
    marginTop: 8,
    color: colors.primary,
    fontSize: 20,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  description: {
    marginTop: 10,
    color: colors.textMuted,
    lineHeight: 21,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: "#ffffff",
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceWarm,
  },
  optionName: {
    color: colors.text,
    fontWeight: "600",
  },
  optionPrice: {
    color: colors.primary,
    fontWeight: "600",
  },
  quantityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingHorizontal: 8,
  },
  secondary: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: colors.primary,
  },
  secondaryText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  confirmation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingLeft: 12,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: colors.surfaceWarm,
  },
  confirmationText: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
    lineHeight: 20,
  },
  cartLink: {
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: 12,
  },
});
