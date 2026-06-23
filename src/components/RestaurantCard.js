import React from "react";
import { ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";

export default function RestaurantCard({ restaurant, onPress }) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <ImageBackground source={{ uri: restaurant.imageUrl }} style={styles.image} imageStyle={styles.imageRadius}>
        <View style={styles.overlay} />
        <View style={styles.topRow}>
          <Text style={[styles.badge, restaurant.isOpen ? styles.open : styles.closed]}>
            {restaurant.isOpen ? "운영중" : "준비중"}
          </Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.name} numberOfLines={2}>
            {restaurant.name}
          </Text>
          <Text style={styles.location} numberOfLines={1}>
            {restaurant.location}
          </Text>
        </View>
      </ImageBackground>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    aspectRatio: 1,
    minWidth: 0,
    overflow: "hidden",
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 4,
  },
  image: {
    flex: 1,
    justifyContent: "space-between",
  },
  imageRadius: {
    borderRadius: 16,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(6, 28, 58, 0.34)",
  },
  topRow: {
    alignItems: "flex-start",
    padding: 10,
  },
  badge: {
    overflow: "hidden",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "900",
    shadowColor: "rgba(0, 0, 0, 0.18)",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
  },
  open: {
    backgroundColor: colors.mint,
  },
  closed: {
    backgroundColor: "#8b8b8b",
  },
  content: {
    padding: 12,
  },
  name: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "900",
    lineHeight: 21,
  },
  location: {
    marginTop: 5,
    color: "rgba(255, 255, 255, 0.88)",
    fontSize: 12,
    fontWeight: "800",
  },
});
