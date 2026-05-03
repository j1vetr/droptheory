export type Shape = [number, number][];

export interface GamePiece {
  id: string;
  shape: Shape;
  color: string;
}

const PIECE_SHAPES: Shape[] = [
  // 1-cell
  [[0, 0]],
  // 2-cell horizontal
  [[0, 0], [0, 1]],
  // 2-cell vertical
  [[0, 0], [1, 0]],
  // 3-cell horizontal
  [[0, 0], [0, 1], [0, 2]],
  // 3-cell vertical
  [[0, 0], [1, 0], [2, 0]],
  // 2x2 square
  [[0, 0], [0, 1], [1, 0], [1, 1]],
  // Corner shapes
  [[0, 0], [1, 0], [1, 1]],
  [[0, 1], [1, 0], [1, 1]],
  [[0, 0], [0, 1], [1, 1]],
  [[0, 0], [0, 1], [1, 0]],
  // L shapes
  [[0, 0], [1, 0], [2, 0], [2, 1]],
  [[0, 0], [1, 0], [2, 0], [0, 1]],
  [[0, 1], [1, 1], [2, 0], [2, 1]],
  [[0, 0], [0, 1], [1, 0], [2, 0]],
  // T shape
  [[0, 0], [0, 1], [0, 2], [1, 1]],
  [[0, 1], [1, 0], [1, 1], [2, 1]],
  // S/Z shape
  [[0, 1], [0, 2], [1, 0], [1, 1]],
  [[0, 0], [0, 1], [1, 1], [1, 2]],
  // 4-cell line
  [[0, 0], [0, 1], [0, 2], [0, 3]],
  [[0, 0], [1, 0], [2, 0], [3, 0]],
  // Plus sign
  [[0, 1], [1, 0], [1, 1], [1, 2], [2, 1]],
  // 2x3 block
  [[0, 0], [0, 1], [1, 0], [1, 1], [0, 2]],
  // Diagonal stair
  [[0, 0], [1, 0], [1, 1], [2, 1]],
  [[0, 1], [1, 0], [1, 1], [2, 0]],
];

// Rich, saturated-but-calm palette — premium puzzle tile colors
export const BLOCK_COLORS = [
  "#2D6494", // deep ocean blue
  "#B05730", // warm terracotta
  "#4B7A5A", // sage green
  "#2E7B8A", // dusty teal
  "#B07E28", // warm amber
  "#A84E6E", // dusty rose
  "#6A59A4", // soft lavender
  "#327068", // seafoam green
];

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
}

export function generateRandomPiece(): GamePiece {
  const shape = PIECE_SHAPES[Math.floor(Math.random() * PIECE_SHAPES.length)];
  const color = BLOCK_COLORS[Math.floor(Math.random() * BLOCK_COLORS.length)];
  return { id: generateId(), shape, color };
}

export function generateThreePieces(): [GamePiece, GamePiece, GamePiece] {
  return [generateRandomPiece(), generateRandomPiece(), generateRandomPiece()];
}

export function getPieceBounds(shape: Shape): {
  rows: number;
  cols: number;
  minRow: number;
  minCol: number;
} {
  const rows = shape.map(([r]) => r);
  const cols = shape.map(([, c]) => c);
  const minRow = Math.min(...rows);
  const minCol = Math.min(...cols);
  return {
    rows: Math.max(...rows) - minRow + 1,
    cols: Math.max(...cols) - minCol + 1,
    minRow,
    minCol,
  };
}
