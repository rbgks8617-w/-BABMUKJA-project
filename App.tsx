import React, { useCallback, useEffect, useState } from "react";
import { Platform, Text, TextInput, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import StartupSplash from "./src/components/StartupSplash";
import AppNavigator from "./src/navigation/AppNavigator";
import { CartProvider } from "./src/store/CartContext";
import { FavoriteProvider } from "./src/store/FavoriteContext";
import { NotificationProvider } from "./src/store/NotificationContext";
import { colors } from "./src/theme/colors";
import { roundedTextStyle } from "./src/theme/typography";

const webOrigin = typeof window === "undefined" ? "" : window.location.origin;

const linking = {
  prefixes: ["babmukja://", webOrigin].filter(Boolean),
  config: {
    screens: {
      RestaurantList: "home",
      Community: "community",
      Recommendation: "recommendation",
      RestaurantDetail: "restaurant/:restaurantId",
      MenuDetail: "menu/:menuId",
      CampusMap: "map",
      MealMate: "meal-mate",
      MealMateChat: "meal-mate/chat",
      Notifications: "notifications",
      Cart: "cart",
      Payment: "payment",
      OrderComplete: "order-complete",
    },
  },
};

function applyDefaultFont(Component: any) {
  Component.defaultProps = Component.defaultProps || {};
  Component.defaultProps.style = [Component.defaultProps.style, roundedTextStyle];
}

applyDefaultFont(Text);
applyDefaultFont(TextInput);

export default function App() {
  const [showStartupSplash, setShowStartupSplash] = useState(true);
  const [fontsLoaded] = useFonts({
    GabiaSolmee: require("./assets/fonts/gabia_solmee.ttf"),
  });

  const hideStartupSplash = useCallback(() => {
    setShowStartupSplash(false);
  }, []);

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
      button,
      [class*="css-text"] {
        font-family: "GabiaSolmee", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif !important;
      }
      input,
      textarea {
        outline: none;
      }
      html,
      body,
      #root {
        overscroll-behavior-x: contain;
      }
    `;
    document.head.appendChild(style);
  }, []);

  if (!fontsLoaded && Platform.OS !== "web") {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <NotificationProvider>
      <FavoriteProvider>
        <CartProvider>
          <View style={{ flex: 1 }}>
            <NavigationContainer linking={linking}>
              <StatusBar style="dark" />
              <AppNavigator />
            </NavigationContainer>
            {showStartupSplash ? <StartupSplash onDone={hideStartupSplash} /> : null}
          </View>
        </CartProvider>
      </FavoriteProvider>
    </NotificationProvider>
  );
}
