import React, { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import CachedRemoteImage from "../components/CachedRemoteImage";
import MenuCard from "../components/MenuCard";
import { getMenusByRestaurantId, getRestaurantById } from "../services/restaurantService";
import { useFavorites } from "../store/FavoriteContext";
import { colors } from "../theme/colors";
import type { AppScreenProps, Menu } from "../types/app";

const SIGNATURE_FILTER = "대표메뉴";
const ALL_FILTER = "전체";

const MENU_GROUP_KEYWORDS = [
  "마라탕",
  "마라샹궈",
  "볶음밥",
  "덮밥",
  "김밥",
  "돈까스",
  "오믈렛",
  "찌개",
  "라면",
  "우동",
  "버거",
  "도시락",
  "커피",
  "음료",
  "디저트",
  "빵",
];

function getMenuGroup(menu: Menu) {
  const targetText = `${menu.name} ${menu.category} ${menu.description} ${(menu.tags ?? []).join(" ")}`;
  return MENU_GROUP_KEYWORDS.find((keyword) => targetText.includes(keyword)) ?? menu.category;
}

function getSignatureMenus(menus: Menu[]) {
  return menus.filter((menu) => menu.tags?.some((tag) => ["인기", "대표", "BEST", "추천"].includes(tag))).slice(0, 4);
}

export default function RestaurantDetailScreen({ route, navigation }: AppScreenProps<"RestaurantDetail">) {
  const { restaurantId } = route.params;
  const restaurant = getRestaurantById(restaurantId);
  const menus = getMenusByRestaurantId(restaurantId);
  const { isFavoriteMenu, toggleFavoriteMenu } = useFavorites();
  const [selectedFilter, setSelectedFilter] = useState(SIGNATURE_FILTER);

  const signatureMenus = useMemo(() => {
    const pickedMenus = getSignatureMenus(menus);
    return pickedMenus.length > 0 ? pickedMenus : menus.slice(0, 4);
  }, [menus]);
  const menuGroups = useMemo(() => Array.from(new Set(menus.map(getMenuGroup))).filter(Boolean), [menus]);
  const menuFilters = useMemo(() => [SIGNATURE_FILTER, ALL_FILTER, ...menuGroups], [menuGroups]);

  useEffect(() => {
    setSelectedFilter(SIGNATURE_FILTER);
  }, [restaurantId]);

  const visibleMenus = useMemo(() => {
    if (selectedFilter === SIGNATURE_FILTER) {
      return signatureMenus;
    }

    if (selectedFilter === ALL_FILTER) {
      return menus;
    }

    return menus.filter((menu) => getMenuGroup(menu) === selectedFilter);
  }, [menus, selectedFilter, signatureMenus]);

  if (!restaurant) {
    return (
      <View style={styles.empty}>
        <Text>식당 정보를 찾을 수 없습니다.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={visibleMenus}
      keyExtractor={(menu) => menu.id}
      renderItem={({ item }) => (
        <MenuCard
          menu={item}
          isFavorite={isFavoriteMenu(item.id)}
          onToggleFavorite={() => toggleFavoriteMenu(item.id)}
          onPress={() => navigation.navigate("MenuDetail", { menuId: item.id })}
        />
      )}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.container}
      initialNumToRender={8}
      maxToRenderPerBatch={8}
      windowSize={7}
      removeClippedSubviews
      ListHeaderComponent={
        <View>
          <CachedRemoteImage uri={restaurant.imageUrl} style={styles.heroImage} />
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
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {menuFilters.map((filter) => (
              <Pressable
                key={filter}
                style={[styles.filterChip, selectedFilter === filter && styles.filterChipActive]}
                onPress={() => setSelectedFilter(filter)}
              >
                <Text style={[styles.filterText, selectedFilter === filter && styles.filterTextActive]}>{filter}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.filterSummary}>
            <Text style={styles.filterSummaryTitle}>{selectedFilter}</Text>
            <Text style={styles.filterSummaryCount}>{visibleMenus.length}개</Text>
          </View>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 28,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  heroImage: {
    width: "100%",
    height: 196,
    borderRadius: 22,
    marginBottom: 16,
  },
  name: {
    color: "#222222",
    fontSize: 26,
    fontWeight: "900",
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
    borderRadius: 18,
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
    marginTop: 22,
    marginBottom: 10,
    color: "#222222",
    fontSize: 22,
    fontWeight: "900",
  },
  filterRow: {
    gap: 8,
    paddingRight: 12,
    paddingBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
  },
  filterTextActive: {
    color: "#ffffff",
  },
  filterSummary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  filterSummaryTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  filterSummaryCount: {
    overflow: "hidden",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: colors.surfaceWarm,
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
  },
});
