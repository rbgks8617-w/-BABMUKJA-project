import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import type { ViewStyle } from "react-native";
import { BottomNav, Icon } from "../components/AppUI";
import CachedRemoteImage from "../components/CachedRemoteImage";
import {
  campusMapBuildings,
  getRestaurantById,
} from "../services/restaurantService";
import { colors } from "../theme/colors";
import type { AppScreenProps } from "../types/app";
import { campusMapSource } from "../utils/staticAssets";

// Keep the original map. Compress this large PNG or convert to WebP before native release.
const aspectRatio = 1608 / 978;
const buildingAreas: Record<string, ViewStyle> = {
  tip: { left: "6%", top: "27%", width: "29%", height: "35%" },
  education: { left: "38%", top: "20%", width: "25%", height: "30%" },
  industry: { right: "8%", top: "31%", width: "25%", height: "28%" },
};
export default function CampusMapScreen({
  route,
  navigation,
}: AppScreenProps<"CampusMap">) {
  const { height } = useWindowDimensions();
  const [mapWidth, setMapWidth] = useState(0);
  const mapHeight = Math.min(mapWidth / aspectRatio, height * 0.3);
  const [selectedId, setSelectedId] = useState(
    route.params?.buildingId ?? "tip",
  );
  useEffect(() => {
    if (route.params?.buildingId) setSelectedId(route.params.buildingId);
  }, [route.params?.buildingId]);
  const building =
    campusMapBuildings.find((item) => item.id === selectedId) ??
    campusMapBuildings[0];
  return (
    <View style={s.screen}>
      <View style={s.heading}>
        <Text style={s.eyebrow}>TUK CAMPUS MAP</Text>
        <Text style={s.title}>맛있는 곳은, 가까이에</Text>
      </View>
      <View
        onLayout={(event) => setMapWidth(event.nativeEvent.layout.width)}
        style={s.mapArea}
      >
        <View
          style={{
            width: mapHeight * aspectRatio,
            height: mapHeight,
            alignSelf: "center",
          }}
        >
          <Image
            source={campusMapSource}
            resizeMode="contain"
            accessibilityLabel="한국공학대학교 캠퍼스 지도"
            style={StyleSheet.absoluteFillObject}
          />
          {campusMapBuildings.map((item) => (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={item.name + " 지도에서 선택"}
              accessibilityState={{ selected: item.id === building.id }}
              onPress={() => setSelectedId(item.id)}
              style={[{ position: "absolute" }, buildingAreas[item.id]]}
            />
          ))}
        </View>
      </View>
      <View style={s.tabs}>
        {campusMapBuildings.map((item) => (
          <Pressable
            key={item.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: item.id === building.id }}
            onPress={() => setSelectedId(item.id)}
            style={[s.tab, item.id === building.id && s.tabSelected]}
          >
            <Icon
              name="location-outline"
              size={15}
              color={item.id === building.id ? "white" : colors.textMuted}
            />
            <Text
              style={[s.tabText, item.id === building.id && { color: "white" }]}
            >
              {item.name}
            </Text>
          </Pressable>
        ))}
      </View>
      <View style={s.listHeading}>
        <Text style={s.listTitle}>{building.name}</Text>
        <Text style={s.count}>{building.restaurants.length}개 식당</Text>
      </View>
      <FlatList
        data={building.restaurants}
        keyExtractor={(item) => item.restaurantId}
        initialNumToRender={5}
        windowSize={5}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const restaurant = getRestaurantById(item.restaurantId);
          return (
            <Pressable
              accessibilityRole="button"
              style={s.restaurant}
              onPress={() =>
                navigation.navigate("RestaurantDetail", {
                  restaurantId: item.restaurantId,
                })
              }
            >
              <CachedRemoteImage
                uri={restaurant?.imageUrl ?? ""}
                style={s.image}
              />
              <View style={s.copy}>
                <Text style={s.name}>{item.label}</Text>
                <Text style={s.meta}>
                  {restaurant?.category} · {item.hours}
                </Text>
                <View style={s.rating}>
                  <Icon name="star" size={12} color="#D6A044" />
                  <Text style={s.ratingText}>{restaurant?.rating ?? "-"}</Text>
                </View>
              </View>
              <Icon name="chevron-forward" size={18} color={colors.textSoft} />
            </Pressable>
          );
        }}
      />
      <BottomNav active="map" navigation={navigation} />
    </View>
  );
}
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  heading: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 20 },
  eyebrow: { color: colors.primary, fontSize: 10, fontWeight: "700" },
  title: { color: colors.text, fontSize: 24, fontWeight: "700", marginTop: 8 },
  mapArea: {
    marginHorizontal: 16,
    backgroundColor: "#F7F9FC",
    overflow: "hidden",
    borderRadius: 12,
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 7,
    paddingVertical: 18,
  },
  tab: {
    flex: 1,
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    backgroundColor: "#F5F6F8",
    borderRadius: 8,
  },
  tabSelected: { backgroundColor: colors.primary },
  tabText: { color: colors.textMuted, fontSize: 11, fontWeight: "600" },
  listHeading: {
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingVertical: 14,
    borderTopWidth: 6,
    borderColor: "#F5F6F8",
  },
  listTitle: { fontSize: 18, fontWeight: "700", color: colors.text },
  count: { fontSize: 11, color: colors.textMuted },
  list: { paddingHorizontal: 24, paddingBottom: 16 },
  restaurant: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  image: { width: 72, height: 72, borderRadius: 10 },
  copy: { flex: 1 },
  name: { color: colors.text, fontWeight: "700", fontSize: 15 },
  meta: { color: colors.textMuted, fontSize: 10, marginTop: 7 },
  rating: { flexDirection: "row", gap: 4, alignItems: "center", marginTop: 8 },
  ratingText: { fontSize: 11, color: colors.textMuted },
});
