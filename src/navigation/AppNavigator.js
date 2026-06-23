import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CartScreen from "../screens/CartScreen";
import MenuDetailScreen from "../screens/MenuDetailScreen";
import OrderCompleteScreen from "../screens/OrderCompleteScreen";
import PaymentScreen from "../screens/PaymentScreen";
import RecommendationScreen from "../screens/RecommendationScreen";
import RestaurantDetailScreen from "../screens/RestaurantDetailScreen";
import RestaurantListScreen from "../screens/RestaurantListScreen";
import SplashScreen from "../screens/SplashScreen";
import { colors } from "../theme/colors";
import { APP_FONT_FAMILY } from "../theme/typography";

const Stack = createNativeStackNavigator();

const headerTitleStyle = {
  color: "#27211d",
  fontFamily: APP_FONT_FAMILY,
  fontSize: 17,
  fontWeight: "700",
};

function BackHeaderButton({ navigation, label = "뒤로" }) {
  return (
    <Pressable
      hitSlop={8}
      style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
      onPress={() => navigation.goBack()}
    >
      <View style={styles.backIconCircle}>
        <Text style={styles.backIcon}>‹</Text>
      </View>
      <Text style={styles.backButtonText}>{label}</Text>
    </Pressable>
  );
}

function modalOptions(navigation, title, label = "뒤로") {
  return {
    animation: "slide_from_bottom",
    animationDuration: 420,
    contentStyle: { backgroundColor: colors.background },
    customAnimationOnGesture: true,
    fullScreenGestureEnabled: true,
    gestureEnabled: true,
    headerLeft: () => <BackHeaderButton navigation={navigation} label={label} />,
    headerShadowVisible: false,
    headerStyle: { backgroundColor: colors.background },
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
        contentStyle: { backgroundColor: colors.background },
        gestureEnabled: true,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
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
    minHeight: 36,
    paddingLeft: 5,
    paddingRight: 13,
    borderRadius: 999,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#b8def1",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3,
  },
  backButtonPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
  backIconCircle: {
    width: 26,
    height: 26,
    marginRight: 5,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    backgroundColor: colors.surfaceWarm,
    borderWidth: 1,
    borderColor: "#d7edf7",
  },
  backIcon: {
    color: colors.primary,
    fontFamily: APP_FONT_FAMILY,
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 23,
  },
  backButtonText: {
    color: colors.primaryDark,
    fontFamily: APP_FONT_FAMILY,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 18,
  },
});
