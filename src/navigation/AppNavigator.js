import React from "react";
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

const modalScreenOptions = {
  animation: "slide_from_bottom",
  animationDuration: 420,
  contentStyle: { backgroundColor: "#fffaf2" },
  customAnimationOnGesture: true,
  fullScreenGestureEnabled: true,
  gestureEnabled: true,
  headerShadowVisible: false,
  headerStyle: { backgroundColor: "#fffaf2" },
  headerTitleStyle: { fontWeight: "800" },
  presentation: "modal",
};

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
      <Stack.Screen
        name="RestaurantList"
        component={RestaurantListScreen}
        options={{ title: "대학교 밥먹자" }}
      />
      <Stack.Screen
        name="Recommendation"
        component={RecommendationScreen}
        options={{ ...modalScreenOptions, title: "메뉴 추천" }}
      />
      <Stack.Screen
        name="RestaurantDetail"
        component={RestaurantDetailScreen}
        options={{ ...modalScreenOptions, title: "식당 상세" }}
      />
      <Stack.Screen
        name="MenuDetail"
        component={MenuDetailScreen}
        options={{ ...modalScreenOptions, title: "메뉴 상세" }}
      />
      <Stack.Screen name="Cart" component={CartScreen} options={{ ...modalScreenOptions, title: "장바구니" }} />
      <Stack.Screen name="Payment" component={PaymentScreen} options={{ ...modalScreenOptions, title: "결제" }} />
      <Stack.Screen
        name="OrderComplete"
        component={OrderCompleteScreen}
        options={{ ...modalScreenOptions, title: "주문 완료" }}
      />
    </Stack.Navigator>
  );
}
