import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type QuantitySelectorProps = {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
};

export default function QuantitySelector({ quantity, onDecrease, onIncrease }: QuantitySelectorProps) {
  return (
    <View style={styles.container}>
      <Pressable accessibilityRole="button" accessibilityLabel="수량 줄이기" disabled={quantity <= 1} style={[styles.button, quantity <= 1 && { opacity: 0.35 }]} onPress={onDecrease}>
        <Text style={styles.buttonText}>-</Text>
      </Pressable>
      <Text style={styles.quantity}>{quantity}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="수량 늘리기" style={styles.button} onPress={onIncrease}>
        <Text style={styles.buttonText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  button: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#222222",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "600",
  },
  quantity: {
    minWidth: 30,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "600",
  },
});
