import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types/app";
import { colors } from "../theme/colors";

export type IconName = React.ComponentProps<typeof Ionicons>["name"];
export function Icon({
  name,
  size = 22,
  color = colors.text,
}: {
  name: IconName;
  size?: number;
  color?: string;
}) {
  return <Ionicons name={name} size={size} color={color} />;
}

export function IconButton({
  name,
  label,
  onPress,
  badge = 0,
}: {
  name: IconName;
  label: string;
  onPress: () => void;
  badge?: number;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [ui.iconButton, pressed && ui.pressed]}
    >
      <Icon name={name} />
      {badge > 0 && (
        <View style={ui.badge}>
          <Text style={ui.badgeText}>{badge > 99 ? "99+" : badge}</Text>
        </View>
      )}
    </Pressable>
  );
}

export function SectionHeading({
  title,
  action,
  onPress,
}: {
  title: string;
  action?: string;
  onPress?: () => void;
}) {
  return (
    <View style={ui.headingRow}>
      <Text style={ui.heading}>{title}</Text>
      {action && (
        <Pressable
          accessibilityRole="button"
          onPress={onPress}
          style={ui.inlineAction}
        >
          <Text style={ui.actionText}>{action}</Text>
          <Icon name="chevron-forward" size={14} color={colors.textMuted} />
        </Pressable>
      )}
    </View>
  );
}

type Tab = "home" | "map" | "favorites" | "community" | "account";
const tabs: { id: Tab; title: string; icon: IconName; selected: IconName }[] = [
  { id: "home", title: "홈", icon: "home-outline", selected: "home" },
  { id: "map", title: "캠퍼스맵", icon: "map-outline", selected: "map" },
  {
    id: "favorites",
    title: "즐겨찾기",
    icon: "heart-outline",
    selected: "heart",
  },
  {
    id: "community",
    title: "커뮤니티",
    icon: "chatbubbles-outline",
    selected: "chatbubbles",
  },
  { id: "account", title: "마이", icon: "person-outline", selected: "person" },
];

export function BottomNav({
  active,
  navigation,
  onFavorites,
}: {
  active: Tab;
  navigation: Pick<NativeStackNavigationProp<RootStackParamList>, "navigate">;
  onFavorites?: () => void;
}) {
  const insets = useSafeAreaInsets();
  function open(tab: Tab) {
    if (tab === "favorites") {
      if (onFavorites) onFavorites();
      else navigation.navigate("RestaurantList", { category: "즐겨찾기" });
    } else if (tab === "home")
      navigation.navigate("RestaurantList", { category: "전체" });
    else if (tab === "map") navigation.navigate("CampusMap");
    else if (tab === "community") navigation.navigate("Community");
    else navigation.navigate("Auth");
  }
  return (
    <View
      style={[ui.bottomNav, { paddingBottom: Math.max(insets.bottom, 10) }]}
    >
      {tabs.map((tab) => (
        <Pressable
          key={tab.id}
          accessibilityRole="tab"
          accessibilityState={{ selected: active === tab.id }}
          accessibilityLabel={tab.title}
          onPress={() => open(tab.id)}
          style={ui.tab}
        >
          <Icon
            name={active === tab.id ? tab.selected : tab.icon}
            color={active === tab.id ? colors.primary : colors.textSoft}
            size={22}
          />
          <Text
            style={[
              ui.tabLabel,
              active === tab.id && { color: colors.primary, fontWeight: "700" },
            ]}
          >
            {tab.title}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export const ui = StyleSheet.create({
  iconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
  },
  pressed: { opacity: 0.65 },
  badge: {
    position: "absolute",
    top: 2,
    right: 1,
    minWidth: 17,
    height: 17,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: "#F06A62",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  badgeText: { color: "white", fontSize: 9, fontWeight: "700" },
  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 16,
  },
  heading: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "700",
    color: colors.text,
  },
  inlineAction: {
    flexDirection: "row",
    gap: 3,
    alignItems: "center",
    minHeight: 44,
  },
  actionText: { fontSize: 12, color: colors.textMuted },
  bottomNav: {
    flexDirection: "row",
    paddingTop: 10,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  tab: {
    flex: 1,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  tabLabel: { fontSize: 10, color: colors.textMuted },
});
