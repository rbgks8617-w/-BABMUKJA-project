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
  return <Ionicons name={name} size={size} color={color} aria-hidden />;
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
      accessibilityLabel={badge > 0 ? `${label} ${badge}개` : label}
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
      <Text accessibilityRole="header" style={ui.heading}>{title}</Text>
      {action && onPress && (
        <Pressable
          accessibilityRole="button"
          onPress={onPress}
          style={({ pressed }) => [ui.inlineAction, pressed && ui.pressed]}
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
  { id: "map", title: "식당", icon: "business-outline", selected: "business" },
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
          aria-selected={active === tab.id}
          accessibilityLabel={tab.title}
          onPress={() => open(tab.id)}
          style={({ pressed }) => [ui.tab, pressed && ui.pressed]}
        >
          <View style={[ui.tabIcon, active === tab.id && ui.tabIconActive]}>
            <Icon
              name={active === tab.id ? tab.selected : tab.icon}
              color={active === tab.id ? colors.primary : colors.textMuted}
              size={20}
            />
          </View>
          <Text
            style={[
              ui.tabLabel,
              active === tab.id && { color: colors.primary, fontWeight: "600" },
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
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
  },
  pressed: { opacity: 0.65 },
  primaryButton: {
    minHeight: 52,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
    fontVariant: ["tabular-nums"],
  },
  actionBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  badge: {
    position: "absolute",
    top: 2,
    right: 1,
    minWidth: 17,
    height: 17,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: colors.danger,
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
    minHeight: 44,
    marginBottom: 8,
  },
  heading: {
    flexShrink: 1,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "600",
    color: colors.text,
  },
  inlineAction: {
    flexDirection: "row",
    gap: 3,
    alignItems: "center",
    minHeight: 44,
  },
  actionText: { fontSize: 13, color: colors.primary, fontWeight: "600" },
  bottomNav: {
    flexDirection: "row",
    paddingTop: 4,
    paddingHorizontal: 8,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  tab: {
    flex: 1,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  tabIcon: {
    minWidth: 44,
    height: 28,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  tabIconActive: { backgroundColor: colors.surfaceWarm },
  tabLabel: { fontSize: 11, color: colors.textMuted, textAlign: "center" },
});
