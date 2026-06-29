import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import FavoriteHeartButton from "./FavoriteHeartButton";
import { colors } from "../theme/colors";
import type { Menu } from "../types/app";
import { formatPrice } from "../utils/formatPrice";

type MenuCardProps = {
  menu: Menu;
  onPress: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
};

export default function MenuCard({ menu, onPress, isFavorite = false, onToggleFavorite }: MenuCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Image source={{ uri: menu.imageUrl }} style={styles.image} />
      {onToggleFavorite ? (
        <FavoriteHeartButton isFavorite={isFavorite} style={styles.favoriteButton} onPress={onToggleFavorite} />
      ) : null}
      <View style={styles.content}>
        <Text numberOfLines={1} style={styles.name}>{menu.name}</Text>
        <Text numberOfLines={2} style={styles.description}>{menu.description}</Text>
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
    position: "relative",
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
    padding: 11,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: {
    width: 88,
    height: 88,
    borderRadius: 10,
  },
  favoriteButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 3,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "800",
  },
  description: {
    marginTop: 5,
    color: colors.textMuted,
    fontSize: 13,
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
