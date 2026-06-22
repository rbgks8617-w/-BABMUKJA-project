import React from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import MenuCard from "../components/MenuCard";
import { getMenusByRestaurantId, getRestaurantById } from "../services/restaurantService";

export default function RestaurantDetailScreen({ route, navigation }) {
  const { restaurantId } = route.params;
  const restaurant = getRestaurantById(restaurantId);
  const menus = getMenusByRestaurantId(restaurantId);

  if (!restaurant) {
    return (
      <View style={styles.empty}>
        <Text>식당 정보를 찾을 수 없습니다.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: restaurant.imageUrl }} style={styles.heroImage} />
      <Text style={styles.name}>{restaurant.name}</Text>
      <Text style={styles.location}>{restaurant.location}</Text>
      <Text style={styles.description}>{restaurant.description}</Text>
      <Text style={styles.sectionTitle}>메뉴</Text>

      {menus.map((menu) => (
        <MenuCard
          key={menu.id}
          menu={menu}
          onPress={() => navigation.navigate("MenuDetail", { menuId: menu.id })}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  heroImage: {
    width: "100%",
    height: 210,
    borderRadius: 14,
    marginBottom: 18,
  },
  name: {
    color: "#222222",
    fontSize: 28,
    fontWeight: "900",
  },
  location: {
    marginTop: 6,
    color: "#d9532b",
    fontWeight: "800",
  },
  description: {
    marginTop: 10,
    color: "#666666",
    lineHeight: 21,
  },
  sectionTitle: {
    marginTop: 24,
    marginBottom: 12,
    color: "#222222",
    fontSize: 22,
    fontWeight: "900",
  },
});
