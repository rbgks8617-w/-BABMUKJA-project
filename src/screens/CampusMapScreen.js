import React, { useMemo, useState } from "react";
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { campusMapBuildings, getRestaurantById, getRestaurants } from "../services/restaurantService";
import { colors } from "../theme/colors";

const campusMapImage = require("../../assets/tuk-campus-map.png");
const mapAspectRatio = 1536 / 1190;

const zones = {
  search: { left: "68%", top: "3%", width: "27%", height: "7%" },
  hasRestaurant: { left: "2%", top: "12%", width: "11%", height: "6%" },
  noRestaurant: { left: "14%", top: "12%", width: "11%", height: "6%" },
  zoomIn: { right: "1.8%", top: "9%", width: "5%", height: "6%" },
  zoomOut: { right: "1.8%", top: "15%", width: "5%", height: "6%" },
  list: { left: "2%", bottom: "4%", width: "10%", height: "6%" },
  tip: { left: "18%", top: "25%", width: "17%", height: "14%" },
  education: { left: "39%", top: "17%", width: "18%", height: "16%" },
  industry: { right: "7%", top: "30%", width: "18%", height: "16%" },
};

export default function CampusMapScreen({ navigation }) {
  const [selectedBuildingId, setSelectedBuildingId] = useState(null);
  const [showList, setShowList] = useState(false);
  const [filter, setFilter] = useState("all");
  const restaurants = getRestaurants();
  const selectedBuilding = campusMapBuildings.find((building) => building.id === selectedBuildingId);

  const visibleRestaurants = useMemo(() => {
    if (filter === "open") {
      return restaurants.filter((restaurant) => restaurant.isOpen);
    }

    if (filter === "none") {
      return [];
    }

    return restaurants;
  }, [filter, restaurants]);

  const openRestaurantDetail = (restaurantId) => {
    navigation.navigate("RestaurantDetail", { restaurantId });
  };

  const selectBuilding = (buildingId) => {
    setSelectedBuildingId(buildingId);
    setShowList(false);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.mapFrame}>
        <ImageBackground
          source={campusMapImage}
          resizeMode="contain"
          style={styles.mapImage}
          imageStyle={styles.mapImageContent}
        >
          <Pressable style={[styles.touchZone, zones.search]} onPress={() => setShowList(true)} />
          <Pressable style={[styles.touchZone, zones.hasRestaurant]} onPress={() => setFilter("open")} />
          <Pressable style={[styles.touchZone, zones.noRestaurant]} onPress={() => setFilter("none")} />
          <Pressable style={[styles.touchZone, zones.zoomIn]} />
          <Pressable style={[styles.touchZone, zones.zoomOut]} />
          <Pressable style={[styles.touchZone, zones.list]} onPress={() => setShowList(true)} />
          <Pressable style={[styles.touchZone, zones.tip]} onPress={() => selectBuilding("tip")} />
          <Pressable style={[styles.touchZone, zones.education]} onPress={() => selectBuilding("education")} />
          <Pressable style={[styles.touchZone, zones.industry]} onPress={() => selectBuilding("industry")} />
        </ImageBackground>
      </View>

      {selectedBuilding ? (
        <View style={styles.sheet}>
          <View style={styles.sheetTop}>
            <View>
              <Text style={styles.sheetEyebrow}>선택한 건물</Text>
              <Text style={styles.sheetTitle}>{selectedBuilding.name}</Text>
            </View>
            <Pressable style={styles.closeButton} onPress={() => setSelectedBuildingId(null)}>
              <Text style={styles.closeButtonText}>닫기</Text>
            </Pressable>
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
          <View style={styles.sheetTop}>
            <Text style={styles.listTitle}>{filter === "none" ? "식당 없는 건물" : "식당 목록"}</Text>
            <Pressable style={styles.closeButton} onPress={() => setShowList(false)}>
              <Text style={styles.closeButtonText}>닫기</Text>
            </Pressable>
          </View>
          {visibleRestaurants.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>현재 표시할 식당이 없어요</Text>
              <Text style={styles.emptyText}>사진의 필터 영역을 다시 눌러 식당 목록을 볼 수 있어요.</Text>
            </View>
          ) : (
            <ScrollView style={styles.listScroll}>
              {visibleRestaurants.map((restaurant) => (
                <Pressable key={restaurant.id} style={styles.listRestaurant} onPress={() => openRestaurantDetail(restaurant.id)}>
                  <Text style={styles.listRestaurantName}>{restaurant.name}</Text>
                  <Text style={styles.listRestaurantMeta}>{restaurant.location}</Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
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
  mapFrame: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: 24,
    backgroundColor: "#f6fbff",
  },
  mapImage: {
    width: "100%",
    aspectRatio: mapAspectRatio,
    maxHeight: "100%",
  },
  mapImageContent: {
    borderRadius: 24,
  },
  touchZone: {
    position: "absolute",
    borderRadius: 18,
  },
  sheet: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 14,
    padding: 14,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.97)",
    borderWidth: 1,
    borderColor: "#d7e9f1",
    shadowColor: "#4d6070",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.17,
    shadowRadius: 20,
    elevation: 8,
  },
  sheetTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 8,
  },
  sheetEyebrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
  },
  sheetTitle: {
    marginTop: 3,
    color: colors.text,
    fontSize: 19,
    fontWeight: "900",
  },
  closeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#eaf7fc",
  },
  closeButtonText: {
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
    left: 14,
    right: 14,
    top: 84,
    bottom: 14,
    padding: 14,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.98)",
    borderWidth: 1,
    borderColor: "#d7e9f1",
  },
  listTitle: {
    color: colors.text,
    fontSize: 19,
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
