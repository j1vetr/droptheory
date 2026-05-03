import React, { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import PuffyBlock from "@/components/PuffyBlock";
import { GamePiece, getPieceBounds } from "@/utils/pieces";

interface Props {
  piece: GamePiece;
  pageX: number;
  pageY: number;
  cellSize: number;
  isValid?: boolean;
}

export default function FloatingPiece({ piece, pageX, pageY, cellSize, isValid }: Props) {
  const bounds = getPieceBounds(piece.shape);
  const cells = new Set(piece.shape.map(([r, c]) => `${r - bounds.minRow},${c - bounds.minCol}`));
  const invalid = isValid === false;

  const shake = useSharedValue(0);
  const prevInvalid = useRef(false);

  useEffect(() => {
    if (invalid && !prevInvalid.current) {
      shake.value = withSequence(
        withTiming(-5, { duration: 50, easing: Easing.linear }),
        withTiming(5, { duration: 50 }),
        withTiming(-3, { duration: 40 }),
        withTiming(3, { duration: 40 }),
        withTiming(0, { duration: 50 })
      );
    }
    prevInvalid.current = invalid;
  }, [invalid, shake]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }, { scale: 1.10 }],
  }));

  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFillObject, { zIndex: 999 }]}
    >
      <Animated.View
        style={[
          {
            position: "absolute",
            left: pageX - cellSize * 0.5,
            top: pageY - cellSize * 0.5,
            width: bounds.cols * cellSize,
            height: bounds.rows * cellSize,
            opacity: invalid ? 0.55 : 0.95,
          },
          animStyle,
        ]}
      >
        {Array.from({ length: bounds.rows }, (_, r) =>
          Array.from({ length: bounds.cols }, (_, c) => {
            const filled = cells.has(`${r},${c}`);
            if (!filled) return null;
            return (
              <View
                key={`${r},${c}`}
                style={{
                  position: "absolute",
                  left: c * cellSize,
                  top: r * cellSize,
                  width: cellSize - 1,
                  height: cellSize - 1,
                }}
              >
                <PuffyBlock color={piece.color} size={cellSize - 1} />
              </View>
            );
          })
        )}
      </Animated.View>
    </View>
  );
}
