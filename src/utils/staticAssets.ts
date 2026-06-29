import { Platform } from "react-native";
import type { ImageSourcePropType } from "react-native";

function webAsset(fileName: string): ImageSourcePropType {
  return { uri: `./assets/assets/${fileName}` };
}

export const tukLogoSource =
  Platform.OS === "web"
    ? webAsset("tuk-logo.eb6ac9385435cd4a3425640152c0e676.png")
    : require("../../assets/tuk-logo.png");

export const tukSymbolSource =
  Platform.OS === "web"
    ? webAsset("tuk-symbol.c196af7adb5fc12c22b08e9881a43851.png")
    : require("../../assets/tuk-symbol.png");

export const campusMapSource =
  Platform.OS === "web"
    ? webAsset("tuk-campus-map.05442ec7b18904b8c2ec086df5dc464d.png")
    : require("../../assets/tuk-campus-map.png");

export const lunchboxRecommendationSource =
  Platform.OS === "web"
    ? webAsset("lunchbox-recommendation.174b6486f41f7aad192a9c23b8f7991f.png")
    : require("../../assets/lunchbox-recommendation.png");

export const heartEmptySource =
  Platform.OS === "web"
    ? webAsset("heart-empty.35ec6d3935f7b9ee4d1f39721edecd2a.png")
    : require("../../assets/heart-empty.png");

export const heartFilledSource =
  Platform.OS === "web"
    ? webAsset("heart-filled.6fc32ec402be6aaa930e487e967b9850.png")
    : require("../../assets/heart-filled.png");
