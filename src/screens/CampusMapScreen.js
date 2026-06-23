import React, { useMemo, useState } from "react";
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { campusMapBuildings, getRestaurantById, getRestaurants } from "../services/restaurantService";
import { colors } from "../theme/colors";

const filters = [
  { id: "all", label: "전체" },
  { id: "open", label: "식당 있음" },
  { id: "cafe", label: "카페" },
];

const buildingCardPositions = {
  tip: { left: "19%", top: "24%" },
  education: { left: "39%", top: "16%" },
  industry: { right: "8%", top: "31%" },
};

const buildingHotspots = {
  tip: { left: "9%", top: "29%", width: "30%", height: "36%" },
  education: { left: "38%", top: "21%", width: "25%", height: "31%" },
  industry: { right: "9%", top: "34%", width: "23%", height: "26%" },
};

export default function CampusMapScreen({ navigation }) {
  const [selectedBuildingId, setSelectedBuildingId] = useState("education");
  const [filter, setFilter] = useState("all");
  const [showList, setShowList] = useState(false);

  const selectedBuilding = campusMapBuildings.find((building) => building.id === selectedBuildingId) ?? campusMapBuildings[0];
  const restaurants = getRestaurants();
  const visibleRestaurants = useMemo(() => {
    if (filter === "cafe") {
      return restaurants.filter((restaurant) => restaurant.category?.includes("카페"));
    }

    return restaurants;
  }, [filter, restaurants]);

  const openRestaurantDetail = (restaurantId) => {
    navigation.navigate("RestaurantDetail", { restaurantId });
  };

  return (
    <View style={styles.screen}>
      <ImageBackground
        source={require("../../assets/tuk-campus-map.png")}
        resizeMode="cover"
        style={styles.mapImage}
        imageStyle={styles.mapImageRadius}
      >
        <View style={styles.glassLayer}>
          <View style={styles.topBar}>
            <View style={styles.titleBlock}>
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

          {campusMapBuildings.map((building) => (
            <Pressable
              key={`${building.id}-hotspot`}
              style={[styles.hotspot, buildingHotspots[building.id]]}
              onPress={() => setSelectedBuildingId(building.id)}
            />
          ))}

          {campusMapBuildings.map((building) => {
            const isSelected = selectedBuilding.id === building.id;
            return (
              <Pressable
                key={building.id}
                style={[
                  styles.floatCard,
                  buildingCardPositions[building.id],
                  isSelected && styles.floatCardActive,
                ]}
                onPress={() => setSelectedBuildingId(building.id)}
              >
                <View style={styles.floatTitleRow}>
                  <View style={styles.floatIcon}>
                    <Text style={styles.floatIconText}>식</Text>
                  </View>
                  <Text style={styles.floatTitle}>{building.name}</Text>
                </View>
                {building.restaurants.slice(0, isSelected ? 3 : 1).map((item) => (
                  <View key={item.restaurantId} style={styles.floatRow}>
                    <Text style={styles.floatBullet}>·</Text>
                    <Text style={styles.floatName}>{item.label}</Text>
                    <Text style={styles.floatTime}>{item.hours}</Text>
                  </View>
                ))}
                <Text style={styles.floatStatus}>식당 있음</Text>
              </Pressable>
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
            <Text style={styles.helpText}>건물을 누르면 식당 정보를 확인할 수 있어요.</Text>
          </View>
        </View>
      </ImageBackground>

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
    padding: 14,
  },
  mapImage: {
    flex: 1,
    minHeight: 470,
    overflow: "hidden",
    borderRadius: 28,
    backgroundColor: "#f3f8fb",
    borderWidth: 1,
    borderColor: "#d7e9f1",
  },
  mapImageRadius: {
    borderRadius: 28,
  },
  glassLayer: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  titleBlock: {
    paddingHorizontal: 4,
  },
  brand: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "900",
  },
  title: {
    marginTop: 3,
    color: colors.primaryDark,
    fontSize: 22,
    fontWeight: "900",
  },
  searchPill: {
    flex: 1,
    maxWidth: 390,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 15,
    paddingVertical: 13,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.94)",
    shadowColor: "#466579",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.13,
    shadowRadius: 18,
    elevation: 5,
  },
  searchIcon: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: "900",
  },
  searchText: {
    color: colors.textSoft,
    fontSize: 13,
    fontWeight: "800",
  },
  filterRow: {
    position: "absolute",
    left: 18,
    top: 88,
    flexDirection: "row",
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.94)",
    borderWidth: 1,
    borderColor: "#d7e9f1",
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
  hotspot: {
    position: "absolute",
    borderRadius: 22,
  },
  floatCard: {
    position: "absolute",
    minWidth: 185,
    maxWidth: 250,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderWidth: 1,
    borderColor: "#d9e8ef",
    shadowColor: "#4d6070",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.17,
    shadowRadius: 20,
    elevation: 7,
    transform: [{ translateY: -4 }],
  },
  floatCardActive: {
    borderColor: "#9dd9ee",
    transform: [{ translateY: -12 }],
  },
  floatTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  floatIcon: {
    width: 27,
    height: 27,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#e9f8ee",
  },
  floatIconText: {
    color: colors.mint,
    fontSize: 12,
    fontWeight: "900",
  },
  floatTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  floatRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 6,
  },
  floatBullet: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 18,
  },
  floatName: {
    flex: 1,
    color: colors.text,
    fontSize: 12,
    fontWeight: "900",
  },
  floatTime: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "800",
  },
  floatStatus: {
    marginTop: 3,
    color: colors.mint,
    fontSize: 12,
    fontWeight: "900",
  },
  zoomControl: {
    position: "absolute",
    right: 18,
    top: 88,
    overflow: "hidden",
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.94)",
    shadowColor: "#4d6070",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 5,
  },
  zoomButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  zoomText: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: "900",
  },
  zoomDivider: {
    height: 1,
    backgroundColor: "#e6eef3",
  },
  listButton: {
    position: "absolute",
    left: 18,
    bottom: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.96)",
    shadowColor: "#4d6070",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 5,
  },
  listIcon: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900",
  },
  listText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
  },
  helpCard: {
    position: "absolute",
    right: 18,
    bottom: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    maxWidth: 285,
    padding: 15,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.96)",
    shadowColor: "#4d6070",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 5,
  },
  helpIcon: {
    width: 34,
    height: 34,
    overflow: "hidden",
    borderRadius: 17,
    backgroundColor: "#fff3d8",
    color: "#e89b22",
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 34,
    textAlign: "center",
  },
  helpText: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
    lineHeight: 19,
  },
  bottomSheet: {
    marginTop: 12,
    padding: 15,
    borderRadius: 24,
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
    marginBottom: 10,
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
  },
  sheetCount: {
    overflow: "hidden",
    paddingHorizontal: 11,
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
    paddingVertical: 9,
  },
  sheetIcon: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
    backgroundColor: "#e9f8ee",
  },
  sheetIconText: {
    color: colors.mint,
    fontSize: 12,
    fontWeight: "900",
  },
  sheetCopy: {
    flex: 1,
    minWidth: 0,
  },
  sheetName: {
    color: colors.text,
    fontSize: 15,
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
    top: 138,
    bottom: 122,
    padding: 16,
    borderRadius: 24,
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
    fontSize: 19,
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
    paddingVertical: 12,
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
