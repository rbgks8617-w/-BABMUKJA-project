import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import RecommendationBanner from "../components/RecommendationBanner";
import RestaurantCard from "../components/RestaurantCard";
import { getRestaurants, getUniversity } from "../services/restaurantService";
import { useCart } from "../store/CartContext";

export default function RestaurantListScreen({ navigation }) {
  const university = getUniversity();
  const restaurants = getRestaurants();
  const { totalQuantity } = useCart();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>{university.name}</Text>
          <Text style={styles.title}>오늘 캠퍼스에서 뭐 먹지?</Text>
        </View>
        <Pressable style={styles.cartButton} onPress={() => navigation.navigate("Cart")}>
          <Text style={styles.cartText}>장바구니 {totalQuantity}</Text>
        </Pressable>
      </View>

      <RecommendationBanner onPress={() => navigation.navigate("Recommendation")} />

      <Text style={styles.sectionTitle}>학교 식당</Text>
      {restaurants.map((restaurant) => (
        <RestaurantCard
          key={restaurant.id}
          restaurant={restaurant}
          onPress={() => navigation.navigate("RestaurantDetail", { restaurantId: restaurant.id })}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 14,
    marginBottom: 18,
  },
  eyebrow: {
    color: "#d9532b",
    fontWeight: "800",
  },
  title: {
    maxWidth: 230,
    marginTop: 6,
    color: "#222222",
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 34,
  },
  cartButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#222222",
  },
  cartText: {
    color: "#ffffff",
    fontWeight: "800",
  },
  sectionTitle: {
    marginBottom: 12,
    color: "#222222",
    fontSize: 21,
    fontWeight: "900",
  },
});
