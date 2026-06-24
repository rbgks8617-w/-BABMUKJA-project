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
      <Pressable style={styles.button} onPress={onDecrease}>
        <Text style={styles.buttonText}>-</Text>
      </Pressable>
      <Text style={styles.quantity}>{quantity}</Text>
      <Pressable style={styles.button} onPress={onIncrease}>
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
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#222222",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "800",
  },
  quantity: {
    minWidth: 30,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "800",
  },
});
