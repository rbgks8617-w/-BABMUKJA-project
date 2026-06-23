import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CartScreen from "../screens/CartScreen";
import MealMateScreen from "../screens/MealMateScreen";
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
        <Image source={require("../../assets/tuk-symbol.png")} style={styles.homeLogoImage} />
      </View>
      <View>
        <Text style={styles.homeLogoName}>대학교 밥먹자</Text>
        <Text style={styles.homeLogoSub}>campus meal order</Text>
      </View>
    </View>
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
      <Stack.Screen
        name="RestaurantList"
        component={RestaurantListScreen}
        options={{
          headerTitle: () => <HomeHeaderTitle />,
          headerTitleAlign: "left",
        }}
      />
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
      <Stack.Screen
        name="MealMate"
        component={MealMateScreen}
        options={({ navigation }) => modalOptions(navigation, "밥친구 게시판", "홈")}
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
