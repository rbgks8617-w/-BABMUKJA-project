import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CartScreen from "../screens/CartScreen";
import MenuDetailScreen from "../screens/MenuDetailScreen";
import OrderCompleteScreen from "../screens/OrderCompleteScreen";
import PaymentScreen from "../screens/PaymentScreen";
import RestaurantDetailScreen from "../screens/RestaurantDetailScreen";
import RestaurantListScreen from "../screens/RestaurantListScreen";
import SplashScreen from "../screens/SplashScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerStyle: { backgroundColor: "#fffaf2" },
        headerTitleStyle: { fontWeight: "800" },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: "#fffaf2" },
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
      <Stack.Screen name="RestaurantList" component={RestaurantListScreen} options={{ title: "대학교 밥먹자" }} />
      <Stack.Screen name="RestaurantDetail" component={RestaurantDetailScreen} options={{ title: "식당 상세" }} />
      <Stack.Screen name="MenuDetail" component={MenuDetailScreen} options={{ title: "메뉴 상세" }} />
      <Stack.Screen name="Cart" component={CartScreen} options={{ title: "장바구니" }} />
      <Stack.Screen name="Payment" component={PaymentScreen} options={{ title: "결제" }} />
      <Stack.Screen name="OrderComplete" component={OrderCompleteScreen} options={{ title: "주문 완료" }} />
    </Stack.Navigator>
  );
}
