import React, { useRef } from "react";
import { Animated, Pressable, StyleSheet } from "react-native";
import type { GestureResponderEvent, StyleProp, ViewStyle } from "react-native";

const emptyHeart = require("../../assets/heart-empty.png");
const filledHeart = require("../../assets/heart-filled.png");

type FavoriteHeartButtonProps = {
  isFavorite: boolean;
  onPress: () => void;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export default function FavoriteHeartButton({ isFavorite, onPress, size = 27, style }: FavoriteHeartButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  function handlePress(event: GestureResponderEvent) {
    event.stopPropagation();
    scale.stopAnimation();
    scale.setValue(0.84);
    Animated.sequence([
      Animated.spring(scale, {
        toValue: 1.28,
        friction: 3,
        tension: 190,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 4,
        tension: 150,
        useNativeDriver: true,
      }),
    ]).start();
    onPress();
  }

  return (
    <Pressable
      accessibilityLabel={isFavorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}
      hitSlop={10}
      style={[styles.button, style]}
      onPress={handlePress}
    >
      <Animated.Image
        source={isFavorite ? filledHeart : emptyHeart}
        resizeMode="contain"
        style={[
          styles.image,
          {
            width: size,
            height: size,
            transform: [{ scale }],
          },
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
    borderRadius: 17,
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    borderWidth: 1,
    borderColor: "#dcecf3",
  },
  image: {
    transformOrigin: "center",
  },
});
