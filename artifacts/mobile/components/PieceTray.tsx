import React from "react";
import { PanResponder, Platform, StyleSheet, Text, View } from "react-native";

import { GamePiece, getPieceBounds } from "@/utils/pieces";

interface Props {
  pieces: (GamePiece | null)[];
  panHandlers: (ReturnType<typeof PanResponder.create>["panHandlers"] | null)[];
  draggingIndex: number | null;
  cellSize: number;
}

const TRAY_CELL_SCALE = 0.6;
export const TRAY_HEIGHT = 168;

const slotShadow = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
  },
  android: { elevation: 5 },
  default: {},
});

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
                backgroundColor: piece.color,
                borderColor: "rgba(0,0,0,0.32)",
                borderWidth: 1,
                borderRadius: 7,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "44%",
                  backgroundColor: "rgba(255,255,255,0.36)",
                  borderTopLeftRadius: 6,
                  borderTopRightRadius: 6,
                }}
              />
              <View
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "28%",
                  backgroundColor: "rgba(0,0,0,0.42)",
                  borderBottomLeftRadius: 6,
                  borderBottomRightRadius: 6,
                }}
              />
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
        return (
          <View key={idx} style={styles.column}>
            <View
              style={[styles.slot, slotShadow, consumed && styles.slotConsumed]}
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
            <View style={styles.slotLabel}>
              <View
                style={[
                  styles.slotPip,
                  consumed && styles.slotPipConsumed,
                ]}
              />
              <Text
                style={[
                  styles.slotIndex,
                  consumed && styles.slotIndexConsumed,
                ]}
              >
                {idx + 1}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const SLOT_HEIGHT = 130;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    width: "100%",
    height: TRAY_HEIGHT,
    paddingHorizontal: 4,
    gap: 10,
  },
  column: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  slot: {
    width: "100%",
    height: SLOT_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.035)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  slotConsumed: {
    backgroundColor: "rgba(255,255,255,0.018)",
    borderColor: "rgba(255,255,255,0.05)",
  },
  emptyDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.2,
    borderColor: "rgba(255,255,255,0.10)",
    borderStyle: "dashed",
  },
  slotLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingTop: 2,
  },
  slotPip: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#B07E28",
  },
  slotPipConsumed: {
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  slotIndex: {
    fontSize: 9,
    fontFamily: "Inter_600SemiBold",
    color: "#7A7266",
    letterSpacing: 2,
  },
  slotIndexConsumed: {
    color: "rgba(122,114,102,0.4)",
  },
});
