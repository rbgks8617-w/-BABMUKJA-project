import React, { useEffect, useRef, useState } from "react";
import { Animated, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import RestaurantCard from "../components/RestaurantCard";
import {
  getFriendCheckins,
  getPopularRestaurants,
  getRestaurants,
  getTodayCafeteria,
  getUniversity,
} from "../services/restaurantService";
import { useCart } from "../store/CartContext";
import { useNotifications } from "../store/NotificationContext";
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
  const { width } = useWindowDimensions();
  const university = getUniversity();
  const restaurants = getRestaurants();
  const todayCafeteria = getTodayCafeteria();
  const popularRestaurants = getPopularRestaurants();
  const friendCheckins = getFriendCheckins();
  const restaurantRows = chunkPairs(restaurants);
  const { totalQuantity } = useCart();
  const { unreadCount } = useNotifications();
  const isWideLayout = width >= 900;
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

  const infoRail = (
    <View style={[styles.infoRail, isWideLayout && styles.infoRailDesktop]}>
      <View style={styles.railHeaderRow}>
        <Text style={styles.railLabel}>캠퍼스 LIVE</Text>
        <Text style={styles.railRefresh}>실시간으로 10초마다 새로고침돼요</Text>
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
          <Text style={styles.infoTitle}>지금 학생들이 가는 곳</Text>
          {liveFriendCheckins.map((item) => (
            <View key={item.restaurantId} style={styles.checkinRow}>
              <Text style={styles.checkinDot}>●</Text>
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
    </View>
  );

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.container, isWideLayout && styles.containerWide]}>
        <View style={styles.header}>
          <View style={styles.heroRow}>
            <View style={styles.headerCopy}>
              <Text style={styles.eyebrow}>{university.name}</Text>
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


        <Pressable style={styles.mateBanner} onPress={() => navigation.navigate("MealMate")}>
          <View style={styles.mateIcon}>
            <Text style={styles.mateIconText}>같</Text>
          </View>
          <View style={styles.mateCopy}>
            <Text style={styles.mateEyebrow}>혼밥이 걱정될 땐</Text>
            <Text style={styles.mateTitle}>밥 같이 먹을 사람 찾기</Text>
            <Text style={styles.mateDescription}>대화 주제와 인원수를 정해서 모집해요</Text>
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
          <Text style={styles.dockIconText}>🍱</Text>
        </View>
        <View style={styles.dockCopy}>
          <Text style={styles.dockTitle}>뭐 먹을지 고민될 땐?</Text>
          <Text style={styles.dockDescription}>취향만 고르면 오늘 메뉴 추천</Text>
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
    paddingTop: 24,
    paddingBottom: 118,
    backgroundColor: colors.background,
  },
  containerWide: {
    maxWidth: 1220,
    alignSelf: "center",
    width: "100%",
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
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
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
  alertButton: {
    position: "relative",
    minWidth: 48,
    alignItems: "center",
    paddingHorizontal: 11,
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
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
    borderRadius: 9,
    backgroundColor: colors.orange,
  },
  alertBadgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "900",
    lineHeight: 13,
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
    fontSize: 15,
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
    fontSize: 23,
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
