import React, { useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomNav, Icon, ui } from "../components/AppUI";
import CachedRemoteImage from "../components/CachedRemoteImage";
import {
  campusMapBuildings,
  getRestaurantById,
} from "../services/restaurantService";
import { colors } from "../theme/colors";
import type { AppScreenProps } from "../types/app";
export default function CampusMapScreen({
  route,
  navigation,
}: AppScreenProps<"CampusMap">) {
  const { top } = useSafeAreaInsets();
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
    <View style={[s.screen, { paddingTop: top }]}>
      <View accessibilityRole="tablist" accessibilityLabel="건물 선택" style={s.tabs}>
        {campusMapBuildings.map((item) => (
          <Pressable
            key={item.id}
            accessibilityRole="tab"
            aria-selected={item.id === building.id}
            onPress={() => setSelectedId(item.id)}
            style={({ pressed }) => [s.tab, item.id === building.id && s.tabSelected, pressed && ui.pressed]}
          >
            <Text
              style={[s.tabText, item.id === building.id && { color: "white" }]}
            >
              {item.name}
            </Text>
          </Pressable>
        ))}
      </View>
      <View style={s.listHeading}>
        <Text accessibilityRole="header" style={s.listTitle}>{building.name}</Text>
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
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 8,
    paddingVertical: 12,
  },
  tab: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 10,
  },
  tabSelected: { backgroundColor: colors.primary },
  tabText: { color: colors.textMuted, fontSize: 12, fontWeight: "600", textAlign: "center", flexShrink: 1 },
  listHeading: {
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  listTitle: { fontSize: 18, fontWeight: "700", color: colors.text },
  count: { fontSize: 12, color: colors.textMuted },
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
