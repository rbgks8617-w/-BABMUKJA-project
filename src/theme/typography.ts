import { Platform } from "react-native";

export const BRAND_FONT_FAMILY = "GabiaSolmee";
export const APP_FONT_FAMILY = Platform.select({
  ios: "System",
  android: "sans-serif",
  default: '"Pretendard", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif',
});

export const roundedTextStyle = {
  fontFamily: APP_FONT_FAMILY,
};
