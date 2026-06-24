import React, { useEffect, useState } from "react";
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import type { DimensionValue } from "react-native";
import { campusMapBuildings, getRestaurantById } from "../services/restaurantService";
import { colors } from "../theme/colors";
import type { AppScreenProps } from "../types/app";

const campusMapImage = require("../../assets/tuk-campus-map.png");
const mapAspectRatio = 1608 / 978;

type FloatingStyle = {
  left?: DimensionValue;
  right?: DimensionValue;
  top: DimensionValue;
  width: number;
};

type TouchAreaStyle = {
  left?: DimensionValue;
  right?: DimensionValue;
  top: DimensionValue;
  width: DimensionValue;
  height: DimensionValue;
};

const cardAnchors: Record<string, FloatingStyle> = {
  tip: { left: "16%", top: "20%", width: 76 },
  education: { left: "46%", top: "16%", width: 104 },
  industry: { right: "12%", top: "25%", width: 100 },
};

const buildingTouchAreas: Record<string, TouchAreaStyle> = {
  tip: { left: "6%", top: "27%", width: "29%", height: "35%" },
  education: { left: "38%", top: "20%", width: "25%", height: "30%" },
  industry: { right: "8%", top: "31%", width: "25%", height: "28%" },
};

function getInitialBuildingId(route?: AppScreenProps<"CampusMap">["route"]) {
  const buildingId = route?.params?.buildingId;
  return campusMapBuildings.some((building) => building.id === buildingId) ? buildingId : "education";
}

export default function CampusMapScreen({ route, navigation }: AppScreenProps<"CampusMap">) {
  const { width } = useWindowDimensions();
  const [selectedBuildingId, setSelectedBuildingId] = useState(() => getInitialBuildingId(route));

  const selectedBuilding = campusMapBuildings.find((building) => building.id === selectedBuildingId) ?? campusMapBuildings[0];
  const mapWidth = Math.min(Math.max(width - 18, 360), 1180);
  const mapStageHeight = Math.min(260, mapWidth / mapAspectRatio + 14);

  useEffect(() => {
    setSelectedBuildingId(getInitialBuildingId(route));
  }, [route]);

  const openRestaurantDetail = (restaurantId: string) => {
    navigation.navigate("RestaurantDetail", { restaurantId });
  };

  const selectBuilding = (buildingId: string) => {
    setSelectedBuildingId(buildingId);
  };

  return (
    <View style={styles.screen}>
      <View pointerEvents="none" style={styles.skyGlowTop} />
      <View pointerEvents="none" style={styles.skyGlowMiddle} />
      <View pointerEvents="none" style={styles.skyGlowFade} />
      <View style={[styles.mapStage, { height: mapStageHeight }]}>
        <View style={[styles.mapCanvas, { width: mapWidth, aspectRatio: mapAspectRatio }]}>
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
              <Pressable key={item.restaurantId} style={styles.restaurantCard} onPress={() => openRestaurantDetail(item.restaurantId)}>
                <ImageBackground
                  source={{ uri: restaurant?.imageUrl ?? "" }}
                  style={styles.restaurantImage}
                  imageStyle={styles.restaurantImageRadius}
                >
                  <View style={styles.restaurantImageDim} />
                </ImageBackground>
                <View style={styles.sheetCopy}>
                  <Text style={styles.sheetName}>{item.label}</Text>
                  <Text style={styles.sheetMeta}>
                    {restaurant?.category ?? "식당"} · {item.hours}
                  </Text>
                </View>
                <Text style={styles.cardArrow}>›</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f8fcff",
    paddingHorizontal: 8,
    paddingTop: 0,
    paddingBottom: 8,
  },
  skyGlowTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 92,
    backgroundColor: "#dff4ff",
  },
  skyGlowMiddle: {
    position: "absolute",
    top: 72,
    left: 0,
    right: 0,
    height: 72,
    backgroundColor: "#eef9ff",
  },
  skyGlowFade: {
    position: "absolute",
    top: 128,
    left: 0,
    right: 0,
    height: 86,
    backgroundColor: "#ffffff",
  },
  mapStage: {
    alignItems: "center",
    justifyContent: "flex-start",
    overflow: "hidden",
    marginTop: 16,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.78)",
    borderWidth: 1,
    borderColor: "#dcebf2",
  },
  mapCanvas: {
    maxHeight: "100%",
    marginTop: 8,
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
  bottomSheet: {
    marginTop: 4,
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
  restaurantCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    marginTop: 8,
    padding: 9,
    borderRadius: 18,
    backgroundColor: "#f7fbfe",
    borderWidth: 1,
    borderColor: "#d9ecf4",
  },
  restaurantImage: {
    width: 66,
    height: 54,
    overflow: "hidden",
    borderRadius: 14,
  },
  restaurantImageRadius: {
    borderRadius: 14,
  },
  restaurantImageDim: {
    flex: 1,
    backgroundColor: "rgba(8, 36, 56, 0.04)",
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
  cardArrow: {
    width: 28,
    height: 28,
    overflow: "hidden",
    borderRadius: 14,
    backgroundColor: colors.primary,
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 26,
    textAlign: "center",
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
