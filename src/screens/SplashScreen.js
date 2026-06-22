import React, { useEffect } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { getUniversity } from "../services/restaurantService";

export default function SplashScreen({ navigation }) {
  const university = getUniversity();

  useEffect(() => {
    const timerId = setTimeout(() => {
      navigation.replace("RestaurantList");
    }, 1800);

    return () => clearTimeout(timerId);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image source={{ uri: university.logoUrl }} style={styles.logo} />
      <Text style={styles.university}>{university.name}</Text>
      <Text style={styles.title}>대학교 밥먹자</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fffaf2",
  },
  logo: {
    width: 132,
    height: 132,
    borderRadius: 66,
    marginBottom: 22,
  },
  university: {
    color: "#d9532b",
    fontSize: 18,
    fontWeight: "800",
  },
  title: {
    marginTop: 8,
    color: "#222222",
    fontSize: 34,
    fontWeight: "900",
  },
});
