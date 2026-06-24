import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { CommonActions } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { NativeStackNavigationOptions, NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ImageStyle } from "react-native";
import CartScreen from "../screens/CartScreen";
import CampusMapScreen from "../screens/CampusMapScreen";
import CommunityScreen from "../screens/CommunityScreen";
import MealMateChatScreen from "../screens/MealMateChatScreen";
import MealMateScreen from "../screens/MealMateScreen";
import MenuDetailScreen from "../screens/MenuDetailScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import OrderCompleteScreen from "../screens/OrderCompleteScreen";
import PaymentScreen from "../screens/PaymentScreen";
import RecommendationScreen from "../screens/RecommendationScreen";
import RestaurantDetailScreen from "../screens/RestaurantDetailScreen";
import RestaurantListScreen from "../screens/RestaurantListScreen";
import { colors } from "../theme/colors";
import { APP_FONT_FAMILY } from "../theme/typography";
import type { RootStackParamList } from "../types/app";

const Stack = createNativeStackNavigator<RootStackParamList>();
type AppNavigation = NativeStackNavigationProp<RootStackParamList>;
type RouteName = keyof RootStackParamList;

const headerTitleStyle: NativeStackNavigationOptions["headerTitleStyle"] = {
  color: "#27211d",
  fontFamily: APP_FONT_FAMILY,
  fontSize: 17,
  fontWeight: "700",
};

function goBackOrFallback(navigation: AppNavigation, fallbackRoute: RouteName = "RestaurantList") {
  if (navigation.canGoBack()) {
    navigation.goBack();
    return;
  }

  navigation.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: fallbackRoute }],
    }),
  );
}

function BackHeaderButton({
  navigation,
  label = "뒤로",
  fallbackRoute = "RestaurantList",
}: {
  navigation: AppNavigation;
  label?: string;
  fallbackRoute?: RouteName;
}) {
  return (
    <Pressable
      hitSlop={8}
      style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
      onPress={() => goBackOrFallback(navigation, fallbackRoute)}
    >
      <View style={styles.backIconCircle}>
        <View style={styles.backChevron} />
      </View>
      <Text style={styles.backButtonText}>{label}</Text>
    </Pressable>
  );
}

function HomeHeaderTitle() {
  return (
    <View style={styles.homeLogo}>
      <View style={styles.homeLogoMark}>
        <Image source={require("../../assets/tuk-symbol.png")} style={styles.homeLogoImage as ImageStyle} />
      </View>
      <View>
        <Text style={styles.homeLogoName}>대학교 밥먹자</Text>
        <Text style={styles.homeLogoSub}>campus meal order</Text>
      </View>
    </View>
  );
}

function pushOptions(
  navigation: AppNavigation,
  title: string,
  label = "뒤로",
  fallbackRoute: RouteName = "RestaurantList",
): NativeStackNavigationOptions {
  return {
    animation: "slide_from_right",
    animationDuration: 360,
    contentStyle: { backgroundColor: colors.background },
    customAnimationOnGesture: true,
    fullScreenGestureEnabled: true,
    gestureEnabled: true,
    headerLeft: () => <BackHeaderButton navigation={navigation} label={label} fallbackRoute={fallbackRoute} />,
    headerShadowVisible: false,
    headerStyle: { backgroundColor: colors.background },
    headerTitleStyle,
    presentation: "card",
    title,
  };
}

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="RestaurantList"
      screenOptions={{
        animation: "slide_from_right",
        contentStyle: { backgroundColor: colors.background },
        customAnimationOnGesture: true,
        fullScreenGestureEnabled: true,
        gestureEnabled: true,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle,
      }}
    >
      <Stack.Screen
        name="RestaurantList"
        component={RestaurantListScreen}
        options={{
          headerTitle: () => <HomeHeaderTitle />,
          headerTitleAlign: "left",
        }}
      />
      <Stack.Screen
        name="Community"
        component={CommunityScreen}
        options={({ navigation }) => pushOptions(navigation, "커뮤니티", "홈")}
      />
      <Stack.Screen
        name="Recommendation"
        component={RecommendationScreen}
        options={({ navigation }) => pushOptions(navigation, "메뉴 추천", "홈")}
      />
      <Stack.Screen
        name="RestaurantDetail"
        component={RestaurantDetailScreen}
        options={({ navigation }) => pushOptions(navigation, "식당 상세", "식당")}
      />
      <Stack.Screen
        name="MenuDetail"
        component={MenuDetailScreen}
        options={({ navigation }) => pushOptions(navigation, "메뉴 상세", "메뉴")}
      />
      <Stack.Screen
        name="CampusMap"
        component={CampusMapScreen}
        options={({ navigation }) => ({
          ...pushOptions(navigation, "", "홈"),
          headerTitle: () => null,
        })}
      />
      <Stack.Screen
        name="MealMate"
        component={MealMateScreen}
        options={({ navigation }) => pushOptions(navigation, "나랑 밥먹자", "커뮤니티", "Community")}
      />
      <Stack.Screen
        name="MealMateChat"
        component={MealMateChatScreen}
        options={({ navigation }) => pushOptions(navigation, "익명 채팅", "모임", "MealMate")}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={({ navigation }) => pushOptions(navigation, "알림", "홈")}
      />
      <Stack.Screen name="Cart" component={CartScreen} options={({ navigation }) => pushOptions(navigation, "장바구니")} />
      <Stack.Screen name="Payment" component={PaymentScreen} options={({ navigation }) => pushOptions(navigation, "결제", "장바구니", "Cart")} />
      <Stack.Screen
        name="OrderComplete"
        component={OrderCompleteScreen}
        options={({ navigation }) => pushOptions(navigation, "주문 완료", "홈")}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  homeLogo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  homeLogoMark: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    backgroundColor: "transparent",
  },
  homeLogoImage: {
    width: 29,
    height: 29,
    resizeMode: "contain",
  },
  homeLogoName: {
    color: colors.ink,
    fontFamily: APP_FONT_FAMILY,
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 18,
  },
  homeLogoSub: {
    marginTop: 1,
    color: colors.textSoft,
    fontFamily: APP_FONT_FAMILY,
    fontSize: 8,
    fontWeight: "800",
    lineHeight: 10,
    textTransform: "uppercase",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 38,
    paddingLeft: 6,
    paddingRight: 14,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    borderWidth: 1,
    borderColor: "#b3dff2",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 3,
  },
  backButtonPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
  backIconCircle: {
    width: 28,
    height: 28,
    marginRight: 6,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#f0fbff",
    borderWidth: 1,
    borderColor: "#caedf8",
  },
  backChevron: {
    width: 9,
    height: 9,
    borderLeftWidth: 3,
    borderBottomWidth: 3,
    borderColor: colors.primary,
    borderRadius: 1.5,
    transform: [{ rotate: "45deg" }, { translateX: 1 }],
  },
  backButtonText: {
    color: colors.primaryDark,
    fontFamily: APP_FONT_FAMILY,
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 18,
  },
});
