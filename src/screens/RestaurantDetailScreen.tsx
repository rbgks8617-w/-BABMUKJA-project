import React from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import MenuCard from "../components/MenuCard";
import { getMenusByRestaurantId, getRestaurantById } from "../services/restaurantService";
import { colors } from "../theme/colors";
import type { AppScreenProps } from "../types/app";

export default function RestaurantDetailScreen({ route, navigation }: AppScreenProps<"RestaurantDetail">) {
  const { restaurantId } = route.params;
  const restaurant = getRestaurantById(restaurantId);
  const menus = getMenusByRestaurantId(restaurantId);

  if (!restaurant) {
    return (
      <View style={styles.empty}>
        <Text>식당 정보를 찾을 수 없습니다.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: restaurant.imageUrl }} style={styles.heroImage} />
      <Text style={styles.name}>{restaurant.name}</Text>
      <View style={styles.scoreRow}>
        <Text style={styles.scorePill}>★ {restaurant.rating ?? "4.2"}</Text>
        <Text style={styles.scorePill}>맛 {restaurant.tasteScore ?? "4.2"}</Text>
        <Text style={styles.scorePill}>양 {restaurant.portionScore ?? "4.2"}</Text>
        <Text style={styles.scorePill}>가성비 {restaurant.valueScore ?? "4.3"}</Text>
      </View>
      <View style={styles.infoBox}>
        <Text style={styles.infoLine}>위치: {restaurant.location}</Text>
        <Text style={styles.infoLine}>영업시간: {restaurant.openingHours ?? "운영시간 준비중"}</Text>
        <Text style={styles.infoLine}>전화번호: {restaurant.phone ?? "등록 예정"}</Text>
      </View>
      <Text style={styles.description}>{restaurant.description}</Text>
      <Text style={styles.reviewSummary}>{restaurant.reviewSummary ?? "학생 리뷰가 곧 추가될 예정이에요."}</Text>
      <Text style={styles.sectionTitle}>메뉴</Text>

      {menus.map((menu) => (
        <MenuCard
          key={menu.id}
          menu={menu}
          onPress={() => navigation.navigate("MenuDetail", { menuId: menu.id })}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  heroImage: {
    width: "100%",
    height: 210,
    borderRadius: 14,
    marginBottom: 18,
  },
  name: {
    color: "#222222",
    fontSize: 28,
    fontWeight: "900",
  },
  location: {
    marginTop: 6,
    color: colors.primary,
    fontWeight: "800",
  },
  scoreRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  scorePill: {
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.surfaceWarm,
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: "900",
  },
  infoBox: {
    gap: 6,
    marginTop: 14,
    padding: 14,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoLine: {
    color: colors.text,
    fontWeight: "800",
    lineHeight: 19,
  },
  description: {
    marginTop: 14,
    color: "#666666",
    lineHeight: 21,
  },
  reviewSummary: {
    marginTop: 10,
    color: colors.textMuted,
    fontWeight: "800",
    lineHeight: 20,
  },
  sectionTitle: {
    marginTop: 24,
    marginBottom: 12,
    color: "#222222",
    fontSize: 22,
    fontWeight: "900",
  },
});
