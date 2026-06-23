import React, { useMemo, useState } from "react";
import {
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
const mapAspectRatio = 1608 / 978;

const cardAnchors = {
  tip: { left: "15%", top: "30%", width: 76 },
  education: { left: "43%", top: "23%", width: 104 },
  industry: { right: "15%", top: "31%", width: 100 },
};

const buildingTouchAreas = {
  tip: { left: "6%", top: "27%", width: "29%", height: "35%" },
  education: { left: "38%", top: "20%", width: "25%", height: "30%" },
  industry: { right: "8%", top: "31%", width: "25%", height: "28%" },
};

export default function CampusMapScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const [selectedBuildingId, setSelectedBuildingId] = useState("education");
  const [showList, setShowList] = useState(false);
  const [zoom, setZoom] = useState(1);

  const selectedBuilding = campusMapBuildings.find((building) => building.id === selectedBuildingId) ?? campusMapBuildings[0];
  const restaurants = getRestaurants();
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
            {campusMapBuildings.map((building) => (
              <Pressable
                key={`${building.id}-touch`}
                style={[styles.touchArea, buildingTouchAreas[building.id]]}
                onPress={() => selectBuilding(building.id)}
              />
            ))}

            {campusMapBuildings.map((building) => {
              const isSelected = selectedBuilding.id === building.id;
              const anchor = cardAnchors[building.id];

              return (
                <View
                  key={building.id}
                  pointerEvents="box-none"
                  style={[
                    styles.infoBubbleWrap,
                    anchor,
                    {
                      width: anchor.width,
                    },
                  ]}
                >
                  <Pressable
                    style={[styles.infoBubble, isSelected && styles.infoBubbleSelected]}
                    onPress={() => selectBuilding(building.id)}
                  >
                    <View style={styles.infoTitleRow}>
                      <Text style={styles.infoTitle} numberOfLines={1}>
                        {building.name}
                      </Text>
                      <Text style={styles.infoCount}>{building.restaurants.length}</Text>
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
          </ImageBackground>
        </View>
      </View>

      <View style={styles.mapTools}>
        <Pressable style={styles.listButton} onPress={() => setShowList(true)}>
          <Text style={styles.listIcon}>☰</Text>
          <Text style={styles.listButtonText}>목록 보기</Text>
        </Pressable>

        <View style={styles.helpCard}>
          <Text style={styles.helpIcon}>!</Text>
          <Text style={styles.helpText}>건물을 클릭하면 식당 정보를 확인할 수 있어요.</Text>
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
  touchArea: {
    position: "absolute",
    borderRadius: 16,
  },
  infoBubbleWrap: {
    position: "absolute",
    zIndex: 4,
  },
  infoBubble: {
    paddingHorizontal: 7,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.9)",
    shadowColor: "#4d6070",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.11,
    shadowRadius: 9,
    elevation: 3,
  },
  infoBubbleSelected: {
    borderWidth: 1,
    borderColor: "#9bd9ed",
  },
  infoTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },
  infoTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 10,
    fontWeight: "900",
  },
  infoCount: {
    minWidth: 17,
    height: 17,
    overflow: "hidden",
    borderRadius: 9,
    backgroundColor: colors.primary,
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "900",
    lineHeight: 17,
    textAlign: "center",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 1,
  },
  infoBullet: {
    color: colors.ink,
    fontSize: 10,
    fontWeight: "900",
  },
  infoName: {
    flex: 1,
    color: colors.text,
    fontSize: 9,
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
  mapTools: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 8,
    marginTop: 8,
  },
  listButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d7e9f1",
    shadowColor: "#4d6070",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
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
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d7e9f1",
    shadowColor: "#4d6070",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  helpIcon: {
    width: 24,
    height: 24,
    overflow: "hidden",
    borderRadius: 12,
    backgroundColor: "#fff2d3",
    color: "#e89b22",
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 24,
    textAlign: "center",
  },
  helpText: {
    flex: 1,
    color: colors.text,
    fontSize: 11,
    fontWeight: "900",
    lineHeight: 15,
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
