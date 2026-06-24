import React, { useEffect, useRef } from "react";
import { Animated, Easing, Image, StyleSheet, Text, View } from "react-native";

const tukLogo = require("../../assets/tuk-logo.png");

type StartupSplashProps = {
  onDone?: () => void;
};

export default function StartupSplash({ onDone }: StartupSplashProps) {
  const logoTranslateX = useRef(new Animated.Value(-90)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoTranslateX, {
          toValue: 0,
          duration: 900,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 650,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(850),
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 650,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDone?.();
    });
  }, [logoOpacity, logoTranslateX, onDone, screenOpacity]);

  return (
    <Animated.View pointerEvents="auto" style={[styles.container, { opacity: screenOpacity }]}>
      <Animated.View
        style={[
          styles.logoWrap,
          {
            opacity: logoOpacity,
            transform: [{ translateX: logoTranslateX }],
          },
        ]}
      >
        <Image source={tukLogo} style={styles.logo} resizeMode="contain" />
      </Animated.View>
      <View style={styles.shimmerLine} />
      <Text style={styles.caption}>대학교 밥먹자</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    backgroundColor: "#ffffff",
  },
  logoWrap: {
    width: "100%",
    alignItems: "center",
  },
  logo: {
    width: "100%",
    maxWidth: 360,
    height: 130,
  },
  shimmerLine: {
    width: 210,
    height: 3,
    marginTop: 18,
    borderRadius: 999,
    backgroundColor: "#1c68b3",
    opacity: 0.18,
  },
  caption: {
    marginTop: 18,
    color: "#1c68b3",
    fontSize: 16,
    fontWeight: "900",
  },
});
