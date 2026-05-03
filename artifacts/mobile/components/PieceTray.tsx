import React from "react";
import { PanResponder, StyleSheet, View } from "react-native";

import { GamePiece, getPieceBounds } from "@/utils/pieces";

interface Props {
  pieces: (GamePiece | null)[];
  panHandlers: (ReturnType<typeof PanResponder.create>["panHandlers"] | null)[];
  draggingIndex: number | null;
  cellSize: number;
}

const TRAY_CELL_SCALE = 0.82;

function PiecePreview({
  piece,
  cellSize,
  dimmed,
}: {
  piece: GamePiece;
  cellSize: number;
  dimmed: boolean;
}) {
  const cs = cellSize * TRAY_CELL_SCALE;
  const bounds = getPieceBounds(piece.shape);

  const cells = new Set(piece.shape.map(([r, c]) => `${r - bounds.minRow},${c - bounds.minCol}`));

  return (
    <View
      style={{
        width: bounds.cols * cs,
        height: bounds.rows * cs,
        opacity: dimmed ? 0.25 : 1,
      }}
    >
      {Array.from({ length: bounds.rows }, (_, r) =>
        Array.from({ length: bounds.cols }, (_, c) => {
          const filled = cells.has(`${r},${c}`);
          return (
            <View
              key={`${r},${c}`}
              style={[
                styles.previewCell,
                {
                  width: cs,
                  height: cs,
                  left: c * cs,
                  top: r * cs,
                  backgroundColor: filled ? piece.color : "transparent",
                  borderColor: filled ? "rgba(255,255,255,0.12)" : "transparent",
                  borderWidth: filled ? 0.5 : 0,
                  borderRadius: 2,
                  overflow: "hidden",
                },
              ]}
            >
              {filled && (
                <View
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "35%",
                    backgroundColor: "rgba(255,255,255,0.14)",
                    borderTopLeftRadius: 2,
                    borderTopRightRadius: 2,
                  }}
                />
              )}
            </View>
          );
        })
      )}
    </View>
  );
}

export default function PieceTray({ pieces, panHandlers, draggingIndex, cellSize }: Props) {
  return (
    <View style={styles.tray}>
      {[0, 1, 2].map((idx) => {
        const piece = pieces[idx];
        const handlers = panHandlers[idx];
        return (
          <View
            key={idx}
            style={styles.slot}
            {...(handlers && piece ? handlers : {})}
          >
            {piece ? (
              <View style={styles.pieceCenter}>
                <PiecePreview
                  piece={piece}
                  cellSize={cellSize}
                  dimmed={draggingIndex === idx}
                />
              </View>
            ) : (
              <View style={styles.emptySlot} />
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tray: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 8,
    flex: 1,
  },
  slot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    minHeight: 80,
  },
  pieceCenter: {
    alignItems: "center",
    justifyContent: "center",
  },
  previewCell: {
    position: "absolute",
  },
  emptySlot: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.06)",
    borderStyle: "dashed",
  },
});
