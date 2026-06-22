import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";
import { formatPrice } from "../utils/formatPrice";

export default function PriceSummary({ label = "총 결제 금액", price }) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.price}>{formatPrice(price)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 18,
    borderRadius: 16,
    backgroundColor: colors.ink,
  },
  label: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  price: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "900",
  },
});
