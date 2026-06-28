import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";
import {
  getBuildingCards,
  getCrowdPicks,
  getCrowdStatus,
  getMenusByCategory,
  getPopularMenus,
  getPopularRestaurants,
  getRestaurantById,
  getRestaurantCount,
  getTodayCafeteria,
  searchCampusFood,
} from "../services/restaurantService";
import { useCart } from "../store/CartContext";
import { useNotifications } from "../store/NotificationContext";
import { colors } from "../theme/colors";
import type { AppScreenProps, SearchResult } from "../types/app";
import { formatPrice } from "../utils/formatPrice";

const categoryTabs = ["전체", "한식", "중식", "분식", "양식", "카페", "가성비", "혼밥"];

export default function RestaurantListScreen({ navigation }: AppScreenProps<"RestaurantList">) {
  const { width } = useWindowDimensions();
  const todayCafeteria = getTodayCafeteria();
  const popularRestaurants = getPopularRestaurants();
  const popularMenus = getPopularMenus();
  const restaurantCount = getRestaurantCount();
  const crowdPicks = useMemo(() => getCrowdPicks(), []);
  const buildingCards = useMemo(() => getBuildingCards(), []);
  const { totalQuantity } = useCart();
  const { unreadCount } = useNotifications();
  const isWideLayout = width >= 980;
  const carouselCardWidth = Math.min(width - 62, 282);
  const [liveTick, setLiveTick] = useState(0);
  const [activeCategory, setActiveCategory] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const liveMotion = useRef(new Animated.Value(1)).current;
  const liveTranslateY = liveMotion.interpolate({
    inputRange: [0, 1],
    outputRange: [12, 0],
  });

  useEffect(() => {
    const refreshLiveData = () => {
      Animated.timing(liveMotion, {
        toValue: 0,
        duration: 420,
        useNativeDriver: true,
      }).start(() => {
        setLiveTick((currentTick) => currentTick + 1);
        Animated.timing(liveMotion, {
          toValue: 1,
          duration: 660,
          useNativeDriver: true,
        }).start();
      });
    };

    const timerId = setInterval(refreshLiveData, 10000);
    return () => clearInterval(timerId);
  }, [liveMotion]);

  const livePopularRestaurants = popularRestaurants.map((item, index) => ({
    ...item,
    selectedCount: item.selectedCount + ((liveTick + index * 3) % 8),
  }));
  const liveCrowdPicks = crowdPicks.map((item, index) => {
    const recentUsers = Math.max(1, item.recentUsers + ((liveTick + index * 4) % 7) - 2);
    return {
      ...item,
      recentUsers,
      status: getCrowdStatus(recentUsers),
    };
  });
  const todayImage = getRestaurantById(todayCafeteria.restaurantId)?.imageUrl ?? buildingCards[0]?.imageUrl;
  const categoryMenus = useMemo(() => getMenusByCategory(activeCategory), [activeCategory]);
  const searchResults = useMemo(() => searchCampusFood(searchQuery), [searchQuery]);
  const trimmedSearchQuery = searchQuery.trim();

  function openSearchResult(result: SearchResult) {
    if (result.type === "menu") {
      navigation.navigate("MenuDetail", { menuId: result.targetId });
      return;
    }

    navigation.navigate("RestaurantDetail", { restaurantId: result.targetId });
  }

  const infoRail = (
    <View style={[styles.infoRail, isWideLayout && styles.infoRailDesktop]}>
      <View style={styles.railHeaderRow}>
        <Text style={styles.railLabel}>캠퍼스 LIVE</Text>
        <Text style={styles.railRefresh}>10초마다 새로고침돼요</Text>
      </View>
      <Animated.View style={[styles.liveStack, { opacity: liveMotion, transform: [{ translateY: liveTranslateY }] }]}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>실시간 인기</Text>
          {livePopularRestaurants.map((item) => (
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
          <Text style={styles.infoTitle}>최근 10분 혼잡도</Text>
          {liveCrowdPicks.map((item) => (
            <Pressable
              key={item.restaurant.id}
              style={styles.crowdRow}
              onPress={() => navigation.navigate("RestaurantDetail", { restaurantId: item.restaurant.id })}
            >
              <View style={styles.crowdCopy}>
                <Text style={styles.crowdName}>{item.restaurant.name}</Text>
                <Text style={styles.crowdReason}>최근 10분 {item.recentUsers}명 이용 중</Text>
              </View>
              <Text
                style={[
                  styles.crowdPill,
                  item.status === "혼잡" && styles.crowdPillBusy,
                  item.status === "보통" && styles.crowdPillNormal,
                  item.status === "원활" && styles.crowdPillSmooth,
                ]}
              >
                {item.status}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>인기 메뉴</Text>
          {popularMenus.map((item) => (
            <Pressable
              key={item.menu.id}
              style={styles.menuRankRow}
              onPress={() => navigation.navigate("MenuDetail", { menuId: item.menu.id })}
            >
              <Text style={styles.rankNumber}>{item.rank}</Text>
              <View style={styles.menuRankCopy}>
                <Text style={styles.menuRankName} numberOfLines={1}>{item.menu.name}</Text>
                <Text style={styles.menuRankMeta} numberOfLines={1}>{item.restaurant.name}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </Animated.View>
    </View>
  );

  const restaurantSection = (
    <View style={styles.mainColumn}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>학교 식당</Text>
          <Text style={styles.sectionDescription}>건물 3곳 · 식당 {restaurantCount}곳</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={carouselCardWidth + 14}
        decelerationRate="fast"
        contentContainerStyle={styles.restaurantCarousel}
      >
        {buildingCards.map((building) => (
          <Pressable
            key={building.id}
            style={({ pressed }) => [
              styles.restaurantSlide,
              pressed && styles.restaurantSlidePressed,
              { width: carouselCardWidth },
            ]}
            onPress={() => navigation.navigate("CampusMap", { buildingId: building.id })}
          >
            <ImageBackground source={{ uri: building.imageUrl }} style={styles.slideImage} imageStyle={styles.slideImageRadius}>
              <View style={styles.slideOverlay} />
              <View style={styles.slideTop}>
                <Text style={styles.slideRank}>{building.index}</Text>
                <Text style={styles.heartBadge}>♡</Text>
              </View>
            </ImageBackground>
            <View style={styles.slideBody}>
              <Text numberOfLines={1} style={styles.slideTitle}>{building.displayName} 식당</Text>
              <Text style={styles.slideMenu} numberOfLines={1}>
                {building.menuPreview}
              </Text>
              <View style={styles.slideMetaRow}>
                <Text style={styles.slideMeta}>{building.walkText}</Text>
                <Text style={styles.slideCrowd}>{building.crowdText}</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.container, isWideLayout && styles.containerWide]}>
        <View style={styles.header}>
          <View style={styles.heroRow}>
            <View style={styles.headerCopy}>
              <Text style={styles.eyebrow}>한국공학대학교</Text>
              <Text style={styles.title}>오늘 뭐 먹지?</Text>
            </View>
            <View style={styles.headerActions}>
              <Pressable style={styles.alertButton} onPress={() => navigation.navigate("Notifications")}>
                <Text style={styles.alertIcon}>알림</Text>
                {unreadCount > 0 ? (
                  <View style={styles.alertBadge}>
                    <Text style={styles.alertBadgeText}>{unreadCount}</Text>
                  </View>
                ) : null}
              </Pressable>
              <Pressable style={styles.cartButton} onPress={() => navigation.navigate("Cart")}>
                <Text style={styles.cartText}>장바구니 {totalQuantity}</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.searchBar}>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="메뉴, 식당, 음식 이름으로 검색해보세요"
            placeholderTextColor={colors.textSoft}
            returnKeyType="search"
            style={styles.searchInput}
          />
          {trimmedSearchQuery ? (
            <Pressable hitSlop={8} onPress={() => setSearchQuery("")}>
              <Text style={styles.searchClear}>×</Text>
            </Pressable>
          ) : (
            <Text style={styles.searchIcon}>⌕</Text>
          )}
        </View>

        {trimmedSearchQuery ? (
          <View style={styles.searchPanel}>
            <View style={styles.searchPanelHeader}>
              <Text style={styles.searchPanelTitle}>검색 결과</Text>
              <Text style={styles.searchPanelCount}>{searchResults.length}개</Text>
            </View>
            {searchResults.length > 0 ? (
              searchResults.map((result) => (
                <Pressable key={result.id} style={styles.searchResultRow} onPress={() => openSearchResult(result)}>
                  <Image source={{ uri: result.imageUrl }} style={styles.searchResultImage} />
                  <View style={styles.searchResultCopy}>
                    <Text numberOfLines={1} style={styles.searchResultTitle}>{result.title}</Text>
                    <Text numberOfLines={1} style={styles.searchResultSubtitle}>{result.subtitle}</Text>
                  </View>
                  <Text style={styles.searchResultType}>{result.type === "menu" ? "메뉴" : "식당"}</Text>
                </Pressable>
              ))
            ) : (
              <View style={styles.searchEmpty}>
                <Text style={styles.searchEmptyText}>검색 결과가 없어요.</Text>
              </View>
            )}
          </View>
        ) : null}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroller}
          contentContainerStyle={styles.categoryRow}
        >
          {categoryTabs.map((tab, index) => (
            <Pressable
              key={tab}
              style={[styles.categoryChip, activeCategory === tab && styles.categoryChipActive]}
              onPress={() => setActiveCategory(tab)}
            >
              <Text numberOfLines={1} style={[styles.categoryText, activeCategory === tab && styles.categoryTextActive]}>
                {tab}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.categoryMenuPanel}>
          <View style={styles.categoryMenuHeader}>
            <View>
              <Text style={styles.categoryMenuEyebrow}>{activeCategory === "전체" ? "바로 고르기" : `${activeCategory} 메뉴`}</Text>
              <Text style={styles.categoryMenuTitle}>
                {activeCategory === "전체" ? "지금 먹기 좋은 메뉴" : `${activeCategory} 땡길 때`}
              </Text>
            </View>
            <Text style={styles.categoryMenuCount}>{categoryMenus.length}개</Text>
          </View>

          {categoryMenus.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryMenuList}>
              {categoryMenus.map((menu) => (
                <Pressable
                  key={menu.id}
                  style={({ pressed }) => [styles.categoryMenuCard, pressed && styles.categoryMenuCardPressed]}
                  onPress={() => navigation.navigate("MenuDetail", { menuId: menu.id })}
                >
                  <ImageBackground source={{ uri: menu.imageUrl }} style={styles.categoryMenuImage} imageStyle={styles.categoryMenuImageRadius}>
                    <View style={styles.categoryMenuImageDim} />
                    <Text style={styles.categoryMenuBadge}>{menu.category}</Text>
                  </ImageBackground>
                  <Text numberOfLines={1} style={styles.categoryMenuName}>{menu.name}</Text>
                  <Text numberOfLines={1} style={styles.categoryMenuRestaurant}>
                    {menu.restaurant?.name ?? "학교 식당"}
                  </Text>
                  <Text style={styles.categoryMenuPrice}>{formatPrice(menu.price)}</Text>
                </Pressable>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.categoryEmpty}>
              <Text style={styles.categoryEmptyText}>이 카테고리 메뉴를 곧 채울게요.</Text>
            </View>
          )}
        </View>

        <View style={styles.todayCard}>
          <View style={styles.todayCopy}>
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
          {todayImage ? (
            <ImageBackground source={{ uri: todayImage }} style={styles.todayImage} imageStyle={styles.todayImageRadius}>
              <View style={styles.todayImageGloss} />
            </ImageBackground>
          ) : null}
        </View>

        {isWideLayout ? (
          <View style={styles.contentLayout}>
            {restaurantSection}
            {infoRail}
          </View>
        ) : (
          <>
            {restaurantSection}
            {infoRail}
          </>
        )}
      </ScrollView>

      <View
        style={[styles.bottomDock, isWideLayout && { left: (width - 520) / 2, right: undefined, width: 520 }]}
      >
        <Pressable style={styles.dockMainAction} onPress={() => navigation.navigate("Recommendation")}>
          <View style={styles.dockIcon}>
            <Image source={require("../../assets/lunchbox-recommendation.png")} style={styles.dockImage} />
          </View>
          <View style={styles.dockCopy}>
            <Text style={styles.dockTitle}>뭐 먹을지 고민될 땐?</Text>
            <Text style={styles.dockDescription}>취향 기반 메뉴 추천</Text>
          </View>
          <Text style={styles.dockAction}>추천</Text>
        </Pressable>
        <Pressable style={styles.dockCommunityAction} onPress={() => navigation.navigate("Community")}>
          <Text style={styles.dockCommunityEyebrow}>게시판</Text>
          <Text style={styles.dockCommunityTitle}>후기 · 밥친구</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 118,
    backgroundColor: colors.background,
  },
  containerWide: {
    maxWidth: 1220,
    alignSelf: "center",
    width: "100%",
  },
  header: {
    marginBottom: 14,
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
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  eyebrow: {
    color: colors.sky,
    fontWeight: "900",
  },
  title: {
    maxWidth: 250,
    marginTop: 7,
    color: colors.text,
    fontSize: 27,
    fontWeight: "900",
    lineHeight: 34,
  },
  cartButton: {
    paddingHorizontal: 14,
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
  alertButton: {
    position: "relative",
    minWidth: 48,
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#ccebf7",
  },
  alertIcon: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: "900",
  },
  alertBadge: {
    position: "absolute",
    top: -6,
    right: -5,
    minWidth: 19,
    height: 19,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
    borderRadius: 10,
    backgroundColor: "#ff3b30",
  },
  alertBadgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "900",
    lineHeight: 13,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 999,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cdeaf7",
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    color: colors.text,
    fontSize: 13,
    fontWeight: "800",
    padding: 0,
  },
  searchIcon: {
    color: colors.primaryDark,
    fontSize: 20,
    fontWeight: "900",
  },
  searchClear: {
    width: 24,
    height: 24,
    overflow: "hidden",
    borderRadius: 12,
    backgroundColor: "#eef8fc",
    color: colors.primaryDark,
    fontSize: 20,
    fontWeight: "900",
    lineHeight: 22,
    textAlign: "center",
  },
  searchPanel: {
    marginTop: -4,
    marginBottom: 12,
    padding: 12,
    borderRadius: 22,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cdeaf7",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
  searchPanelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  searchPanelTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  searchPanelCount: {
    overflow: "hidden",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#eef8fc",
    color: colors.primaryDark,
    fontSize: 11,
    fontWeight: "900",
  },
  searchResultRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#edf3f7",
  },
  searchResultImage: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#e7eef4",
  },
  searchResultCopy: {
    flex: 1,
    minWidth: 0,
  },
  searchResultTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },
  searchResultSubtitle: {
    marginTop: 3,
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "800",
  },
  searchResultType: {
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: colors.primary,
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "900",
  },
  searchEmpty: {
    alignItems: "center",
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#edf3f7",
  },
  searchEmptyText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "800",
  },
  categoryRow: {
    alignItems: "center",
    gap: 8,
    paddingBottom: 0,
  },
  categoryScroller: {
    flexGrow: 0,
    height: 34,
    marginBottom: 10,
  },
  categoryChip: {
    height: 32,
    minWidth: 58,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 13,
    paddingVertical: 0,
    borderRadius: 999,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "900",
    lineHeight: 15,
  },
  categoryTextActive: {
    color: "#ffffff",
  },
  categoryMenuPanel: {
    marginBottom: 14,
    paddingVertical: 13,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.72)",
    borderWidth: 1,
    borderColor: "#cdeaf7",
  },
  categoryMenuHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  categoryMenuEyebrow: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "900",
  },
  categoryMenuTitle: {
    marginTop: 3,
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  categoryMenuCount: {
    overflow: "hidden",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#eef8fc",
    color: colors.primaryDark,
    fontSize: 11,
    fontWeight: "900",
  },
  categoryMenuList: {
    gap: 10,
    paddingHorizontal: 14,
  },
  categoryMenuCard: {
    width: 132,
    padding: 8,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryMenuCardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.88,
  },
  categoryMenuImage: {
    height: 88,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    overflow: "hidden",
    borderRadius: 14,
  },
  categoryMenuImageRadius: {
    borderRadius: 14,
  },
  categoryMenuImageDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(7, 26, 43, 0.12)",
  },
  categoryMenuBadge: {
    overflow: "hidden",
    margin: 7,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.88)",
    color: colors.primaryDark,
    fontSize: 10,
    fontWeight: "900",
  },
  categoryMenuName: {
    marginTop: 8,
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },
  categoryMenuRestaurant: {
    marginTop: 3,
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "800",
  },
  categoryMenuPrice: {
    marginTop: 5,
    color: colors.primary,
    fontSize: 14,
    fontWeight: "900",
  },
  categoryEmpty: {
    marginHorizontal: 14,
    paddingVertical: 18,
    alignItems: "center",
    borderRadius: 18,
    backgroundColor: "#f5fbfe",
  },
  categoryEmptyText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "800",
  },
  todayCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
    padding: 16,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  todayCopy: {
    flex: 1,
    minWidth: 0,
  },
  todayTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardEyebrow: {
    color: colors.text,
    fontSize: 16,
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
    marginTop: 13,
    color: colors.text,
    fontSize: 27,
    fontWeight: "900",
  },
  todayMenu: {
    marginTop: 7,
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20,
  },
  todayFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 14,
  },
  todayPrice: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: "900",
  },
  todayTime: {
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#eef7fb",
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "900",
  },
  todayImage: {
    width: 124,
    height: 104,
    overflow: "hidden",
    borderRadius: 24,
  },
  todayImageRadius: {
    borderRadius: 24,
  },
  todayImageGloss: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  mateBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
    padding: 14,
    borderRadius: 24,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#ccebf7",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 3,
  },
  mateIcon: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 23,
    backgroundColor: "#eaf7fc",
  },
  mateIconText: {
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: "900",
  },
  mateCopy: {
    flex: 1,
    minWidth: 0,
  },
  mateEyebrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
  },
  mateTitle: {
    marginTop: 3,
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
  },
  mateDescription: {
    marginTop: 3,
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "800",
  },
  mateAction: {
    overflow: "hidden",
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.ink,
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "900",
  },
  railHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  railRefresh: {
    color: colors.textSoft,
    fontSize: 10,
    fontWeight: "800",
  },
  liveStack: {
    gap: 12,
  },
  contentLayout: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  mainColumn: {
    flex: 1,
    minWidth: 0,
  },
  infoRail: {
    gap: 12,
    marginBottom: 16,
  },
  infoRailDesktop: {
    width: 286,
    marginBottom: 0,
  },
  railLabel: {
    color: colors.sky,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0,
  },
  infoCard: {
    padding: 14,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
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
  crowdRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 7,
  },
  crowdCopy: {
    flex: 1,
    minWidth: 0,
  },
  crowdName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },
  crowdReason: {
    marginTop: 3,
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "800",
  },
  crowdPill: {
    overflow: "hidden",
    minWidth: 44,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: "900",
    textAlign: "center",
  },
  crowdPillSmooth: {
    backgroundColor: "#e9f8ee",
    color: colors.success,
  },
  crowdPillNormal: {
    backgroundColor: "#fff6dc",
    color: "#b7791f",
  },
  crowdPillBusy: {
    backgroundColor: "#ffede5",
    color: colors.orange,
  },
  menuRankRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 5,
  },
  menuRankCopy: {
    flex: 1,
    minWidth: 0,
  },
  menuRankName: {
    color: colors.text,
    fontWeight: "900",
  },
  menuRankMeta: {
    marginTop: 2,
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "800",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900",
  },
  sectionDescription: {
    marginTop: 4,
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: "900",
  },
  restaurantCarousel: {
    gap: 14,
    paddingRight: 18,
    paddingBottom: 4,
  },
  restaurantSlide: {
    overflow: "hidden",
    borderRadius: 24,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#ccebf7",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 3,
  },
  restaurantSlidePressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
  slideImage: {
    height: 112,
    justifyContent: "space-between",
  },
  slideImageRadius: {
    borderTopLeftRadius: 23,
    borderTopRightRadius: 23,
  },
  slideOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(8, 32, 65, 0.18)",
  },
  slideTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
  },
  slideRank: {
    width: 30,
    height: 30,
    overflow: "hidden",
    borderRadius: 15,
    backgroundColor: colors.primary,
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 30,
    textAlign: "center",
  },
  heartBadge: {
    width: 30,
    height: 30,
    overflow: "hidden",
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.92)",
    color: colors.textSoft,
    fontSize: 19,
    fontWeight: "900",
    lineHeight: 30,
    textAlign: "center",
  },
  slideBody: {
    padding: 14,
  },
  slideTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 23,
  },
  slideMenu: {
    marginTop: 6,
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "800",
  },
  slideMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 11,
  },
  slideMeta: {
    overflow: "hidden",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#eef7fb",
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "900",
  },
  slideCrowd: {
    overflow: "hidden",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#e9f8ee",
    color: colors.success,
    fontSize: 11,
    fontWeight: "900",
  },
  bottomDock: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: 16,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    maxWidth: 520,
    alignSelf: "center",
    padding: 8,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    borderWidth: 1,
    borderColor: "#cdeaf7",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 8,
  },
  dockMainAction: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 4,
  },
  dockIcon: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: 25,
    backgroundColor: "#ffffff",
  },
  dockImage: {
    width: 54,
    height: 42,
    resizeMode: "contain",
  },
  dockCopy: {
    flex: 1,
    minWidth: 0,
  },
  dockTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  dockDescription: {
    marginTop: 2,
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "800",
  },
  dockAction: {
    overflow: "hidden",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.primary,
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "900",
  },
  dockCommunityAction: {
    alignSelf: "stretch",
    justifyContent: "center",
    minWidth: 96,
    maxWidth: 132,
    paddingHorizontal: 12,
    borderRadius: 22,
    backgroundColor: "#edf6fc",
    borderWidth: 1,
    borderColor: "#d5edf8",
  },
  dockCommunityEyebrow: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "900",
    lineHeight: 14,
  },
  dockCommunityTitle: {
    marginTop: 2,
    color: colors.ink,
    fontSize: 11,
    fontWeight: "900",
    lineHeight: 14,
  },
});
