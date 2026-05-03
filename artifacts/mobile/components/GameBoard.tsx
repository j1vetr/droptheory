import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
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
  color: string;
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

const GAP = 0.5;

function blockBox(cellSize: number, row: number, col: number) {
  return {
    position: "absolute" as const,
    top: row * cellSize + GAP,
    left: col * cellSize + GAP,
    width: cellSize - GAP * 2,
    height: cellSize - GAP * 2,
  };
}

// Block lands with a quick scale-in pop with subtle overshoot
function AnimatedPlacedCell({
  row,
  col,
  cellSize,
  color,
}: PlacedCellAnim & { cellSize: number }) {
  const scale = useSharedValue(0.88);

  useEffect(() => {
    scale.value = withTiming(1, {
      duration: 160,
      easing: Easing.out(Easing.cubic),
    });
  }, [scale]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const inner = cellSize - GAP * 2;
  return (
    <Animated.View
      pointerEvents="none"
      style={[blockBox(cellSize, row, col), { zIndex: 10 }, animStyle]}
    >
      <PuffyBlock color={color} size={inner} />
    </Animated.View>
  );
}

// Cleared cells: tiny overshoot pop, then scale down + fade out
function AnimatedClearingCell({
  row,
  col,
  cellSize,
  color,
}: ClearingCellAnim & { cellSize: number }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    scale.value = withSequence(
      withTiming(1.18, { duration: 110, easing: Easing.out(Easing.quad) }),
      withTiming(0.3, { duration: 270, easing: Easing.in(Easing.quad) })
    );
    opacity.value = withSequence(
      withTiming(1, { duration: 110 }),
      withTiming(0, { duration: 270, easing: Easing.in(Easing.quad) })
    );
  }, [opacity, scale]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const inner = cellSize - GAP * 2;
  return (
    <Animated.View
      pointerEvents="none"
      style={[blockBox(cellSize, row, col), { zIndex: 11 }, animStyle]}
    >
      <PuffyBlock color={color} size={inner} />
    </Animated.View>
  );
}

// Falls naturally, then a tiny vertical bounce on landing
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
    translateY.value = withSequence(
      withTiming(0, { duration: 280, easing: Easing.in(Easing.quad) }),
      withTiming(-3, { duration: 80, easing: Easing.out(Easing.quad) }),
      withTiming(0, { duration: 110, easing: Easing.out(Easing.quad) })
    );
  }, [translateY]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const inner = cellSize - GAP * 2;
  return (
    <Animated.View
      pointerEvents="none"
      style={[blockBox(cellSize, toRow, col), { zIndex: 5 }, animStyle]}
    >
      <PuffyBlock color={color} size={inner} />
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
  const ghostMap = new Map<string, { isValid: boolean; color: string }>();
  for (const g of ghostCells) {
    if (g.row >= 0 && g.row < BOARD_SIZE && g.col >= 0 && g.col < BOARD_SIZE) {
      ghostMap.set(`${g.row},${g.col}`, { isValid: g.isValid, color: g.color });
    }
  }

  const fallingDestSet = new Set(fallingCells.map((fc) => `${fc.toRow},${fc.col}`));
  const clearingSet = new Set(clearingCells.map((cc) => `${cc.row},${cc.col}`));
  const placedSet = new Set(placedCells.map((pc) => `${pc.row},${pc.col}`));

  const inner = cellSize - GAP * 2;

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
            const inPlaced = placedSet.has(key);
            const showStatic = !!color && !hiddenByFall && !hiddenByClear && !inPlaced;
            const showGhost = !color && !!ghost;
            const isEmpty = !showStatic && !showGhost;

            return (
              <View
                key={key}
                style={[
                  styles.cell,
                  { width: cellSize, height: cellSize },
                  isEmpty && styles.empty,
                ]}
              >
                {showStatic && (
                  <View
                    style={{
                      position: "absolute",
                      top: GAP,
                      left: GAP,
                      width: inner,
                      height: inner,
                    }}
                  >
                    <PuffyBlock color={color!} size={inner} />
                  </View>
                )}
                {showGhost && (
                  <View
                    style={{
                      position: "absolute",
                      top: GAP,
                      left: GAP,
                      width: inner,
                      height: inner,
                      opacity: ghost!.isValid ? 0.45 : 0.55,
                    }}
                  >
                    <PuffyBlock
                      color={ghost!.isValid ? ghost!.color : "#E14A3F"}
                      size={inner}
                    />
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
    borderRadius: 0,
    backgroundColor: "#1B0F38",
    borderWidth: 1.5,
    borderColor: "rgba(200,169,110,0.30)",
    padding: 6,
    overflow: "hidden",
  },
  board: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderRadius: 0,
    overflow: "hidden",
    position: "relative",
  },
  cell: {
    position: "relative",
    overflow: "hidden",
  },
  empty: {
    backgroundColor: "rgba(255,255,255,0.025)",
  },
});
