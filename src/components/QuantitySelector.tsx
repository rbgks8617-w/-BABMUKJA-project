import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Icon, ui } from "./AppUI";
import { colors } from "../theme/colors";

type QuantitySelectorProps = {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
};

export default function QuantitySelector({ quantity, onDecrease, onIncrease }: QuantitySelectorProps) {
  return (
    <View style={styles.container}>
      <Pressable accessibilityRole="button" accessibilityLabel="수량 줄이기" accessibilityState={{ disabled: quantity <= 1 }} disabled={quantity <= 1} style={({ pressed }) => [styles.button, quantity <= 1 && styles.disabled, pressed && ui.pressed]} onPress={onDecrease}>
        <Icon name="remove" size={20} color={colors.text} />
      </Pressable>
      <Text accessibilityLiveRegion="polite" style={styles.quantity}>{quantity}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="수량 늘리기" style={({ pressed }) => [styles.button, pressed && ui.pressed]} onPress={onIncrease}>
        <Icon name="add" size={20} color={colors.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  button: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  disabled: { opacity: 0.4 },
  quantity: {
    minWidth: 24,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "600",
    color: colors.text,
    fontVariant: ["tabular-nums"],
  },
});
