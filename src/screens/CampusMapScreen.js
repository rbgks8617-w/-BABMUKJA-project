import React, { useMemo, useState } from "react";
import {
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { campusMapBuildings, getRestaurantById, getRestaurants } from "../services/restaurantService";
import { colors } from "../theme/colors";

const campusMapImage = require("../../assets/tuk-campus-map.png");
const tukSymbol = require("../../assets/tuk-symbol.png");
const mapAspectRatio = 1608 / 978;

const filters = [
  { id: "open", label: "식당 있음" },
];

const cardAnchors = {
  tip: { left: "12%", top: "23%", width: 158 },
  education: { left: "40%", top: "14%", width: 172 },
  industry: { right: "9%", top: "29%", width: 164 },
};

const buildingTouchAreas = {
  tip: { left: "6%", top: "27%", width: "29%", height: "35%" },
  education: { left: "38%", top: "20%", width: "25%", height: "30%" },
  industry: { right: "8%", top: "31%", width: "25%", height: "28%" },
};

export default function CampusMapScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const [selectedBuildingId, setSelectedBuildingId] = useState("education");
  const [filter, setFilter] = useState("open");
  const [showList, setShowList] = useState(false);
  const [zoom, setZoom] = useState(1);

  const selectedBuilding = campusMapBuildings.find((building) => building.id === selectedBuildingId) ?? campusMapBuildings[0];
  const restaurants = getRestaurants();
  const isCompact = width < 620;
  const mapWidth = Math.min(Math.max(width - 20, 360), 1180);

  const visibleRestaurants = useMemo(() => {
    return restaurants.filter((restaurant) => restaurant.isOpen);
  }, [restaurants]);

  const openRestaurantDetail = (restaurantId) => {
    navigation.navigate("RestaurantDetail", { restaurantId });
  };

  const selectBuilding = (buildingId) => {
    setSelectedBuildingId(buildingId);
    setShowList(false);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.mapStage}>
        <View style={[styles.mapCanvas, { width: mapWidth, aspectRatio: mapAspectRatio, transform: [{ scale: zoom }] }]}>
          <ImageBackground source={campusMapImage} resizeMode="contain" style={styles.mapImage}>
            <View style={styles.topHeader}>
              <View style={styles.brandRow}>
                <Image source={tukSymbol} style={styles.logo} />
                <View>
                  <Text style={styles.brandName}>한국공학대학교</Text>
                  <Text style={styles.mapTitle}>식당 안내 지도</Text>
                </View>
              </View>
              <Pressable style={styles.searchBox} onPress={() => setShowList(true)}>
                <Text style={styles.searchIcon}>⌕</Text>
                <Text style={styles.searchText}>건물 또는 식당 검색</Text>
              </Pressable>
            </View>

            <View style={styles.filterCard}>
              {filters.map((item) => (
                <Pressable
                  key={item.id}
                  style={[styles.filterItem, filter === item.id && styles.filterItemActive]}
                  onPress={() => setFilter(item.id)}
                >
                  <View style={styles.filterIcon}>
                    <Text style={styles.filterIconText}>식</Text>
                  </View>
                  <Text style={styles.filterLabel}>{item.label}</Text>
                </Pressable>
              ))}
            </View>

            {campusMapBuildings.map((building) => (
              <Pressable
                key={`${building.id}-touch`}
                style={[styles.touchArea, buildingTouchAreas[building.id]]}
                onPress={() => selectBuilding(building.id)}
              />
            ))}

            {campusMapBuildings.map((building) => {
              const isSelected = selectedBuilding.id === building.id;
              const visibleItems = building.restaurants.slice(0, isCompact ? 1 : Math.min(3, building.restaurants.length));
              const anchor = cardAnchors[building.id];

              return (
                <View
                  key={building.id}
                  pointerEvents="box-none"
                  style={[
                    styles.infoBubbleWrap,
                    anchor,
                    {
                      width: isCompact ? 132 : anchor.width,
                    },
                  ]}
                >
                  <Pressable
                    style={[styles.infoBubble, isSelected && styles.infoBubbleSelected]}
                    onPress={() => selectBuilding(building.id)}
                  >
                    <View style={styles.infoTitleRow}>
                      <View style={styles.restaurantIcon}>
                        <Text style={styles.restaurantIconText}>식</Text>
                      </View>
                      <Text style={styles.infoTitle} numberOfLines={1}>
                        {building.name}
                      </Text>
                    </View>
                    {visibleItems.map((item) => (
                      <Pressable
                        key={item.restaurantId}
                        style={styles.infoRow}
                        onPress={() => openRestaurantDetail(item.restaurantId)}
                      >
                        <Text style={styles.infoBullet}>·</Text>
                        <Text style={styles.infoName} numberOfLines={1}>
                          {item.label}
                        </Text>
                        {!isCompact ? <Text style={styles.infoTime}>{item.hours}</Text> : null}
                      </Pressable>
                    ))}
                    <View style={styles.statusRow}>
                      <View style={styles.statusIcon}>
                        <Text style={styles.statusIconText}>식</Text>
                      </View>
                      <Text style={styles.statusText}>식당 있음</Text>
                    </View>
                  </Pressable>
                </View>
              );
            })}

            <View style={styles.zoomControl}>
              <Pressable style={styles.zoomButton} onPress={() => setZoom((current) => Math.min(1.1, current + 0.04))}>
                <Text style={styles.zoomText}>＋</Text>
              </Pressable>
              <View style={styles.zoomDivider} />
              <Pressable style={styles.zoomButton} onPress={() => setZoom((current) => Math.max(0.92, current - 0.04))}>
                <Text style={styles.zoomText}>－</Text>
              </Pressable>
            </View>

            <Pressable style={styles.listButton} onPress={() => setShowList(true)}>
              <Text style={styles.listIcon}>☰</Text>
              <Text style={styles.listButtonText}>목록 보기</Text>
            </Pressable>

            <View style={styles.helpCard}>
              <Text style={styles.helpIcon}>!</Text>
              <Text style={styles.helpText}>건물을 클릭하면 식당 정보를 확인할 수 있어요.</Text>
            </View>
          </ImageBackground>
        </View>
      </View>

      {selectedBuilding ? (
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
      ) : null}

      {showList ? (
        <View style={styles.listPanel}>
          <View style={styles.listPanelTop}>
            <Text style={styles.listTitle}>식당 목록</Text>
            <Pressable style={styles.closeButton} onPress={() => setShowList(false)}>
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
    padding: 8,
  },
  mapStage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: 26,
    backgroundColor: "#f7fbfe",
    borderWidth: 1,
    borderColor: "#dcebf2",
  },
  mapCanvas: {
    maxHeight: "100%",
  },
  mapImage: {
    width: "100%",
    height: "100%",
  },
  topHeader: {
    position: "absolute",
    left: "2%",
    right: "2%",
    top: "2%",
    zIndex: 3,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logo: {
    width: 38,
    height: 38,
    resizeMode: "contain",
  },
  brandName: {
    color: colors.primary,
    fontSize: 19,
    fontWeight: "900",
    lineHeight: 23,
  },
  mapTitle: {
    marginTop: 2,
    color: colors.primaryDark,
    fontSize: 15,
    fontWeight: "900",
  },
  searchBox: {
    width: "30%",
    minWidth: 190,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingHorizontal: 17,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.95)",
    shadowColor: "#4d6070",
    shadowOffset: { width: 0, height: 9 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 6,
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
  filterCard: {
    position: "absolute",
    left: "2%",
    top: "12%",
    zIndex: 3,
    flexDirection: "row",
    gap: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.96)",
    shadowColor: "#4d6070",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.13,
    shadowRadius: 16,
    elevation: 5,
  },
  filterItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    opacity: 0.72,
  },
  filterItemActive: {
    opacity: 1,
  },
  filterIcon: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#2ea455",
  },
  filterIconText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "900",
  },
  filterLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
  },
  touchArea: {
    position: "absolute",
    borderRadius: 16,
  },
  infoBubbleWrap: {
    position: "absolute",
    zIndex: 4,
  },
  infoBubble: {
    padding: 9,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.96)",
    shadowColor: "#4d6070",
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.14,
    shadowRadius: 13,
    elevation: 5,
  },
  infoBubbleSelected: {
    borderWidth: 1,
    borderColor: "#9bd9ed",
  },
  infoTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 5,
  },
  restaurantIcon: {
    width: 21,
    height: 21,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
    backgroundColor: "#2ea455",
  },
  restaurantIconText: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "900",
  },
  infoTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 12,
    fontWeight: "900",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 1,
  },
  infoBullet: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "900",
  },
  infoName: {
    flex: 1,
    color: colors.text,
    fontSize: 10,
    fontWeight: "900",
  },
  infoTime: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: "800",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 5,
  },
  statusIcon: {
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
    backgroundColor: "#2ea455",
  },
  statusIconText: {
    color: "#ffffff",
    fontSize: 8,
    fontWeight: "900",
  },
  statusText: {
    color: "#2a9a50",
    fontSize: 10,
    fontWeight: "900",
  },
  zoomControl: {
    position: "absolute",
    right: "2%",
    top: "10%",
    zIndex: 5,
    overflow: "hidden",
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.96)",
    shadowColor: "#4d6070",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 6,
  },
  zoomButton: {
    width: 44,
    height: 44,
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
    backgroundColor: "#e4edf3",
  },
  listButton: {
    position: "absolute",
    left: "2%",
    bottom: "5%",
    zIndex: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.96)",
    shadowColor: "#4d6070",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 6,
  },
  listIcon: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: "900",
  },
  listButtonText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "900",
  },
  helpCard: {
    position: "absolute",
    right: "2%",
    bottom: "5%",
    zIndex: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    maxWidth: 260,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.96)",
    shadowColor: "#4d6070",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 6,
  },
  helpIcon: {
    width: 32,
    height: 32,
    overflow: "hidden",
    borderRadius: 16,
    backgroundColor: "#fff2d3",
    color: "#e89b22",
    fontSize: 20,
    fontWeight: "900",
    lineHeight: 32,
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
    marginTop: 9,
    padding: 13,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d7e9f1",
  },
  sheetTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 6,
  },
  sheetEyebrow: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "900",
  },
  sheetTitle: {
    marginTop: 3,
    color: colors.text,
    fontSize: 18,
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
    gap: 9,
    paddingVertical: 7,
  },
  sheetIcon: {
    width: 31,
    height: 31,
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
    left: 14,
    right: 14,
    top: 82,
    bottom: 14,
    zIndex: 10,
    padding: 14,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.98)",
    borderWidth: 1,
    borderColor: "#d7e9f1",
  },
  listPanelTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 10,
  },
  listTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
  },
  closeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#eaf7fc",
  },
  closeText: {
    color: colors.primaryDark,
    fontSize: 12,
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
  emptyBox: {
    alignItems: "center",
    paddingVertical: 34,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
  },
  emptyText: {
    marginTop: 7,
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center",
  },
});
