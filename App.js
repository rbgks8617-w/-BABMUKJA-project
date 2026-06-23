import React, { useEffect } from "react";
import { Platform, Text, TextInput, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import AppNavigator from "./src/navigation/AppNavigator";
import { CartProvider } from "./src/store/CartContext";
import { colors } from "./src/theme/colors";
import { roundedTextStyle } from "./src/theme/typography";

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
    `;
    document.head.appendChild(style);
  }, []);

  if (!fontsLoaded && Platform.OS !== "web") {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <CartProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <AppNavigator />
      </NavigationContainer>
    </CartProvider>
  );
}
