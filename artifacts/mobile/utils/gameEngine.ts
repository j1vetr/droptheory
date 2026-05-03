import { GamePiece, Shape } from "@/utils/pieces";

export const BOARD_SIZE = 8;
export type Board = (string | null)[][];

export function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array(BOARD_SIZE).fill(null)
  );
}

export function isValidPlacement(
  board: Board,
  shape: Shape,
  row: number,
  col: number
): boolean {
  for (const [dr, dc] of shape) {
    const r = row + dr;
    const c = col + dc;
    if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) return false;
    if (board[r][c] !== null) return false;
  }
  return true;
}

export function placePiece(
  board: Board,
  shape: Shape,
  row: number,
  col: number,
  color: string
): Board {
  const newBoard = board.map((r) => [...r]);
  for (const [dr, dc] of shape) {
    newBoard[row + dr][col + dc] = color;
  }
  return newBoard;
}

export function findFullLines(board: Board): {
  rows: number[];
  cols: number[];
} {
  const rows: number[] = [];
  const cols: number[] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    if (board[r].every((cell) => cell !== null)) rows.push(r);
  }
  for (let c = 0; c < BOARD_SIZE; c++) {
    if (board.every((row) => row[c] !== null)) cols.push(c);
  }
  return { rows, cols };
}

export function clearLines(
  board: Board,
  rows: number[],
  cols: number[]
): Board {
  const newBoard = board.map((r) => [...r]);
  for (const r of rows) {
    for (let c = 0; c < BOARD_SIZE; c++) newBoard[r][c] = null;
  }
  for (const c of cols) {
    for (let r = 0; r < BOARD_SIZE; r++) newBoard[r][c] = null;
  }
  return newBoard;
}

export function applyGravity(board: Board): Board {
  const newBoard = createEmptyBoard();
  for (let c = 0; c < BOARD_SIZE; c++) {
    const cells: string[] = [];
    for (let r = BOARD_SIZE - 1; r >= 0; r--) {
      if (board[r][c] !== null) cells.push(board[r][c]!);
    }
    for (let i = 0; i < cells.length; i++) {
      newBoard[BOARD_SIZE - 1 - i][c] = cells[i];
    }
  }
  return newBoard;
}

export function canPieceFit(board: Board, shape: Shape): boolean {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (isValidPlacement(board, shape, r, c)) return true;
    }
  }
  return false;
}

export function isGameOver(
  board: Board,
  pieces: (GamePiece | null)[]
): boolean {
  const activePieces = pieces.filter((p) => p !== null) as GamePiece[];
  if (activePieces.length === 0) return false;
  return activePieces.every((p) => !canPieceFit(board, p.shape));
}

export interface CascadeResult {
  board: Board;
  totalLinesCleared: number;
  cascadeCount: number;
}

export function runCascade(board: Board): CascadeResult {
  let currentBoard = board;
  let totalLinesCleared = 0;
  let cascadeCount = 0;

  while (true) {
    const { rows, cols } = findFullLines(currentBoard);
    const linesCleared = rows.length + cols.length;
    if (linesCleared === 0) break;
    totalLinesCleared += linesCleared;
    cascadeCount++;
    currentBoard = clearLines(currentBoard, rows, cols);
    currentBoard = applyGravity(currentBoard);
  }

  return { board: currentBoard, totalLinesCleared, cascadeCount };
}

export function calculateScore(
  blocksPlaced: number,
  linesCleared: number,
  cascadeCount: number
): number {
  let s = blocksPlaced;
  s += linesCleared * 50;
  if (linesCleared >= 2) s += 100;
  if (linesCleared >= 3) s += 200;
  if (cascadeCount > 0) s = Math.floor(s * (1 + cascadeCount * 0.6));
  return s;
}
