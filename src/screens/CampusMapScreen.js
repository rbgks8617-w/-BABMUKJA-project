import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Image, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { campusMapBuildings, getRestaurantById, getRestaurants } from "../services/restaurantService";
import { colors } from "../theme/colors";

const campusMapImage = require("../../assets/tuk-campus-map.png");
const mapAspectRatio = 1536 / 1190;

const filters = [
  { id: "all", label: "전체" },
  { id: "open", label: "식당 있음" },
  { id: "cafe", label: "카페" },
];

const cardAnchors = {
  tip: { left: "18%", top: "24%", width: 190 },
  education: { left: "39%", top: "15%", width: 220 },
  industry: { right: "7%", top: "28%", width: 205 },
};

const touchAreas = {
  tip: { left: "8%", top: "30%", width: "31%", height: "32%" },
  education: { left: "37%", top: "22%", width: "25%", height: "29%" },
  industry: { right: "8%", top: "35%", width: "24%", height: "24%" },
};

export default function CampusMapScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const [selectedBuildingId, setSelectedBuildingId] = useState("education");
  const [filter, setFilter] = useState("all");
  const [showList, setShowList] = useState(false);
  const floatMotion = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatMotion, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(floatMotion, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [floatMotion]);

  const selectedBuilding = campusMapBuildings.find((building) => building.id === selectedBuildingId) ?? campusMapBuildings[0];
  const restaurants = getRestaurants();
  const visibleRestaurants = useMemo(() => {
    if (filter === "cafe") {
      return restaurants.filter((restaurant) => restaurant.category?.includes("카페"));
    }

    return restaurants;
  }, [filter, restaurants]);

  const mapWidth = Math.min(width - 24, 980);
  const isCompact = width < 620;

  const openRestaurantDetail = (restaurantId) => {
    navigation.navigate("RestaurantDetail", { restaurantId });
  };

  const getFloatStyle = (buildingId, index) => {
    const lift = floatMotion.interpolate({
      inputRange: [0, 1],
      outputRange: index % 2 === 0 ? [-4, -13] : [-10, -2],
    });

    return [
      styles.floatCardWrap,
      cardAnchors[buildingId],
      isCompact && styles.floatCardWrapCompact,
      {
        width: isCompact ? 158 : cardAnchors[buildingId].width,
        transform: [{ translateY: lift }],
      },
    ];
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>한국공학대학교</Text>
          <Text style={styles.title}>식당 안내 지도</Text>
        </View>
        <Pressable style={styles.searchPill}>
          <Text style={styles.searchIcon}>⌕</Text>
          <Text style={styles.searchText}>건물 또는 식당 검색</Text>
        </Pressable>
      </View>

      <View style={styles.filterRow}>
        {filters.map((item) => (
          <Pressable
            key={item.id}
            style={[styles.filterChip, filter === item.id && styles.filterChipActive]}
            onPress={() => setFilter(item.id)}
          >
            <Text style={[styles.filterText, filter === item.id && styles.filterTextActive]}>{item.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.mapShell}>
        <View style={[styles.mapCanvas, { width: mapWidth, aspectRatio: mapAspectRatio }]}>
          <Image source={campusMapImage} resizeMode="contain" style={styles.mapImage} />

          {campusMapBuildings.map((building) => (
            <Pressable
              key={`${building.id}-touch`}
              style={[styles.touchArea, touchAreas[building.id]]}
              onPress={() => setSelectedBuildingId(building.id)}
            />
          ))}

          {campusMapBuildings.map((building, index) => {
            const isSelected = selectedBuilding.id === building.id;
            return (
              <Animated.View key={building.id} style={getFloatStyle(building.id, index)} pointerEvents="box-none">
                <Pressable
                  style={[styles.floatCard, isSelected && styles.floatCardActive]}
                  onPress={() => setSelectedBuildingId(building.id)}
                >
                  <View style={styles.floatTitleRow}>
                    <View style={styles.floatIcon}>
                      <Text style={styles.floatIconText}>식</Text>
                    </View>
                    <Text style={styles.floatTitle} numberOfLines={1}>
                      {building.name}
                    </Text>
                  </View>
                  {building.restaurants.slice(0, isCompact ? 2 : isSelected ? 3 : 2).map((item) => (
                    <View key={item.restaurantId} style={styles.floatRow}>
                      <Text style={styles.floatBullet}>·</Text>
                      <Text style={styles.floatName} numberOfLines={1}>
                        {item.label}
                      </Text>
                      {!isCompact ? <Text style={styles.floatTime}>{item.hours}</Text> : null}
                    </View>
                  ))}
                  <Text style={styles.floatStatus}>식당 있음</Text>
                </Pressable>
              </Animated.View>
            );
          })}

          <View style={styles.zoomControl}>
            <Pressable style={styles.zoomButton}>
              <Text style={styles.zoomText}>＋</Text>
            </Pressable>
            <View style={styles.zoomDivider} />
            <Pressable style={styles.zoomButton}>
              <Text style={styles.zoomText}>－</Text>
            </Pressable>
          </View>

          <Pressable style={styles.listButton} onPress={() => setShowList((current) => !current)}>
            <Text style={styles.listIcon}>☰</Text>
            <Text style={styles.listText}>{showList ? "지도 보기" : "목록 보기"}</Text>
          </Pressable>

          <View style={styles.helpCard}>
            <Text style={styles.helpIcon}>!</Text>
            <Text style={styles.helpText}>건물을 누르면 식당 정보를 볼 수 있어요.</Text>
          </View>
        </View>
      </View>

      <View style={styles.bottomSheet}>
        <View style={styles.sheetTop}>
          <View>
            <Text style={styles.sheetEyebrow}>선택한 건물</Text>
            <Text style={styles.sheetTitle}>{selectedBuilding.name}</Text>
          </View>
          <Text style={styles.sheetCount}>{selectedBuilding.restaurants.length}곳</Text>
        </View>
        {selectedBuilding.restaurants.map((item) => {
          const restaurant = getRestaurantById(item.restaurantId);
          return (
            <Pressable key={item.restaurantId} style={styles.sheetRow} onPress={() => openRestaurantDetail(item.restaurantId)}>
              <View style={styles.sheetIcon}>
                <Text style={styles.sheetIconText}>식</Text>
              </View>
              <View style={styles.sheetCopy}>
                <Text style={styles.sheetName}>{item.label}</Text>
                <Text style={styles.sheetMeta}>
                  {restaurant?.category ?? "식당"} · {item.hours}
                </Text>
              </View>
              <Text style={styles.sheetAction}>보기</Text>
            </Pressable>
          );
        })}
      </View>

      {showList ? (
        <View style={styles.listPanel}>
          <View style={styles.listPanelTop}>
            <Text style={styles.listPanelTitle}>식당 목록</Text>
            <Pressable onPress={() => setShowList(false)}>
              <Text style={styles.closeText}>닫기</Text>
            </Pressable>
          </View>
          <ScrollView style={styles.listScroll}>
            {visibleRestaurants.map((restaurant) => (
              <Pressable key={restaurant.id} style={styles.listRestaurant} onPress={() => openRestaurantDetail(restaurant.id)}>
                <Text style={styles.listRestaurantName}>{restaurant.name}</Text>
                <Text style={styles.listRestaurantMeta}>{restaurant.location}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#eef5f9",
    paddingHorizontal: 12,
    paddingTop: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 10,
  },
  brand: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
  },
  title: {
    marginTop: 2,
    color: colors.primaryDark,
    fontSize: 20,
    fontWeight: "900",
  },
  searchPill: {
    flex: 1,
    maxWidth: 380,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.96)",
    shadowColor: "#466579",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  searchIcon: {
    color: colors.ink,
    fontSize: 19,
    fontWeight: "900",
  },
  searchText: {
    color: colors.textSoft,
    fontSize: 12,
    fontWeight: "800",
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  filterChip: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d7e9f1",
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "900",
  },
  filterTextActive: {
    color: "#ffffff",
  },
  mapShell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 330,
    overflow: "hidden",
    borderRadius: 28,
    backgroundColor: "#f8fbfd",
    borderWidth: 1,
    borderColor: "#d7e9f1",
  },
  mapCanvas: {
    position: "relative",
    maxHeight: "100%",
  },
  mapImage: {
    width: "100%",
    height: "100%",
  },
  touchArea: {
    position: "absolute",
    borderRadius: 22,
  },
  floatCardWrap: {
    position: "absolute",
  },
  floatCardWrapCompact: {
    transform: [{ scale: 0.92 }],
  },
  floatCard: {
    padding: 11,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderWidth: 1,
    borderColor: "#d9e8ef",
    shadowColor: "#4d6070",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.17,
    shadowRadius: 20,
    elevation: 7,
  },
  floatCardActive: {
    borderColor: "#8bd4eb",
    shadowOpacity: 0.23,
  },
  floatTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 7,
  },
  floatIcon: {
    width: 25,
    height: 25,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    backgroundColor: "#e9f8ee",
  },
  floatIconText: {
    color: colors.mint,
    fontSize: 11,
    fontWeight: "900",
  },
  floatTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },
  floatRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 5,
  },
  floatBullet: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "900",
    lineHeight: 16,
  },
  floatName: {
    flex: 1,
    color: colors.text,
    fontSize: 11,
    fontWeight: "900",
  },
  floatTime: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "800",
  },
  floatStatus: {
    marginTop: 2,
    color: colors.mint,
    fontSize: 11,
    fontWeight: "900",
  },
  zoomControl: {
    position: "absolute",
    right: 12,
    top: 12,
    overflow: "hidden",
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.94)",
    shadowColor: "#4d6070",
    shadowOffset: { width: 0, height: 9 },
    shadowOpacity: 0.13,
    shadowRadius: 15,
    elevation: 5,
  },
  zoomButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  zoomText: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: "900",
  },
  zoomDivider: {
    height: 1,
    backgroundColor: "#e6eef3",
  },
  listButton: {
    position: "absolute",
    left: 12,
    bottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.96)",
    shadowColor: "#4d6070",
    shadowOffset: { width: 0, height: 9 },
    shadowOpacity: 0.13,
    shadowRadius: 15,
    elevation: 5,
  },
  listIcon: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "900",
  },
  listText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "900",
  },
  helpCard: {
    position: "absolute",
    right: 12,
    bottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    maxWidth: 235,
    padding: 12,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.96)",
    shadowColor: "#4d6070",
    shadowOffset: { width: 0, height: 9 },
    shadowOpacity: 0.13,
    shadowRadius: 15,
    elevation: 5,
  },
  helpIcon: {
    width: 30,
    height: 30,
    overflow: "hidden",
    borderRadius: 15,
    backgroundColor: "#fff3d8",
    color: "#e89b22",
    fontSize: 19,
    fontWeight: "900",
    lineHeight: 30,
    textAlign: "center",
  },
  helpText: {
    flex: 1,
    color: colors.text,
    fontSize: 12,
    fontWeight: "900",
    lineHeight: 17,
  },
  bottomSheet: {
    marginTop: 10,
    marginBottom: 12,
    padding: 14,
    borderRadius: 22,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d7e9f1",
  },
  sheetTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  sheetEyebrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
  },
  sheetTitle: {
    marginTop: 4,
    marginBottom: 8,
    color: colors.text,
    fontSize: 19,
    fontWeight: "900",
  },
  sheetCount: {
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#eaf7fc",
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: "900",
  },
  sheetRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
  },
  sheetIcon: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: "#e9f8ee",
  },
  sheetIconText: {
    color: colors.mint,
    fontSize: 11,
    fontWeight: "900",
  },
  sheetCopy: {
    flex: 1,
    minWidth: 0,
  },
  sheetName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },
  sheetMeta: {
    marginTop: 3,
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "800",
  },
  sheetAction: {
    overflow: "hidden",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: colors.primary,
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "900",
  },
  listPanel: {
    position: "absolute",
    left: 18,
    right: 18,
    top: 116,
    bottom: 126,
    padding: 15,
    borderRadius: 23,
    backgroundColor: "rgba(255,255,255,0.98)",
    borderWidth: 1,
    borderColor: "#d7e9f1",
  },
  listPanelTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  listPanelTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
  },
  closeText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "900",
  },
  listScroll: {
    flex: 1,
  },
  listRestaurant: {
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: "#edf3f7",
  },
  listRestaurantName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  listRestaurantMeta: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "800",
  },
});
