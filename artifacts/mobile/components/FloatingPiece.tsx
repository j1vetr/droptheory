import React from "react";
import { StyleSheet, View } from "react-native";

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

  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFillObject, { zIndex: 999 }]}
    >
      <View
        style={{
          position: "absolute",
          left: pageX - cellSize * 0.5,
          top: pageY - cellSize * 0.5,
          width: bounds.cols * cellSize,
          height: bounds.rows * cellSize,
          opacity: invalid ? 0.42 : 0.95,
          transform: [{ scale: 1.10 }],
        }}
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
                  backgroundColor: piece.color,
                  borderRadius: 6,
                  borderWidth: 0.8,
                  borderColor: "rgba(255,255,255,0.20)",
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    position: "absolute",
                    top: 0, left: 0, right: 0,
                    height: "36%",
                    backgroundColor: "rgba(255,255,255,0.26)",
                    borderTopLeftRadius: 5,
                    borderTopRightRadius: 5,
                  }}
                />
                <View
                  style={{
                    position: "absolute",
                    bottom: 0, left: 0, right: 0,
                    height: "22%",
                    backgroundColor: "rgba(0,0,0,0.32)",
                    borderBottomLeftRadius: 5,
                    borderBottomRightRadius: 5,
                  }}
                />
              </View>
            );
          })
        )}
      </View>
    </View>
  );
}
