import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";

export default function RecommendationBanner({ onPress }) {
  return (
    <Pressable style={styles.banner} onPress={onPress}>
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>추천 메뉴</Text>
        <Text style={styles.title}>뭐 먹을지 고민될 땐?</Text>
        <Text style={styles.description}>취향만 고르면 오늘 메뉴 추천!</Text>
      </View>
      <View style={styles.iconBox}>
        <Text style={styles.icon}>🍱</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 20,
    padding: 18,
    borderRadius: 16,
    backgroundColor: colors.surfaceWarm,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  copy: {
    flex: 1,
  },
  eyebrow: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: "800",
  },
  title: {
    marginTop: 5,
    color: colors.text,
    fontSize: 21,
    fontWeight: "800",
  },
  description: {
    marginTop: 6,
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "700",
  },
  iconBox: {
    width: 62,
    height: 62,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 31,
    backgroundColor: colors.surface,
  },
  icon: {
    fontSize: 32,
  },
});
