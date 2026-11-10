import React from "react";
import { Icon } from "../components/AppUI";
import { Pressable, StyleSheet, View } from "react-native";
import { CommonActions } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type {
  NativeStackNavigationOptions,
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";
import AuthScreen from "../screens/AuthScreen";
import CartScreen from "../screens/CartScreen";
import CampusMapScreen from "../screens/CampusMapScreen";
import CommunityPostDetailScreen from "../screens/CommunityPostDetailScreen";
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
import { useAuth } from "../store/AuthContext";
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

function goBackOrFallback(
  navigation: AppNavigation,
  fallbackRoute: RouteName = "RestaurantList",
) {
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
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.backButton,
        pressed && styles.backButtonPressed,
      ]}
      onPress={() => goBackOrFallback(navigation, fallbackRoute)}
    >
      <Icon name="chevron-back" size={23} />
    </Pressable>
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
    headerLeft: () => (
      <BackHeaderButton
        navigation={navigation}
        label={label}
        fallbackRoute={fallbackRoute}
      />
    ),
    headerShadowVisible: false,
    headerStyle: { backgroundColor: colors.background },
    headerTitleStyle,
    presentation: "card",
    title,
  };
}

export default function AppNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <View style={styles.loadingScreen} />;
  }

  return (
    <Stack.Navigator
      key={user ? "signed-in" : "signed-out"}
      initialRouteName={user ? "RestaurantList" : "Auth"}
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
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Community"
        component={CommunityScreen}
        options={({ navigation }) => pushOptions(navigation, "커뮤니티", "홈")}
      />
      <Stack.Screen
        name="CommunityPostDetail"
        component={CommunityPostDetailScreen}
        options={({ navigation }) =>
          pushOptions(navigation, "게시글", "커뮤니티", "Community")
        }
      />
      <Stack.Screen
        name="Recommendation"
        component={RecommendationScreen}
        options={({ navigation }) => pushOptions(navigation, "메뉴 추천", "홈")}
      />
      <Stack.Screen
        name="RestaurantDetail"
        component={RestaurantDetailScreen}
        options={({ navigation }) =>
          pushOptions(navigation, "식당 상세", "식당")
        }
      />
      <Stack.Screen
        name="MenuDetail"
        component={MenuDetailScreen}
        options={({ navigation }) =>
          pushOptions(navigation, "메뉴 상세", "메뉴")
        }
      />
      <Stack.Screen
        name="CampusMap"
        component={CampusMapScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MealMate"
        component={MealMateScreen}
        options={({ navigation }) =>
          pushOptions(navigation, "나랑 밥먹자", "커뮤니티", "Community")
        }
      />
      <Stack.Screen
        name="MealMateChat"
        component={MealMateChatScreen}
        options={({ navigation }) =>
          pushOptions(navigation, "익명 채팅", "모임", "MealMate")
        }
      />
      <Stack.Screen
        name="Auth"
        component={AuthScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={({ navigation }) => pushOptions(navigation, "알림", "홈")}
      />
      <Stack.Screen
        name="Cart"
        component={CartScreen}
        options={({ navigation }) => pushOptions(navigation, "장바구니")}
      />
      <Stack.Screen
        name="Payment"
        component={PaymentScreen}
        options={({ navigation }) =>
          pushOptions(navigation, "결제", "장바구니", "Cart")
        }
      />
      <Stack.Screen
        name="OrderComplete"
        component={OrderCompleteScreen}
        options={({ navigation }) => pushOptions(navigation, "주문 완료", "홈")}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 44,
    paddingLeft: 6,
    paddingRight: 14,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    borderWidth: 0,
    borderColor: "#b3dff2",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0,
    shadowRadius: 14,
    elevation: 0,
  },
  backButtonPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
});
