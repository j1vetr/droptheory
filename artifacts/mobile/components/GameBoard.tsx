import React from "react";
import { StyleSheet, View } from "react-native";

import { BOARD_SIZE, Board } from "@/utils/gameEngine";

interface GhostCell {
  row: number;
  col: number;
  isValid: boolean;
}

interface Props {
  board: Board;
  ghostCells?: GhostCell[];
  cellSize: number;
}

export default function GameBoard({ board, ghostCells = [], cellSize }: Props) {
  const ghostMap = new Map<string, boolean>();
  for (const g of ghostCells) {
    if (g.row >= 0 && g.row < BOARD_SIZE && g.col >= 0 && g.col < BOARD_SIZE) {
      ghostMap.set(`${g.row},${g.col}`, g.isValid);
    }
  }

  return (
    <View style={[styles.board, { width: cellSize * BOARD_SIZE, height: cellSize * BOARD_SIZE }]}>
      {Array.from({ length: BOARD_SIZE }, (_, row) =>
        Array.from({ length: BOARD_SIZE }, (_, col) => {
          const key = `${row},${col}`;
          const color = board[row][col];
          const ghost = ghostMap.get(key);
          const isGhost = ghost !== undefined;
          const ghostValid = ghost === true;

          return (
            <View
              key={key}
              style={[
                styles.cell,
                { width: cellSize, height: cellSize },
                color
                  ? [styles.filled, { backgroundColor: color }]
                  : styles.empty,
                isGhost &&
                  (ghostValid ? styles.ghostValid : styles.ghostInvalid),
              ]}
            >
              {color && (
                <View
                  style={[
                    styles.cellHighlight,
                    { backgroundColor: "rgba(255,255,255,0.12)" },
                  ]}
                />
              )}
            </View>
          );
        })
      )}
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
