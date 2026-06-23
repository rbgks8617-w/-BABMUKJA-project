import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import RecommendationBanner from "../components/RecommendationBanner";
import RestaurantCard from "../components/RestaurantCard";
import { getRestaurants, getUniversity } from "../services/restaurantService";
import { useCart } from "../store/CartContext";
import { colors } from "../theme/colors";

function chunkPairs(items) {
  const rows = [];
  for (let index = 0; index < items.length; index += 2) {
    rows.push(items.slice(index, index + 2));
  }
  return rows;
}

export default function RestaurantListScreen({ navigation }) {
  const university = getUniversity();
  const restaurants = getRestaurants();
  const restaurantRows = chunkPairs(restaurants);
  const { totalQuantity } = useCart();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>{university.name}</Text>
          <Text style={styles.title}>오늘 캠퍼스에서 뭐 먹지?</Text>
        </View>
        <Pressable style={styles.cartButton} onPress={() => navigation.navigate("Cart")}>
          <Text style={styles.cartText}>장바구니 {totalQuantity}</Text>
        </Pressable>
      </View>

      <RecommendationBanner onPress={() => navigation.navigate("Recommendation")} />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>학교 식당</Text>
        <Text style={styles.sectionMeta}>{restaurants.length}곳</Text>
      </View>

      <View style={styles.grid}>
        {restaurantRows.map((row) => (
          <View key={row.map((restaurant) => restaurant.id).join("-")} style={styles.gridRow}>
            {row.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                onPress={() => navigation.navigate("RestaurantDetail", { restaurantId: restaurant.id })}
              />
            ))}
            {row.length === 1 && <View style={styles.emptyCell} />}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 18,
    paddingBottom: 28,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },
  headerCopy: {
    flex: 1,
  },
  eyebrow: {
    color: colors.sky,
    fontWeight: "800",
  },
  title: {
    maxWidth: 230,
    marginTop: 6,
    color: colors.text,
    fontSize: 26,
    fontWeight: "800",
    lineHeight: 32,
  },
  cartButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 3,
  },
  cartText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "900",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 21,
    fontWeight: "800",
  },
  sectionMeta: {
    color: colors.textSoft,
    fontWeight: "800",
  },
  grid: {
    gap: 12,
  },
  gridRow: {
    flexDirection: "row",
    gap: 12,
  },
  emptyCell: {
    flex: 1,
  },
});
