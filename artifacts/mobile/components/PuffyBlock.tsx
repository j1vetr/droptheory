import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View } from "react-native";

interface Props {
  color: string;
  size: number;
  radius?: number;
}

function lighten(hex: string, amount: number, alpha = 0.55): string {
  const h = hex.replace("#", "");
  if (h.length !== 6) return `rgba(255,255,255,${alpha})`;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const lr = Math.round(r + (255 - r) * amount);
  const lg = Math.round(g + (255 - g) * amount);
  const lb = Math.round(b + (255 - b) * amount);
  return `rgba(${lr},${lg},${lb},${alpha})`;
}

/**
 * Lightweight grid block:
 *  - Sharp corners (small radius), grid-friendly
 *  - One subtle diagonal gradient for depth (top-left highlight, bottom-right shade)
 *  - Lighter-tint hairline border in the block's own color family
 *  - No top bevel rectangle, no specular dot — keeps it clean and fast
 */
export default function PuffyBlock({ color, size, radius }: Props) {
  const r = radius ?? Math.max(2, Math.min(6, size * 0.10));
  const borderColor = lighten(color, 0.40, 0.60);

  return (
    <View
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: r,
        borderWidth: 1,
        borderColor,
        overflow: "hidden",
      }}
    >
      <LinearGradient
        colors={[
          "rgba(255,255,255,0.32)",
          "rgba(255,255,255,0.00)",
          "rgba(0,0,0,0.28)",
        ]}
        locations={[0, 0.5, 1]}
        start={{ x: 0.25, y: 0 }}
        end={{ x: 0.75, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}
