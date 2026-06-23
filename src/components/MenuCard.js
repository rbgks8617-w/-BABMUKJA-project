import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";
import { formatPrice } from "../utils/formatPrice";

export default function MenuCard({ menu, onPress }) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Image source={{ uri: menu.imageUrl }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.name}>{menu.name}</Text>
        <Text style={styles.description}>{menu.description}</Text>
        <View style={styles.scoreRow}>
          <Text style={styles.scoreText}>맛 {menu.tasteScore ?? "4.3"}</Text>
          <Text style={styles.scoreText}>양 {menu.portionScore ?? "4.4"}</Text>
          <Text style={styles.scoreText}>가성비 {menu.valueScore ?? "4.5"}</Text>
        </View>
        <Text style={styles.price}>{formatPrice(menu.price)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 14,
    padding: 12,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: {
    width: 96,
    height: 96,
    borderRadius: 10,
  },
  content: {
    flex: 1,
  },
  name: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  description: {
    marginTop: 6,
    color: colors.textMuted,
    lineHeight: 19,
  },
  price: {
    marginTop: 8,
    color: colors.primary,
    fontSize: 16,
    fontWeight: "800",
  },
  scoreRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
  },
  scoreText: {
    overflow: "hidden",
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.surfaceWarm,
    color: colors.primaryDark,
    fontSize: 11,
    fontWeight: "900",
  },
});
