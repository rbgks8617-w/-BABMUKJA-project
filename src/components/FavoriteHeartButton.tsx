import React from "react";
import { Image, Pressable, StyleSheet } from "react-native";
import type { GestureResponderEvent, StyleProp, ViewStyle } from "react-native";
import { heartEmptySource, heartFilledSource } from "../utils/staticAssets";
import { colors } from "../theme/colors";

type FavoriteHeartButtonProps = {
  isFavorite: boolean;
  onPress: () => void;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export default function FavoriteHeartButton({ isFavorite, onPress, size = 27, style }: FavoriteHeartButtonProps) {
  function handlePress(event: GestureResponderEvent) {
    event.stopPropagation();
    onPress();
  }

  return (
    <Pressable
      accessibilityLabel={isFavorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}
      accessibilityRole="button"
      accessibilityState={{ selected: isFavorite }}
      hitSlop={10}
      style={({ pressed }) => [styles.button, style, pressed && styles.pressed]}
      onPress={handlePress}
    >
      <Image
        source={isFavorite ? heartFilledSource : heartEmptySource}
        resizeMode="contain"
        style={{ width: size, height: size }}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
    borderRadius: 19,
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.7 },
});
