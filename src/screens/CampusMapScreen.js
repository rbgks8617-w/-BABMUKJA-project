import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { campusMapBuildings, getRestaurantById, getRestaurants } from "../services/restaurantService";
import { colors } from "../theme/colors";

const filters = [
  { id: "all", label: "전체" },
  { id: "open", label: "식당 있음" },
  { id: "cafe", label: "카페" },
];

export default function CampusMapScreen({ navigation }) {
  const [selectedBuildingId, setSelectedBuildingId] = useState("education");
  const [filter, setFilter] = useState("all");
  const [zoom, setZoom] = useState(1);
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
      <View style={styles.topBar}>
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

      <View style={styles.mapStage}>
        <View style={[styles.mapBoard, { transform: [{ scale: zoom }] }]}>
          <View style={styles.baseTile} />
          <View style={[styles.road, styles.roadMain]} />
          <View style={[styles.road, styles.roadCross]} />
          <View style={styles.field}>
            <View style={styles.fieldInner} />
          </View>
          <View style={styles.gate}>
            <Text style={styles.gateText}>TUK</Text>
          </View>

          {campusMapBuildings.map((building, index) => {
            const isSelected = selectedBuilding.id === building.id;
            return (
              <Pressable
                key={building.id}
                style={[
                  styles.buildingWrap,
                  building.position,
                  isSelected && styles.buildingWrapSelected,
                ]}
                onPress={() => setSelectedBuildingId(building.id)}
              >
                <View style={[styles.building, styles[`building${index}`]]}>
                  <View style={styles.buildingRoof} />
                  <View style={styles.windowGrid}>
                    <View style={styles.windowDot} />
                    <View style={styles.windowDot} />
                    <View style={styles.windowDot} />
                    <View style={styles.windowDot} />
                  </View>
                </View>
                <Text style={styles.buildingName}>{building.name}</Text>
              </Pressable>
            );
          })}

          {campusMapBuildings.map((building) => (
            <Pressable
              key={`${building.id}-bubble`}
              style={[
                styles.floatCard,
                building.position,
                selectedBuilding.id === building.id && styles.floatCardActive,
              ]}
              onPress={() => setSelectedBuildingId(building.id)}
            >
              <Text style={styles.floatTitle}>{building.name}</Text>
              {building.restaurants.slice(0, selectedBuilding.id === building.id ? 3 : 1).map((item) => (
                <View key={item.restaurantId} style={styles.floatRow}>
                  <Text style={styles.floatDot}>●</Text>
                  <Text style={styles.floatName}>{item.label}</Text>
                  <Text style={styles.floatTime}>{item.hours}</Text>
                </View>
              ))}
              <Text style={styles.floatStatus}>식당 있음</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.zoomControl}>
          <Pressable style={styles.zoomButton} onPress={() => setZoom((current) => Math.min(1.12, current + 0.06))}>
            <Text style={styles.zoomText}>＋</Text>
          </Pressable>
          <View style={styles.zoomDivider} />
          <Pressable style={styles.zoomButton} onPress={() => setZoom((current) => Math.max(0.9, current - 0.06))}>
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

      <View style={styles.bottomSheet}>
        <Text style={styles.sheetEyebrow}>선택한 건물</Text>
        <Text style={styles.sheetTitle}>{selectedBuilding.name}</Text>
        {selectedBuilding.restaurants.map((item) => {
          const restaurant = getRestaurantById(item.restaurantId);
          return (
            <Pressable key={item.restaurantId} style={styles.sheetRow} onPress={() => openRestaurantDetail(item.restaurantId)}>
              <View style={styles.sheetIcon}>
                <Text style={styles.sheetIconText}>식</Text>
              </View>
              <View style={styles.sheetCopy}>
                <Text style={styles.sheetName}>{item.label}</Text>
                <Text style={styles.sheetMeta}>{restaurant?.category ?? "식당"} · {item.hours}</Text>
              </View>
              <Text style={styles.sheetAction}>보기</Text>
            </Pressable>
          );
        })}
      </View>

      {showList ? (
        <View style={styles.listPanel}>
          <Text style={styles.listPanelTitle}>식당 목록</Text>
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
    backgroundColor: "#f3f8fc",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },
  brand: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "900",
  },
  title: {
    marginTop: 3,
    color: colors.primaryDark,
    fontSize: 23,
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
    backgroundColor: "#ffffff",
    shadowColor: "#466579",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.11,
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
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
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
    fontSize: 13,
    fontWeight: "900",
  },
  filterTextActive: {
    color: "#ffffff",
  },
  mapStage: {
    flex: 1,
    overflow: "hidden",
    borderRadius: 28,
    backgroundColor: "#edf5fa",
    borderWidth: 1,
    borderColor: "#d7e9f1",
  },
  mapBoard: {
    position: "absolute",
    left: "7%",
    top: "9%",
    width: "86%",
    height: "68%",
  },
  baseTile: {
    position: "absolute",
    left: "4%",
    top: "18%",
    width: "88%",
    height: "72%",
    borderRadius: 30,
    backgroundColor: "#e5edf0",
    borderWidth: 2,
    borderColor: "#d4e1e7",
    transform: [{ rotate: "-10deg" }, { skewX: "-15deg" }],
  },
  road: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d9e6ec",
  },
  roadMain: {
    left: "8%",
    top: "55%",
    width: "82%",
    height: 28,
    transform: [{ rotate: "-11deg" }],
  },
  roadCross: {
    left: "46%",
    top: "22%",
    width: 24,
    height: "62%",
    transform: [{ rotate: "16deg" }],
  },
  field: {
    position: "absolute",
    left: "15%",
    bottom: "2%",
    width: "25%",
    height: "25%",
    borderRadius: 18,
    backgroundColor: "#a9d975",
    borderWidth: 5,
    borderColor: "#f0b1b1",
    transform: [{ rotate: "-10deg" }, { skewX: "-12deg" }],
  },
  fieldInner: {
    flex: 1,
    margin: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.7)",
  },
  gate: {
    position: "absolute",
    right: "13%",
    bottom: "1%",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#f3a530",
    borderWidth: 3,
    borderColor: colors.primary,
    transform: [{ rotate: "-9deg" }],
  },
  gateText: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: "900",
  },
  buildingWrap: {
    position: "absolute",
    alignItems: "center",
    gap: 6,
  },
  buildingWrapSelected: {
    transform: [{ translateY: -6 }],
  },
  building: {
    width: 92,
    height: 96,
    borderRadius: 12,
    backgroundColor: "#d97558",
    borderWidth: 2,
    borderColor: "#894733",
    shadowColor: "#4b5d68",
    shadowOffset: { width: 12, height: 18 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 6,
    transform: [{ rotate: "-9deg" }, { skewY: "8deg" }],
  },
  building0: {
    height: 140,
    backgroundColor: "#df7c58",
  },
  building1: {
    width: 104,
    height: 114,
    backgroundColor: "#df8260",
  },
  building2: {
    width: 112,
    height: 92,
    backgroundColor: "#58a9c8",
  },
  buildingRoof: {
    height: 18,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    backgroundColor: "#eef7fb",
  },
  windowGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    padding: 14,
  },
  windowDot: {
    width: 20,
    height: 14,
    borderRadius: 4,
    backgroundColor: "#75d4e8",
  },
  buildingName: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    overflow: "hidden",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.92)",
    color: colors.text,
    fontSize: 11,
    fontWeight: "900",
  },
  floatCard: {
    position: "absolute",
    minWidth: 178,
    maxWidth: 240,
    padding: 13,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderWidth: 1,
    borderColor: "#d9e8ef",
    shadowColor: "#4d6070",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 6,
    transform: [{ translateY: -74 }],
  },
  floatCardActive: {
    borderColor: "#9dd9ee",
    transform: [{ translateY: -88 }],
  },
  floatTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 8,
  },
  floatRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 6,
  },
  floatDot: {
    color: colors.mint,
    fontSize: 10,
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
    top: 18,
    overflow: "hidden",
    borderRadius: 22,
    backgroundColor: "#ffffff",
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
    backgroundColor: "#ffffff",
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
    maxWidth: 280,
    padding: 15,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.94)",
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
    marginBottom: 16,
    padding: 15,
    borderRadius: 24,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d7e9f1",
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
    top: 132,
    bottom: 104,
    padding: 16,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.97)",
    borderWidth: 1,
    borderColor: "#d7e9f1",
  },
  listPanelTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: "900",
    marginBottom: 10,
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
