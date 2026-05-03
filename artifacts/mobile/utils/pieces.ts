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

export const BLOCK_COLORS = [
  "#1A5757",
  "#1A3A58",
  "#371A58",
  "#254A25",
  "#4A2020",
  "#4A4A1A",
  "#1A3A4A",
  "#3A2040",
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
