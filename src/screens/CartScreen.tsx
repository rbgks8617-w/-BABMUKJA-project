import React, { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import PriceSummary from "../components/PriceSummary";
import QuantitySelector from "../components/QuantitySelector";
import { getMenuById } from "../services/restaurantService";
import { useCart } from "../store/CartContext";
import { APP_FONT_FAMILY } from "../theme/typography";
import type { AppScreenProps, CartItem, MenuOption } from "../types/app";
import { formatPrice } from "../utils/formatPrice";

function normalizeOptions(options: MenuOption[] = []) {
  return [...options].sort((a, b) => a.id.localeCompare(b.id));
}

function optionKey(options: MenuOption[] = []) {
  return normalizeOptions(options).map((option) => option.id).join("|");
}

export default function CartScreen({ navigation }: AppScreenProps<"Cart">) {
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
                <Text style={styles.optionPanelHint}>선택한 옵션은 1개만 분리돼요</Text>
              </View>
              <View style={styles.optionChips}>
                {availableOptions.map((option) => {
                  const isSelected = draftOptions.some((selectedOption) => selectedOption.id === option.id);
                  return (
                    <Pressable
                      key={option.id}
                      style={[styles.optionChip, isSelected && styles.optionChipSelected]}
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
        <Text style={styles.emptyTitle}>장바구니가 비어 있어요</Text>
        <Pressable style={styles.primaryButton} onPress={() => navigation.navigate("RestaurantList")}>
          <Text style={styles.primaryButtonText}>식당 보러가기</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      data={cartItems}
      keyExtractor={(item) => item.cartId}
      renderItem={renderCartItem}
      contentContainerStyle={styles.container}
      ItemSeparatorComponent={() => <View style={styles.listGap} />}
      initialNumToRender={6}
      maxToRenderPerBatch={6}
      windowSize={7}
      removeClippedSubviews
      ListFooterComponent={
        <View style={styles.footer}>
          <PriceSummary price={totalPrice} />
          <Pressable
            style={styles.primaryButton}
            onPress={() => navigation.navigate("Payment", { orderItems: cartItems })}
          >
            <Text style={styles.primaryButtonText}>결제하기</Text>
          </Pressable>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  listGap: {
    height: 14,
  },
  footer: {
    paddingTop: 14,
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
    paddingRight: 62,
  },
  itemTitleArea: {
    flex: 1,
  },
  itemName: {
    color: "#222222",
    fontSize: 18,
    fontWeight: "900",
  },
  itemMeta: {
    marginTop: 8,
    color: "#666666",
    lineHeight: 19,
  },
  optionPanel: {
    marginTop: 14,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#f7fbfe",
    borderWidth: 1,
    borderColor: "#d7e9f1",
  },
  optionPanelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 10,
  },
  optionPanelTitle: {
    color: "#222222",
    fontSize: 14,
    fontWeight: "900",
  },
  optionPanelHint: {
    flexShrink: 1,
    color: "#66788a",
    fontSize: 11,
    fontWeight: "800",
    textAlign: "right",
  },
  optionChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionChip: {
    minHeight: 38,
    justifyContent: "center",
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cdeaf7",
  },
  optionChipSelected: {
    backgroundColor: "#1d63b7",
    borderColor: "#1d63b7",
  },
  optionChipText: {
    color: "#222222",
    fontSize: 12,
    fontWeight: "900",
  },
  optionChipPrice: {
    marginTop: 1,
    color: "#66788a",
    fontSize: 10,
    fontWeight: "800",
  },
  optionChipTextSelected: {
    color: "#ffffff",
  },
  optionApplyButton: {
    alignItems: "center",
    marginTop: 11,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: "#1d63b7",
  },
  optionApplyButtonDisabled: {
    backgroundColor: "#e8f1f7",
  },
  optionApplyText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "900",
  },
  optionApplyTextDisabled: {
    color: "#7f95a8",
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
  primaryButton: {
    alignItems: "center",
    marginTop: 6,
    minWidth: 132,
    paddingHorizontal: 28,
    paddingVertical: 15,
    borderRadius: 14,
    backgroundColor: "#d9532b",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontFamily: APP_FONT_FAMILY,
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 20,
  },
});
