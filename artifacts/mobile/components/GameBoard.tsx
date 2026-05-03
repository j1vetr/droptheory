import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import React, { useEffect } from "react";
import { Platform, StyleSheet, View } from "react-native";

import PuffyBlock from "@/components/PuffyBlock";
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

export interface FallingCellAnim {
  fromRow: number;
  toRow: number;
  col: number;
  color: string;
}

export interface ParticleBurstAnim {
  row: number;
  col: number;
  color: string;
  intensity?: number;
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
  fallingCells?: FallingCellAnim[];
  particleBursts?: ParticleBurstAnim[];
}

const boardShadow = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.55,
    shadowRadius: 20,
  },
  android: { elevation: 16 },
  default: {},
});

// Scale-in overlay played briefly when a piece is placed
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
          zIndex: 10,
        },
        animStyle,
      ]}
    >
      <PuffyBlock color={color} size={cellSize} />
    </Animated.View>
  );
}

// Shimmer-dissolve overlay for cleared rows/columns
function AnimatedClearingCell({
  row,
  col,
  cellSize,
  color,
}: ClearingCellAnim & { cellSize: number }) {
  const progress = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    progress.value = withSequence(
      withTiming(1, { duration: 160 }),
      withTiming(0, { duration: 240 })
    );
    scale.value = withSequence(
      withTiming(1, { duration: 160 }),
      withTiming(1.12, { duration: 240 })
    );
  }, [progress, scale]);

  const animStyle = useAnimatedStyle(() => {
    const bg = interpolateColor(
      progress.value,
      [0, 0.5, 1],
      [color, "#E8D090", "rgba(232,208,144,0)"]
    );
    return {
      backgroundColor: bg,
      opacity: progress.value < 0.05 ? progress.value * 20 : 1,
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          top: row * cellSize + 1,
          left: col * cellSize + 1,
          width: cellSize - 2,
          height: cellSize - 2,
          borderRadius: 5,
          zIndex: 11,
        },
        animStyle,
      ]}
    />
  );
}

// Gravity fall: cell springs from its old row position into the final board position
function AnimatedFallingCell({
  fromRow,
  toRow,
  col,
  cellSize,
  color,
}: FallingCellAnim & { cellSize: number }) {
  const initialOffset = (fromRow - toRow) * cellSize;
  const translateY = useSharedValue(initialOffset);

  useEffect(() => {
    translateY.value = withSpring(0, {
      damping: 11,
      stiffness: 200,
      overshootClamping: false,
    });
  }, [translateY]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          top: toRow * cellSize,
          left: col * cellSize,
          width: cellSize,
          height: cellSize,
          zIndex: 5,
        },
        animStyle,
      ]}
    >
      <PuffyBlock color={color} size={cellSize} />
    </Animated.View>
  );
}

// Small colored squares that drift outward and fade when a line clears
function ParticleBurstCell({
  row,
  col,
  color,
  cellSize,
  intensity = 1,
}: ParticleBurstAnim & { cellSize: number }) {
  const count = Math.max(2, Math.round((3 + Math.floor(Math.random() * 4)) * intensity));
  const particles = React.useMemo(
    () =>
      Array.from({ length: count }, () => {
        const angle = Math.random() * Math.PI * 2;
        const dist = cellSize * (0.55 + Math.random() * 0.55) * intensity;
        return {
          dx: Math.cos(angle) * dist,
          dy: Math.sin(angle) * dist - cellSize * 0.15 * intensity,
          size: Math.max(3, cellSize * (0.14 + Math.random() * 0.08)),
          rot: (Math.random() - 0.5) * 180,
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: row * cellSize,
        left: col * cellSize,
        width: cellSize,
        height: cellSize,
        zIndex: 12,
      }}
    >
      {particles.map((p, i) => (
        <Particle
          key={i}
          dx={p.dx}
          dy={p.dy}
          size={p.size}
          rot={p.rot}
          color={color}
          centerX={cellSize / 2}
          centerY={cellSize / 2}
        />
      ))}
    </View>
  );
}

function Particle({
  dx,
  dy,
  size,
  rot,
  color,
  centerX,
  centerY,
}: {
  dx: number;
  dy: number;
  size: number;
  rot: number;
  color: string;
  centerX: number;
  centerY: number;
}) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const opacity = useSharedValue(0.95);
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    tx.value = withTiming(dx, { duration: 500 });
    ty.value = withTiming(dy, { duration: 500 });
    rotation.value = withTiming(rot, { duration: 500 });
    opacity.value = withSequence(
      withTiming(0.95, { duration: 60 }),
      withTiming(0, { duration: 440 })
    );
    scale.value = withTiming(0.4, { duration: 500 });
  }, [dx, dy, rot, opacity, rotation, scale, tx, ty]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          left: centerX - size / 2,
          top: centerY - size / 2,
          width: size,
          height: size,
          backgroundColor: color,
          borderRadius: 1.5,
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
  fallingCells = [],
  particleBursts = [],
}: Props) {
  const ghostMap = new Map<string, boolean>();
  for (const g of ghostCells) {
    if (g.row >= 0 && g.row < BOARD_SIZE && g.col >= 0 && g.col < BOARD_SIZE) {
      ghostMap.set(`${g.row},${g.col}`, g.isValid);
    }
  }

  const fallingDestSet = new Set(fallingCells.map((fc) => `${fc.toRow},${fc.col}`));
  const clearingSet = new Set(clearingCells.map((cc) => `${cc.row},${cc.col}`));

  return (
    <View style={[styles.boardOuter, boardShadow]}>
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
            const hiddenByFall = fallingDestSet.has(key);
            const hiddenByClear = clearingSet.has(key);

            return (
              <View
                key={key}
                style={[
                  styles.cell,
                  { width: cellSize, height: cellSize },
                  (!color || hiddenByFall || hiddenByClear) && styles.empty,
                  ghost !== undefined &&
                    (ghost ? styles.ghostValid : styles.ghostInvalid),
                ]}
              >
                {color && !hiddenByFall && !hiddenByClear && (
                  <View style={StyleSheet.absoluteFill}>
                    <PuffyBlock color={color} size={cellSize} />
                  </View>
                )}
              </View>
            );
          })
        )}

        {fallingCells.map((c) => (
          <AnimatedFallingCell
            key={`fall-${c.col}-${c.fromRow}`}
            fromRow={c.fromRow}
            toRow={c.toRow}
            col={c.col}
            color={c.color}
            cellSize={cellSize}
          />
        ))}

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

        {particleBursts.map((p, i) => (
          <ParticleBurstCell
            key={`burst-${p.row}-${p.col}-${i}`}
            row={p.row}
            col={p.col}
            color={p.color}
            intensity={p.intensity}
            cellSize={cellSize}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  boardOuter: {
    borderRadius: 18,
    backgroundColor: "#1B0F38",
    borderWidth: 1.5,
    borderColor: "rgba(200,169,110,0.30)",
    padding: 6,
  },
  board: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderRadius: 11,
    overflow: "hidden",
    position: "relative",
  },
  cell: {
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.05)",
    position: "relative",
    overflow: "hidden",
    borderRadius: 4,
  },
  empty: {
    backgroundColor: "rgba(255,255,255,0.025)",
  },
  ghostValid: {
    backgroundColor: "rgba(176,126,40,0.32)",
    borderColor: "rgba(200,169,110,0.65)",
    borderRadius: 5,
  },
  ghostInvalid: {
    backgroundColor: "rgba(168,78,80,0.22)",
    borderColor: "rgba(180,80,80,0.45)",
    borderRadius: 5,
  },
});
