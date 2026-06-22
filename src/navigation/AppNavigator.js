import React from "react";
import { Platform, Pressable, StyleSheet, Text } from "react-native";
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
const appFontFamily = Platform.select({
  android: "sans-serif",
  ios: "Apple SD Gothic Neo",
  web: "Pretendard, -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Segoe UI', sans-serif",
  default: undefined,
});

const headerTitleStyle = {
  color: "#27211d",
  fontFamily: appFontFamily,
  fontSize: 17,
  fontWeight: "800",
};

function BackHeaderButton({ navigation, label = "뒤로" }) {
  return (
    <Pressable
      hitSlop={8}
      style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
      onPress={() => navigation.goBack()}
    >
      <Text style={styles.backIcon}>‹</Text>
      <Text style={styles.backButtonText}>{label}</Text>
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
    headerTitleStyle,
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
        headerTitleStyle,
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
    flexDirection: "row",
    alignItems: "center",
    minHeight: 32,
    paddingLeft: 8,
    paddingRight: 11,
    borderRadius: 999,
    backgroundColor: "#fff4ec",
    borderWidth: 1,
    borderColor: "#f3d5c8",
  },
  backButtonPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
  backIcon: {
    marginRight: 2,
    color: "#c94a25",
    fontFamily: appFontFamily,
    fontSize: 20,
    fontWeight: "500",
    lineHeight: 22,
  },
  backButtonText: {
    color: "#c94a25",
    fontFamily: appFontFamily,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 17,
  },
});
