import React from "react";
import { Image as ExpoImage } from "expo-image";
import type { ImageStyle, StyleProp } from "react-native";

const placeholder = { blurhash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4" };

type CachedRemoteImageProps = {
  uri: string;
  style: StyleProp<ImageStyle>;
  contentFit?: "cover" | "contain";
};

export default function CachedRemoteImage({ uri, style, contentFit = "cover" }: CachedRemoteImageProps) {
  return (
    <ExpoImage
      source={{ uri }}
      style={style}
      contentFit={contentFit}
      cachePolicy="memory-disk"
      placeholder={placeholder}
      transition={160}
    />
  );
}
