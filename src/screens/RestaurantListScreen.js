import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, ImageBackground, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import {
  campusMapBuildings,
  getFriendCheckins,
  getPopularRestaurants,
  getRestaurants,
  getTodayCafeteria,
} from "../services/restaurantService";
import { useCart } from "../store/CartContext";
import { useNotifications } from "../store/NotificationContext";
import { colors } from "../theme/colors";
import { formatPrice } from "../utils/formatPrice";

const categoryTabs = ["전체", "한식", "중식", "분식", "양식", "카페", "가성비", "혼밥"];
const buildingDisplayNames = {
  tip: "TIP",
  education: "종합교육관",
  industry: "산학융합관",
};

function findRestaurant(restaurants, restaurantId) {
  return restaurants.find((restaurant) => restaurant.id === restaurantId);
}

export default function RestaurantListScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const restaurants = useMemo(() => getRestaurants(), []);
  const todayCafeteria = getTodayCafeteria();
  const popularRestaurants = getPopularRestaurants();
  const friendCheckins = getFriendCheckins();
  const { totalQuantity } = useCart();
  const { unreadCount } = useNotifications();
  const isWideLayout = width >= 980;
  const carouselCardWidth = Math.min(width - 62, 282);
  const [liveTick, setLiveTick] = useState(0);
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
  const liveFriendCheckins = friendCheckins.map((item, index) => ({
    ...item,
    studentCount: Math.max(1, item.studentCount + ((liveTick + index * 2) % 5) - 1),
  }));
  const restaurantCount = campusMapBuildings.reduce((count, building) => count + building.restaurants.length, 0);
  const todayImage = restaurants[0]?.imageUrl;
  const fastPicks = [
    {
      restaurant: findRestaurant(restaurants, "tomato-gimbap"),
      wait: "대기 3분",
      reason: "김밥, 라면처럼 회전이 빨라요",
    },
    {
      restaurant: findRestaurant(restaurants, "tomato-dosirak"),
      wait: "대기 4분",
      reason: "포장해서 바로 이동하기 좋아요",
    },
    {
      restaurant: findRestaurant(restaurants, "raon-restaurant"),
      wait: "대기 6분",
      reason: "종합교육관 수업 전후 동선이 짧아요",
    },
  ].filter((item) => item.restaurant);
  const buildingCards = campusMapBuildings.map((building, index) => {
    const firstRestaurant = findRestaurant(restaurants, building.restaurants[0]?.restaurantId);

    return {
      ...building,
      index: index + 1,
      displayName: buildingDisplayNames[building.id] ?? building.name,
      imageUrl: firstRestaurant?.imageUrl,
      menuPreview: building.restaurants.map((item) => item.label).slice(0, 3).join(", "),
      firstRestaurantId: firstRestaurant?.id,
      walkText: index === 0 ? "도보 5분" : index === 1 ? "도보 3분" : "도보 7분",
      crowdText: index === 1 ? "한산 · 대기 2분" : index === 2 ? "보통 · 대기 6분" : "혼잡 · 대기 8분",
    };
  });

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
          <Text style={styles.infoTitle}>시간 없을 때</Text>
          {fastPicks.map((item) => (
            <Pressable
              key={item.restaurant.id}
              style={styles.fastRow}
              onPress={() => navigation.navigate("RestaurantDetail", { restaurantId: item.restaurant.id })}
            >
              <View style={styles.fastCopy}>
                <Text style={styles.fastName}>{item.restaurant.name}</Text>
                <Text style={styles.fastReason}>{item.reason}</Text>
              </View>
              <Text style={styles.fastWait}>{item.wait}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>지금 학생들이 가는 곳</Text>
          {liveFriendCheckins.map((item) => (
            <View key={item.restaurantId} style={styles.checkinRow}>
              <Text style={styles.checkinDot}>•</Text>
              <Text style={styles.checkinName} numberOfLines={1}>
                {item.restaurant?.name ?? "식당"}
              </Text>
              <Text style={styles.rankCount}>{item.studentCount}명</Text>
            </View>
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
        <Pressable style={styles.mapButton} onPress={() => navigation.navigate("CampusMap")}>
          <Text style={styles.mapButtonText}>지도 보기</Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={carouselCardWidth + 14}
        decelerationRate="fast"
        contentContainerStyle={styles.restaurantCarousel}
      >
        {buildingCards.map((building) => (
          <View key={building.id} style={[styles.restaurantSlide, { width: carouselCardWidth }]}>
            <ImageBackground source={{ uri: building.imageUrl }} style={styles.slideImage} imageStyle={styles.slideImageRadius}>
              <View style={styles.slideOverlay} />
              <View style={styles.slideTop}>
                <Text style={styles.slideRank}>{building.index}</Text>
                <Text style={styles.heartBadge}>♡</Text>
              </View>
              <View style={styles.slideNameBadge}>
                <Text numberOfLines={1} style={styles.slideNameBadgeText}>{building.displayName}</Text>
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
              <Pressable
                style={styles.menuButton}
                onPress={() =>
                  building.firstRestaurantId &&
                  navigation.navigate("RestaurantDetail", { restaurantId: building.firstRestaurantId })
                }
              >
                <Text style={styles.menuButtonText}>메뉴 보기</Text>
              </Pressable>
            </View>
          </View>
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
              <Text style={styles.title}>오늘 캠퍼스에서 뭐 먹지?</Text>
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
          <Text style={styles.searchPlaceholder}>메뉴, 식당, 음식 이름으로 검색해보세요</Text>
          <Text style={styles.searchIcon}>⌕</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
          {categoryTabs.map((tab, index) => (
            <Pressable key={tab} style={[styles.categoryChip, index === 0 && styles.categoryChipActive]}>
              <Text numberOfLines={1} style={[styles.categoryText, index === 0 && styles.categoryTextActive]}>{tab}</Text>
            </Pressable>
          ))}
        </ScrollView>

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

        <Pressable style={styles.mateBanner} onPress={() => navigation.navigate("Community")}>
          <View style={styles.mateIcon}>
            <Text style={styles.mateIconText}>밥</Text>
          </View>
          <View style={styles.mateCopy}>
            <Text style={styles.mateEyebrow}>혼밥이 걱정될 땐?</Text>
            <Text style={styles.mateTitle}>나랑 밥먹자 게시판 열기</Text>
            <Text style={styles.mateDescription}>음식 후기, 자유게시판, 익명 밥 약속까지 한 번에 봐요</Text>
          </View>
          <Text style={styles.mateAction}>열기</Text>
        </Pressable>

        {isWideLayout ? (
          <View style={styles.contentLayout}>
            {restaurantSection}
            {infoRail}
          </View>
        ) : (
          <>
            {infoRail}
            {restaurantSection}
          </>
        )}
      </ScrollView>

      <Pressable
        style={[styles.bottomDock, isWideLayout && { left: (width - 520) / 2, right: undefined, width: 520 }]}
        onPress={() => navigation.navigate("Recommendation")}
      >
        <View style={styles.dockIcon}>
          <Text style={styles.dockIconText}>?</Text>
        </View>
        <View style={styles.dockCopy}>
          <Text style={styles.dockTitle}>뭐 먹을지 고민될 땐?</Text>
          <Text style={styles.dockDescription}>취향 기반으로 오늘 메뉴 추천</Text>
        </View>
        <Text style={styles.dockAction}>추천</Text>
      </Pressable>
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
  searchPlaceholder: {
    flex: 1,
    color: colors.textSoft,
    fontSize: 13,
    fontWeight: "800",
  },
  searchIcon: {
    color: colors.primaryDark,
    fontSize: 20,
    fontWeight: "900",
  },
  categoryRow: {
    gap: 8,
    paddingBottom: 10,
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
  fastRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 7,
  },
  fastCopy: {
    flex: 1,
    minWidth: 0,
  },
  fastName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },
  fastReason: {
    marginTop: 3,
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "800",
  },
  fastWait: {
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#e9f8ee",
    color: colors.success,
    fontSize: 11,
    fontWeight: "900",
  },
  checkinRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 5,
  },
  checkinDot: {
    color: colors.mint,
    fontSize: 15,
  },
  checkinName: {
    flex: 1,
    color: colors.text,
    fontWeight: "900",
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
  mapButton: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#ccebf7",
  },
  mapButtonText: {
    color: colors.primaryDark,
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
  slideNameBadge: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 10,
    alignSelf: "flex-start",
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.94)",
  },
  slideNameBadgeText: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 17,
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
  menuButton: {
    alignItems: "center",
    marginTop: 13,
    paddingVertical: 11,
    borderRadius: 16,
    backgroundColor: "#edf6fc",
  },
  menuButtonText: {
    color: colors.primary,
    fontSize: 13,
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
    gap: 12,
    maxWidth: 520,
    alignSelf: "center",
    padding: 12,
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
  dockIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 21,
    backgroundColor: colors.surfaceWarm,
  },
  dockIconText: {
    color: colors.primary,
    fontSize: 23,
    fontWeight: "900",
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
});
