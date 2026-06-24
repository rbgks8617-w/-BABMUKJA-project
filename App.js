import React, { useEffect } from "react";
import { Platform, Text, TextInput, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import AppNavigator from "./src/navigation/AppNavigator";
import { CartProvider } from "./src/store/CartContext";
import { NotificationProvider } from "./src/store/NotificationContext";
import { colors } from "./src/theme/colors";
import { roundedTextStyle } from "./src/theme/typography";

const webOrigin = typeof window === "undefined" ? "" : window.location.origin;

const linking = {
  prefixes: ["babmukja://", webOrigin].filter(Boolean),
  config: {
    screens: {
      Splash: "",
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

function applyDefaultFont(Component) {
  Component.defaultProps = Component.defaultProps || {};
  Component.defaultProps.style = [Component.defaultProps.style, roundedTextStyle];
}

applyDefaultFont(Text);
applyDefaultFont(TextInput);

export default function App() {
  const [fontsLoaded] = useFonts({
    GowunDodum: require("./assets/fonts/GowunDodum-Regular.ttf"),
  });

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
        font-family: "GowunDodum", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif !important;
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
      <CartProvider>
        <NavigationContainer linking={linking}>
          <StatusBar style="dark" />
          <AppNavigator />
        </NavigationContainer>
      </CartProvider>
    </NotificationProvider>
  );
}
