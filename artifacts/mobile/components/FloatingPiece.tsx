import React from "react";
import { StyleSheet, View } from "react-native";

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
                }}
              >
                <PuffyBlock color={piece.color} size={cellSize - 1} />
              </View>
            );
          })
        )}
      </View>
    </View>
  );
}
