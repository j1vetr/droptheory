import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View } from "react-native";

interface Props {
  color: string;
  size: number;
  radius?: number;
  showSpecular?: boolean;
}

/**
 * Realistic 3D-looking block with:
 *  - Base color
 *  - Diagonal volumetric sheen (top-left bright → bottom-right dark)
 *  - Top inner-edge highlight stripe (bevel)
 *  - Bottom inner-edge dark chamfer
 *  - Optional small specular dot (only on larger blocks)
 *  - Outer dark contour border for separation
 */
export default function PuffyBlock({ color, size, radius, showSpecular }: Props) {
  const r = radius ?? Math.max(5, size * 0.22);
  const innerR = Math.max(2, r - 1);
  const includeSpecular = showSpecular ?? size >= 22;

  return (
    <View
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: r,
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.34)",
        overflow: "hidden",
      }}
    >
      {/* Volumetric diagonal sheen — single light source from upper-left */}
      <LinearGradient
        colors={[
          "rgba(255,255,255,0.55)",
          "rgba(255,255,255,0.18)",
          "rgba(255,255,255,0.00)",
          "rgba(0,0,0,0.20)",
          "rgba(0,0,0,0.42)",
        ]}
        locations={[0, 0.18, 0.5, 0.82, 1]}
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
          backgroundColor: "rgba(255,255,255,0.30)",
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
          height: Math.max(2, size * 0.12),
          backgroundColor: "rgba(0,0,0,0.30)",
          borderBottomLeftRadius: innerR,
          borderBottomRightRadius: innerR,
        }}
      />

      {/* Specular hot-spot — only for larger blocks */}
      {includeSpecular && (
        <View
          style={{
            position: "absolute",
            top: size * 0.14,
            left: size * 0.16,
            width: size * 0.30,
            height: size * 0.16,
            borderRadius: size * 0.10,
            backgroundColor: "rgba(255,255,255,0.42)",
          }}
        />
      )}
    </View>
  );
}
