import React from "react";
import { PanResponder, StyleSheet, Text, View } from "react-native";

import PuffyBlock from "@/components/PuffyBlock";
import { GamePiece, getPieceBounds } from "@/utils/pieces";

interface Props {
  pieces: (GamePiece | null)[];
  panHandlers: (ReturnType<typeof PanResponder.create>["panHandlers"] | null)[];
  draggingIndex: number | null;
  cellSize: number;
}

const TRAY_CELL_SCALE = 0.62;
export const TRAY_HEIGHT = 158;
const SLOT_HEIGHT = 118;

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
  const cells = new Set(
    piece.shape.map(([r, c]) => `${r - bounds.minRow},${c - bounds.minCol}`)
  );

  return (
    <View
      style={{
        width: bounds.cols * cs,
        height: bounds.rows * cs,
        opacity: dimmed ? 0.22 : 1,
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
                width: cs,
                height: cs,
                left: c * cs,
                top: r * cs,
              }}
            >
              <PuffyBlock color={piece.color} size={cs} />
            </View>
          );
        })
      )}
    </View>
  );
}

export default function PieceTray({
  pieces,
  panHandlers,
  draggingIndex,
  cellSize,
}: Props) {
  return (
    <View style={styles.row}>
      {[0, 1, 2].map((idx) => {
        const piece = pieces[idx];
        const handlers = panHandlers[idx];
        const consumed = !piece;
        const accentColor = piece ? piece.color : "rgba(255,255,255,0.18)";
        return (
          <View key={idx} style={styles.column}>
            <View
              style={styles.slot}
              {...(handlers && piece ? handlers : {})}
            >
              {piece ? (
                <PiecePreview
                  piece={piece}
                  cellSize={cellSize}
                  dimmed={draggingIndex === idx}
                />
              ) : (
                <View style={styles.emptyDot} />
              )}
            </View>
            <View style={styles.labelRow}>
              <View
                style={[
                  styles.rule,
                  { backgroundColor: consumed ? "rgba(255,255,255,0.06)" : accentColor },
                ]}
              />
              <Text
                style={[
                  styles.slotIndex,
                  { color: consumed ? "rgba(122,114,102,0.5)" : accentColor },
                ]}
              >
                0{idx + 1}
              </Text>
              <View
                style={[
                  styles.rule,
                  { backgroundColor: consumed ? "rgba(255,255,255,0.06)" : accentColor },
                ]}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    width: "100%",
    height: TRAY_HEIGHT,
    paddingHorizontal: 4,
    gap: 14,
  },
  column: {
    flex: 1,
    alignItems: "center",
    gap: 10,
  },
  slot: {
    width: "100%",
    height: SLOT_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    borderStyle: "dashed",
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "100%",
    paddingHorizontal: 6,
  },
  rule: {
    flex: 1,
    height: 1,
    opacity: 0.7,
  },
  slotIndex: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2.5,
  },
});
