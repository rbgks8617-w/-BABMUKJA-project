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
});
