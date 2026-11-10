import React, { useEffect } from "react";
import { Platform, Text, TextInput, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Asset } from "expo-asset";
import { StatusBar } from "expo-status-bar";
import StartupSplash from "./src/components/StartupSplash";
import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/store/AuthContext";
import { CartProvider } from "./src/store/CartContext";
import { FavoriteProvider } from "./src/store/FavoriteContext";
import { NotificationProvider } from "./src/store/NotificationContext";
import { colors } from "./src/theme/colors";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { roundedTextStyle } from "./src/theme/typography";

const webBaseUrl =
  typeof window === "undefined" ? "" : new URL("./", window.location.href).href;

function hostedFont(source: number) {
  if (Platform.OS !== "web" || __DEV__ || !webBaseUrl) return source;
  // Expo SDK 51 resolves fonts from the origin; static hosts use a nested path.
  const { uri } = Asset.fromModule(source);
  return new URL(uri.replace(/^\/assets\//, "assets/"), webBaseUrl).href;
}

const appFonts = {
  GabiaSolmee: hostedFont(require("./assets/fonts/gabia_solmee.ttf")),
  ionicons: hostedFont(Ionicons.font.ionicons),
};

const linking = {
  prefixes: ["babmukja://", webBaseUrl].filter(Boolean),
  config: {
    screens: {
      RestaurantList: "home",
      Community: "community",
      CommunityPostDetail: "community/post/:postId",
      Recommendation: "recommendation",
      RestaurantDetail: "restaurant/:restaurantId",
      MenuDetail: "menu/:menuId",
      CampusMap: "map",
      MealMate: "meal-mate",
      MealMateChat: "meal-mate/chat",
      Auth: "auth",
      Notifications: "notifications",
      Cart: "cart",
      Payment: "payment",
      OrderComplete: "order-complete",
    },
  },
};

const navigationLinking = Platform.OS === "web" ? undefined : linking;

function applyDefaultFont(Component: any) {
  Component.defaultProps = Component.defaultProps || {};
  Component.defaultProps.style = [
    Component.defaultProps.style,
    roundedTextStyle,
  ];
}

applyDefaultFont(Text);
applyDefaultFont(TextInput);

export default function App() {
  const [fontsLoaded, fontError] = useFonts(appFonts);

  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") {
      return;
    }

    const styleId = "babmukja-rounded-font";
    if (document.getElementById(styleId)) {
      return;
    }

    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      body,
      input,
      textarea,
      button {
        font-family: "Apple SD Gothic Neo", "Malgun Gothic", sans-serif;
        -webkit-font-smoothing: antialiased;
      }
      html,
      body,
      #root {
        overscroll-behavior-x: contain;
      }
      * { box-sizing: border-box; }
      :focus-visible { outline: 2px solid ${colors.primary}; outline-offset: 2px; }
      input:focus-visible, textarea:focus-visible { outline: 2px solid ${colors.primary}; outline-offset: -2px; }
    `;
    document.head.appendChild(style);
  }, []);

  if (!fontsLoaded && !fontError) {
    return <StartupSplash />;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <FavoriteProvider>
          <CartProvider>
            <NotificationProvider>
              <View
                style={{
                  flex: 1,
                  backgroundColor: colors.surfaceMuted,
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    flex: 1,
                    width: "100%",
                    maxWidth: Platform.OS === "web" ? 760 : undefined,
                    backgroundColor: colors.background,
                  }}
                >
                  <NavigationContainer linking={navigationLinking}>
                    <StatusBar style="dark" />
                    <AppNavigator />
                  </NavigationContainer>
                </View>
              </View>
            </NotificationProvider>
          </CartProvider>
        </FavoriteProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
