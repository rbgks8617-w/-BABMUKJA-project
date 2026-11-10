import React, { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import CachedRemoteImage from "../components/CachedRemoteImage";
import MenuCard from "../components/MenuCard";
import { Icon } from "../components/AppUI";
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
            <View style={styles.infoRow}><Icon name="location-outline" size={16} color={colors.textMuted} /><Text style={styles.infoLine}>{restaurant.location}</Text></View>
            <View style={styles.infoRow}><Icon name="time-outline" size={16} color={colors.textMuted} /><Text style={styles.infoLine}>{restaurant.openingHours ?? "운영시간 준비중"}</Text></View>
          </View>
          <Text style={styles.description}>{restaurant.description}</Text>
          <Text style={styles.reviewSummary}>{restaurant.reviewSummary ?? "학생 리뷰가 곧 추가될 예정이에요."}</Text>
          <Text style={styles.sectionTitle}>메뉴</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {menuFilters.map((filter) => (
              <Pressable
                key={filter}
                accessibilityRole="tab"
                aria-selected={selectedFilter === filter}
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
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 28,
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
    marginBottom: 24,
  },
  name: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "700",
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
    fontWeight: "700",
  },
  infoBox: {
    gap: 10,
    marginTop: 14,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  infoLine: {
    flex: 1,
    fontSize: 12,
    color: colors.text,
    fontWeight: "600",
    lineHeight: 19,
  },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  description: {
    marginTop: 14,
    color: colors.textMuted,
    lineHeight: 21,
  },
  reviewSummary: {
    marginTop: 10,
    color: colors.textMuted,
    fontWeight: "600",
    lineHeight: 20,
  },
  sectionTitle: {
    marginTop: 22,
    marginBottom: 10,
    color: colors.text,
    fontSize: 22,
    fontWeight: "700",
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
    fontWeight: "700",
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
    fontWeight: "700",
  },
  filterSummaryCount: {
    overflow: "hidden",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: colors.surfaceWarm,
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
  },
});
