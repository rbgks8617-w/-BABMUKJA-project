import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CartScreen from "../screens/CartScreen";
import MenuDetailScreen from "../screens/MenuDetailScreen";
import OrderCompleteScreen from "../screens/OrderCompleteScreen";
import PaymentScreen from "../screens/PaymentScreen";
import RecommendationScreen from "../screens/RecommendationScreen";
import RestaurantDetailScreen from "../screens/RestaurantDetailScreen";
import RestaurantListScreen from "../screens/RestaurantListScreen";
import SplashScreen from "../screens/SplashScreen";

const Stack = createNativeStackNavigator();

function BackHeaderButton({ navigation, label = "뒤로" }) {
  return (
    <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
      <Text style={styles.backButtonText}>‹ {label}</Text>
    </Pressable>
  );
}

function modalOptions(navigation, title, label = "뒤로") {
  return {
    animation: "slide_from_bottom",
    animationDuration: 420,
    contentStyle: { backgroundColor: "#fffaf2" },
    customAnimationOnGesture: true,
    fullScreenGestureEnabled: true,
    gestureEnabled: true,
    headerLeft: () => <BackHeaderButton navigation={navigation} label={label} />,
    headerShadowVisible: false,
    headerStyle: { backgroundColor: "#fffaf2" },
    headerTitleStyle: { fontWeight: "800" },
    presentation: "modal",
    title,
  };
}

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        animation: "fade",
        contentStyle: { backgroundColor: "#fffaf2" },
        gestureEnabled: true,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: "#fffaf2" },
        headerTitleStyle: { fontWeight: "800" },
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
      <Stack.Screen name="RestaurantList" component={RestaurantListScreen} options={{ title: "대학교 밥먹자" }} />
      <Stack.Screen
        name="Recommendation"
        component={RecommendationScreen}
        options={({ navigation }) => modalOptions(navigation, "메뉴 추천", "메인")}
      />
      <Stack.Screen
        name="RestaurantDetail"
        component={RestaurantDetailScreen}
        options={({ navigation }) => modalOptions(navigation, "식당 상세", "식당")}
      />
      <Stack.Screen
        name="MenuDetail"
        component={MenuDetailScreen}
        options={({ navigation }) => modalOptions(navigation, "메뉴 상세", "메뉴")}
      />
      <Stack.Screen name="Cart" component={CartScreen} options={({ navigation }) => modalOptions(navigation, "장바구니")} />
      <Stack.Screen name="Payment" component={PaymentScreen} options={({ navigation }) => modalOptions(navigation, "결제")} />
      <Stack.Screen
        name="OrderComplete"
        component={OrderCompleteScreen}
        options={({ navigation }) => modalOptions(navigation, "주문 완료", "홈")}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  backButton: {
    minHeight: 36,
    justifyContent: "center",
    paddingRight: 12,
  },
  backButtonText: {
    color: "#d9532b",
    fontSize: 16,
    fontWeight: "900",
  },
});
