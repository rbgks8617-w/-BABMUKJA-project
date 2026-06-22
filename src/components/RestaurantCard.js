import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export default function RestaurantCard({ restaurant, onPress }) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Image source={{ uri: restaurant.imageUrl }} style={styles.image} />
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.name}>{restaurant.name}</Text>
          <Text style={[styles.badge, restaurant.isOpen ? styles.open : styles.closed]}>
            {restaurant.isOpen ? "운영중" : "준비중"}
          </Text>
        </View>
        <Text style={styles.location}>{restaurant.location}</Text>
        <Text style={styles.description}>{restaurant.description}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#f0dfcc",
  },
  image: {
    width: "100%",
    height: 150,
  },
  content: {
    padding: 16,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  name: {
    flex: 1,
    color: "#222222",
    fontSize: 20,
    fontWeight: "800",
  },
  badge: {
    overflow: "hidden",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800",
  },
  open: {
    backgroundColor: "#1f8f5f",
  },
  closed: {
    backgroundColor: "#8b8b8b",
  },
  location: {
    marginTop: 6,
    color: "#d9532b",
    fontWeight: "700",
  },
  description: {
    marginTop: 8,
    color: "#666666",
    lineHeight: 20,
  },
});
