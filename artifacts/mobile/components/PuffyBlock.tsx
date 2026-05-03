import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View } from "react-native";

interface Props {
  color: string;
  size: number;
  radius?: number;
  showSpecular?: boolean;
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
 * Premium 3D-looking block with:
 *  - Base color
 *  - Diagonal volumetric sheen (top-left bright → bottom-right dark)
 *  - Top inner-edge highlight stripe (bevel)
 *  - Bottom inner-edge dark chamfer
 *  - Hairline lighter-tint border in the block's own color family
 *  - Optional small specular dot on larger blocks
 */
export default function PuffyBlock({ color, size, radius, showSpecular }: Props) {
  const r = radius ?? Math.max(4, size * 0.20);
  const innerR = Math.max(2, r - 1);
  const includeSpecular = showSpecular ?? size >= 22;
  const borderColor = lighten(color, 0.45, 0.55);

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
      {/* Volumetric diagonal sheen — single light source from upper-left */}
      <LinearGradient
        colors={[
          "rgba(255,255,255,0.55)",
          "rgba(255,255,255,0.18)",
          "rgba(255,255,255,0.00)",
          "rgba(0,0,0,0.18)",
          "rgba(0,0,0,0.36)",
        ]}
        locations={[0, 0.20, 0.55, 0.85, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Top inner-edge highlight (bevel) */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: Math.max(2, size * 0.10),
          backgroundColor: "rgba(255,255,255,0.32)",
          borderTopLeftRadius: innerR,
          borderTopRightRadius: innerR,
        }}
      />

      {/* Bottom inner-edge chamfer */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: Math.max(2, size * 0.13),
          backgroundColor: "rgba(0,0,0,0.28)",
          borderBottomLeftRadius: innerR,
          borderBottomRightRadius: innerR,
        }}
      />

      {/* Specular hot-spot — only for larger blocks */}
      {includeSpecular && (
        <View
          style={{
            position: "absolute",
            top: size * 0.13,
            left: size * 0.16,
            width: size * 0.32,
            height: size * 0.15,
            borderRadius: size * 0.10,
            backgroundColor: "rgba(255,255,255,0.45)",
          }}
        />
      )}
    </View>
  );
}
