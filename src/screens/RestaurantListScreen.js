import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import RecommendationBanner from "../components/RecommendationBanner";
import RestaurantCard from "../components/RestaurantCard";
import {
  getFriendCheckins,
  getPopularRestaurants,
  getRestaurants,
  getTodayCafeteria,
  getUniversity,
} from "../services/restaurantService";
import { useCart } from "../store/CartContext";
import { colors } from "../theme/colors";
import { formatPrice } from "../utils/formatPrice";

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
  const todayCafeteria = getTodayCafeteria();
  const popularRestaurants = getPopularRestaurants();
  const friendCheckins = getFriendCheckins();
  const restaurantRows = chunkPairs(restaurants);
  const { totalQuantity } = useCart();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.heroRow}>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>{university.name}</Text>
            <Text style={styles.title}>오늘 캠퍼스에서 뭐 먹지?</Text>
          </View>
          <Pressable style={styles.cartButton} onPress={() => navigation.navigate("Cart")}>
            <Text style={styles.cartText}>장바구니 {totalQuantity}</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.todayCard}>
        <View style={styles.todayTopRow}>
          <Text style={styles.cardEyebrow}>오늘 학식</Text>
          <Text style={styles.statusPill}>{todayCafeteria.statusText}</Text>
        </View>
        <Text style={styles.todayTitle}>{todayCafeteria.menuItems[0]}</Text>
        <Text style={styles.todayMenu}>{todayCafeteria.menuItems.slice(1).join(" · ")}</Text>
        <View style={styles.todayFooter}>
          <Text style={styles.todayPrice}>{formatPrice(todayCafeteria.price)}</Text>
          <Text style={styles.todayTime}>{todayCafeteria.servingTime}</Text>
        </View>
      </View>

      <View style={styles.infoGrid}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>실시간 인기</Text>
          {popularRestaurants.map((item) => (
            <View key={item.restaurantId} style={styles.rankRow}>
              <Text style={styles.rankNumber}>{item.rank}</Text>
              <Text style={styles.rankName} numberOfLines={1}>
                {item.restaurant?.name ?? "식당"}
              </Text>
              <Text style={styles.rankCount}>{item.selectedCount}명</Text>
            </View>
          ))}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>지금 학생들이 가는 곳</Text>
          {friendCheckins.map((item) => (
            <View key={item.restaurantId} style={styles.checkinRow}>
              <Text style={styles.checkinDot}>●</Text>
              <Text style={styles.checkinName} numberOfLines={1}>
                {item.restaurant?.name ?? "식당"}
              </Text>
              <Text style={styles.rankCount}>{item.studentCount}명</Text>
            </View>
          ))}
        </View>
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
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 28,
    backgroundColor: colors.background,
  },
  header: {
    marginBottom: 20,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 14,
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
    marginBottom: 4,
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
  todayCard: {
    marginBottom: 14,
    padding: 16,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  todayTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  cardEyebrow: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "900",
  },
  statusPill: {
    overflow: "hidden",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: colors.surfaceWarm,
    color: colors.primaryDark,
    fontSize: 11,
    fontWeight: "900",
  },
  todayTitle: {
    marginTop: 12,
    color: colors.text,
    fontSize: 23,
    fontWeight: "900",
  },
  todayMenu: {
    marginTop: 7,
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
  todayFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
  },
  todayPrice: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "900",
  },
  todayTime: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: "800",
  },
  infoGrid: {
    gap: 12,
    marginBottom: 14,
  },
  infoCard: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoTitle: {
    marginBottom: 10,
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  rankRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 5,
  },
  rankNumber: {
    width: 24,
    height: 24,
    overflow: "hidden",
    borderRadius: 12,
    backgroundColor: colors.primary,
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "900",
    lineHeight: 24,
    textAlign: "center",
  },
  rankName: {
    flex: 1,
    color: colors.text,
    fontWeight: "900",
  },
  rankCount: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "800",
  },
  checkinRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 5,
  },
  checkinDot: {
    color: colors.mint,
    fontSize: 12,
  },
  checkinName: {
    flex: 1,
    color: colors.text,
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
