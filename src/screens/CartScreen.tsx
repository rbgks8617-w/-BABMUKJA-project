import React, { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon, ui } from "../components/AppUI";
import QuantitySelector from "../components/QuantitySelector";
import { getMenuById } from "../services/restaurantService";
import { useCart } from "../store/CartContext";
import { colors } from "../theme/colors";
import type { AppScreenProps, CartItem, MenuOption } from "../types/app";
import { formatPrice } from "../utils/formatPrice";

function normalizeOptions(options: MenuOption[] = []) {
  return [...options].sort((a, b) => a.id.localeCompare(b.id));
}

function optionKey(options: MenuOption[] = []) {
  return normalizeOptions(options).map((option) => option.id).join("|");
}

export default function CartScreen({ navigation }: AppScreenProps<"Cart">) {
  const insets = useSafeAreaInsets();
  const { cartItems, changeCartItemQuantity, removeFromCart, splitCartItemWithOptions, totalPrice } = useCart();
  const [optionDrafts, setOptionDrafts] = useState<Record<string, MenuOption[]>>({});

  const getDraftOptions = useCallback(
    (item: CartItem) => optionDrafts[item.cartId] ?? item.selectedOptions,
    [optionDrafts],
  );

  const toggleOption = useCallback((item: CartItem, option: MenuOption) => {
    setOptionDrafts((currentDrafts) => {
      const currentOptions = currentDrafts[item.cartId] ?? item.selectedOptions;
      const optionExists = currentOptions.some((selectedOption) => selectedOption.id === option.id);
      const nextOptions = optionExists
        ? currentOptions.filter((selectedOption) => selectedOption.id !== option.id)
        : [...currentOptions, option];

      return {
        ...currentDrafts,
        [item.cartId]: normalizeOptions(nextOptions),
      };
    });
  }, []);

  const applyOptionChange = useCallback(
    (item: CartItem) => {
      splitCartItemWithOptions(item.cartId, getDraftOptions(item));
      setOptionDrafts((currentDrafts) => {
        const nextDrafts = { ...currentDrafts };
        delete nextDrafts[item.cartId];
        return nextDrafts;
      });
    },
    [getDraftOptions, splitCartItemWithOptions],
  );

  const renderCartItem = useCallback(
    ({ item }: { item: CartItem }) => {
      const menu = getMenuById(item.menuId);
      const availableOptions = menu?.options ?? [];
      const draftOptions = getDraftOptions(item);
      const hasOptionChange = optionKey(draftOptions) !== optionKey(item.selectedOptions);
      const applyLabel = item.quantity > 1 ? "이 옵션으로 1개 따로 담기" : "이 옵션으로 적용";

      return (
        <View style={styles.item}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${item.name} 삭제`}
            style={({ pressed }) => [styles.deleteButton, pressed && ui.pressed]}
            onPress={() => removeFromCart(item.cartId)}
          >
            <Text style={styles.deleteButtonText}>삭제</Text>
          </Pressable>

          <View style={styles.itemHeader}>
            <View style={styles.itemTitleArea}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemMeta}>개당 {formatPrice(item.unitPrice ?? item.basePrice)}</Text>
            </View>
          </View>

          {item.selectedOptions.length > 0 ? (
            <Text style={styles.itemMeta}>
              옵션: {item.selectedOptions.map((option) => option.name).join(", ")}
            </Text>
          ) : (
            <Text style={styles.itemMeta}>옵션 없음</Text>
          )}

          {availableOptions.length > 0 ? (
            <View style={styles.optionPanel}>
              <View style={styles.optionPanelHeader}>
                <Text style={styles.optionPanelTitle}>옵션 변경</Text>
                {item.quantity > 1 && <Text style={styles.optionPanelHint}>1개에만 적용돼요</Text>}
              </View>
              <View style={styles.optionChips}>
                {availableOptions.map((option) => {
                  const isSelected = draftOptions.some((selectedOption) => selectedOption.id === option.id);
                  return (
                    <Pressable
                      key={option.id}
                      accessibilityRole="checkbox"
                      aria-checked={isSelected}
                      style={({ pressed }) => [styles.optionChip, isSelected && styles.optionChipSelected, pressed && ui.pressed]}
                      onPress={() => toggleOption(item, option)}
                    >
                      <Text style={[styles.optionChipText, isSelected && styles.optionChipTextSelected]}>
                        {option.name}
                      </Text>
                      <Text style={[styles.optionChipPrice, isSelected && styles.optionChipTextSelected]}>
                        +{formatPrice(option.price)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: !hasOptionChange }}
                disabled={!hasOptionChange}
                style={[styles.optionApplyButton, !hasOptionChange && styles.optionApplyButtonDisabled]}
                onPress={() => applyOptionChange(item)}
              >
                <Text style={[styles.optionApplyText, !hasOptionChange && styles.optionApplyTextDisabled]}>
                  {applyLabel}
                </Text>
              </Pressable>
            </View>
          ) : null}

          <View style={styles.quantityPanel}>
            <Text style={styles.quantityLabel}>수량</Text>
            <QuantitySelector
              quantity={item.quantity}
              onDecrease={() => changeCartItemQuantity(item.cartId, -1)}
              onIncrease={() => changeCartItemQuantity(item.cartId, 1)}
            />
          </View>
        </View>
      );
    },
    [
      applyOptionChange,
      changeCartItemQuantity,
      getDraftOptions,
      removeFromCart,
      toggleOption,
    ],
  );

  if (cartItems.length === 0) {
    return (
      <View style={styles.empty}>
        <Icon name="bag-handle-outline" size={32} color={colors.textMuted} />
        <Text style={styles.emptyTitle}>장바구니가 비어 있어요</Text>
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
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.cartId}
        renderItem={renderCartItem}
        contentContainerStyle={styles.container}
        ItemSeparatorComponent={() => <View style={styles.listGap} />}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={7}
      />
      <View style={[ui.actionBar, { paddingBottom: Math.max(16, insets.bottom) }]}>
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [ui.primaryButton, pressed && ui.pressed]}
          onPress={() => navigation.navigate("Payment", { orderItems: cartItems, fromCart: true })}
        >
          <Text style={ui.primaryButtonText}>{formatPrice(totalPrice)} 결제하기</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surfaceMuted },
  container: {
    padding: 20,
  },
  listGap: {
    height: 12,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    gap: 12,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "600",
  },
  item: {
    position: "relative",
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: colors.border,
  },
  deleteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 2,
    minWidth: 48,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButtonText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: "700",
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingRight: 62,
  },
  itemTitleArea: {
    flex: 1,
  },
  itemName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  itemMeta: {
    marginTop: 8,
    color: colors.textMuted,
    lineHeight: 19,
  },
  optionPanel: {
    marginTop: 14,
    padding: 12,
    borderRadius: 14,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionPanelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 10,
  },
  optionPanelTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  optionPanelHint: {
    flexShrink: 1,
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
    textAlign: "right",
  },
  optionChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionChip: {
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionChipText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "700",
  },
  optionChipPrice: {
    marginTop: 1,
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "600",
  },
  optionChipTextSelected: {
    color: "#ffffff",
  },
  optionApplyButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    marginTop: 11,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  optionApplyButtonDisabled: {
    backgroundColor: "#e8f1f7",
  },
  optionApplyText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
  optionApplyTextDisabled: {
    color: "#7f95a8",
  },
  quantityPanel: {
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quantityLabel: {
    marginBottom: 10,
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
});
