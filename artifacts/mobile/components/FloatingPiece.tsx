import React from "react";
import { StyleSheet, View } from "react-native";

import { GamePiece, getPieceBounds } from "@/utils/pieces";

interface Props {
  piece: GamePiece;
  pageX: number;
  pageY: number;
  cellSize: number;
}

export default function FloatingPiece({ piece, pageX, pageY, cellSize }: Props) {
  const bounds = getPieceBounds(piece.shape);
  const cells = new Set(piece.shape.map(([r, c]) => `${r - bounds.minRow},${c - bounds.minCol}`));

  return (
    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFillObject,
        { zIndex: 999 },
      ]}
    >
      <View
        style={{
          position: "absolute",
          left: pageX - cellSize * 0.5,
          top: pageY - cellSize * 0.5,
          width: bounds.cols * cellSize,
          height: bounds.rows * cellSize,
          opacity: 0.9,
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
                  borderRadius: 3,
                  borderWidth: 0.5,
                  borderColor: "rgba(255,255,255,0.15)",
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "35%",
                    backgroundColor: "rgba(255,255,255,0.18)",
                    borderTopLeftRadius: 3,
                    borderTopRightRadius: 3,
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
