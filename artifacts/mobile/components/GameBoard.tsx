import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";

import { BOARD_SIZE, Board } from "@/utils/gameEngine";

export interface PlacedCellAnim {
  row: number;
  col: number;
  color: string;
}

export interface ClearingCellAnim {
  row: number;
  col: number;
  color: string;
}

interface GhostCell {
  row: number;
  col: number;
  isValid: boolean;
}

interface Props {
  board: Board;
  ghostCells?: GhostCell[];
  cellSize: number;
  placedCells?: PlacedCellAnim[];
  clearingCells?: ClearingCellAnim[];
}

function AnimatedPlacedCell({
  row,
  col,
  cellSize,
  color,
}: PlacedCellAnim & { cellSize: number }) {
  const scale = useSharedValue(0.25);
  const opacity = useSharedValue(0.9);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 9, stiffness: 280 });
    opacity.value = withSequence(
      withTiming(0.9, { duration: 80 }),
      withTiming(0, { duration: 260 })
    );
  }, [opacity, scale]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          top: row * cellSize,
          left: col * cellSize,
          width: cellSize,
          height: cellSize,
          backgroundColor: color,
          borderRadius: 3,
          zIndex: 10,
        },
        animStyle,
      ]}
    />
  );
}

function AnimatedClearingCell({
  row,
  col,
  cellSize,
  color,
}: ClearingCellAnim & { cellSize: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withSequence(
      withTiming(1, { duration: 190 }),
      withTiming(0, { duration: 220 })
    );
  }, [progress]);

  const animStyle = useAnimatedStyle(() => {
    const bg = interpolateColor(
      progress.value,
      [0, 0.6, 1],
      [color, "#C8A96E", "rgba(200,169,110,0)"]
    );
    return {
      backgroundColor: bg,
      opacity: progress.value < 0.05 ? progress.value * 20 : 1,
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          top: row * cellSize + 0.5,
          left: col * cellSize + 0.5,
          width: cellSize - 1,
          height: cellSize - 1,
          zIndex: 11,
        },
        animStyle,
      ]}
    />
  );
}

export default function GameBoard({
  board,
  ghostCells = [],
  cellSize,
  placedCells = [],
  clearingCells = [],
}: Props) {
  const ghostMap = new Map<string, boolean>();
  for (const g of ghostCells) {
    if (g.row >= 0 && g.row < BOARD_SIZE && g.col >= 0 && g.col < BOARD_SIZE) {
      ghostMap.set(`${g.row},${g.col}`, g.isValid);
    }
  }

  return (
    <View
      style={[
        styles.board,
        { width: cellSize * BOARD_SIZE, height: cellSize * BOARD_SIZE },
      ]}
    >
      {Array.from({ length: BOARD_SIZE }, (_, row) =>
        Array.from({ length: BOARD_SIZE }, (_, col) => {
          const key = `${row},${col}`;
          const color = board[row][col];
          const ghost = ghostMap.get(key);

          return (
            <View
              key={key}
              style={[
                styles.cell,
                { width: cellSize, height: cellSize },
                color
                  ? [styles.filled, { backgroundColor: color }]
                  : styles.empty,
                ghost !== undefined &&
                  (ghost ? styles.ghostValid : styles.ghostInvalid),
              ]}
            >
              {color && <View style={styles.cellHighlight} />}
            </View>
          );
        })
      )}

      {placedCells.map((c) => (
        <AnimatedPlacedCell
          key={`placed-${c.row}-${c.col}`}
          row={c.row}
          col={c.col}
          color={c.color}
          cellSize={cellSize}
        />
      ))}

      {clearingCells.map((c) => (
        <AnimatedClearingCell
          key={`clear-${c.row}-${c.col}`}
          row={c.row}
          col={c.col}
          color={c.color}
          cellSize={cellSize}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderRadius: 4,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    position: "relative",
  },
  cell: {
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.06)",
    position: "relative",
    overflow: "hidden",
  },
  filled: {
    borderColor: "rgba(255,255,255,0.10)",
  },
  empty: {
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  cellHighlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "35%",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  ghostValid: {
    backgroundColor: "rgba(200,169,110,0.30)",
    borderColor: "rgba(200,169,110,0.60)",
  },
  ghostInvalid: {
    backgroundColor: "rgba(180,60,60,0.25)",
    borderColor: "rgba(180,60,60,0.50)",
  },
});
