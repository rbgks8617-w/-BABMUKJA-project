import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";
import { tukLogoSource } from "../utils/staticAssets";

export default function StartupSplash() {
  return (
    <View style={styles.container} accessibilityRole="progressbar" accessibilityLabel="밥먹자 불러오는 중">
      <Image source={tukLogoSource} style={styles.logo} resizeMode="contain" />
      <Text style={styles.caption}>대학교 밥먹자</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 16,
    backgroundColor: colors.background,
  },
  logo: { width: "100%", maxWidth: 320, height: 104 },
  caption: { color: colors.ink, fontSize: 16, fontWeight: "600" },
});
