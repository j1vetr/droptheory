import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ComboFeedback from "@/components/ComboFeedback";
import FloatingPiece from "@/components/FloatingPiece";
import GameBoard, {
  ClearingCellAnim,
  PlacedCellAnim,
} from "@/components/GameBoard";
import GameOverModal from "@/components/GameOverModal";
import PieceTray from "@/components/PieceTray";
import { useLanguage } from "@/context/LanguageContext";
import {
  BOARD_SIZE,
  Board,
  applyGravity,
  calculateScore,
  clearLines,
  createEmptyBoard,
  findFullLines,
  isGameOver,
  isValidPlacement,
  placePiece,
} from "@/utils/gameEngine";
import { GamePiece, generateThreePieces } from "@/utils/pieces";

const BEST_SCORE_KEY = "drop_theory_best_score";
const GAME_SAVE_KEY = "drop_theory_saved_game";
const BOARD_PAD = 16;

interface DragState {
  pieceIndex: number;
  piece: GamePiece;
  pageX: number;
  pageY: number;
  ghostRow: number;
  ghostCol: number;
  isValid: boolean;
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function buildClearCells(board: Board, rows: number[], cols: number[]): ClearingCellAnim[] {
  const seen = new Set<string>();
  const result: ClearingCellAnim[] = [];
  for (const r of rows) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const key = `${r},${c}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push({ row: r, col: c, color: board[r][c] ?? "#C8A96E" });
      }
    }
  }
  for (const c of cols) {
    for (let r = 0; r < BOARD_SIZE; r++) {
      const key = `${r},${c}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push({ row: r, col: c, color: board[r][c] ?? "#C8A96E" });
      }
    }
  }
  return result;
}

export default function GameScreen() {
  const { t } = useLanguage();
  const { resume } = useLocalSearchParams<{ resume?: string }>();
  const { width: screenWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const boardSize = screenWidth - BOARD_PAD * 2;
  const cellSize = boardSize / BOARD_SIZE;

  const [board, setBoard] = useState<Board>(createEmptyBoard());
  const [pieces, setPieces] = useState<(GamePiece | null)[]>(generateThreePieces());
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [comboText, setComboText] = useState<string | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [placedCells, setPlacedCells] = useState<PlacedCellAnim[]>([]);
  const [clearingCells, setClearingCells] = useState<ClearingCellAnim[]>([]);

  const boardViewRef = useRef<View>(null);
  const boardLayoutRef = useRef({ x: 0, y: 0, cs: cellSize });
  const gamePhaseRef = useRef<"idle" | "animating">("idle");

  // Stable refs for pan responder closures
  const piecesRef = useRef(pieces);
  const boardRef = useRef(board);
  const scoreRef = useRef(score);
  useEffect(() => { piecesRef.current = pieces; }, [pieces]);
  useEffect(() => { boardRef.current = board; }, [board]);
  useEffect(() => { scoreRef.current = score; }, [score]);

  // Load best score
  useEffect(() => {
    AsyncStorage.getItem(BEST_SCORE_KEY).then((val) => {
      if (val) setBestScore(parseInt(val, 10));
    });
  }, []);

  // Load saved game if resuming
  useEffect(() => {
    if (resume === "1") {
      AsyncStorage.getItem(GAME_SAVE_KEY).then((val) => {
        if (val) {
          try {
            const saved = JSON.parse(val);
            setBoard(saved.board);
            setPieces(saved.pieces);
            setScore(saved.score ?? 0);
          } catch {}
        }
      });
    }
  }, [resume]);

  // Persist best score
  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      AsyncStorage.setItem(BEST_SCORE_KEY, score.toString());
    }
  }, [score, bestScore]);

  const saveGame = useCallback((b: Board, p: (GamePiece | null)[], s: number) => {
    AsyncStorage.setItem(GAME_SAVE_KEY, JSON.stringify({ board: b, pieces: p, score: s }));
  }, []);

  const clearSave = useCallback(() => {
    AsyncStorage.removeItem(GAME_SAVE_KEY);
  }, []);

  const measureBoard = useCallback(() => {
    boardViewRef.current?.measure((_x, _y, w, _h, px, py) => {
      boardLayoutRef.current = { x: px, y: py, cs: w / BOARD_SIZE };
    });
  }, []);

  const getGridPos = useCallback((px: number, py: number) => {
    const { x, y, cs } = boardLayoutRef.current;
    return {
      row: Math.floor((py - y) / cs),
      col: Math.floor((px - x) / cs),
    };
  }, []);

  const showComboText = useCallback(
    (cascades: number, totalLines: number) => {
      let text: string | null = null;
      if (cascades > 1) text = `${t.cascade} x${cascades}`;
      else if (totalLines >= 3) text = t.perfectDrop;
      if (text) {
        setComboText(text);
        setTimeout(() => setComboText(null), 2200);
      }
    },
    [t]
  );

  // Stable drop handler — updated each render, called via ref from PanResponder
  const dropHandlerRef = useRef(
    (_idx: number, _px: number, _py: number, _pieces: (GamePiece | null)[], _board: Board, _score: number) => {}
  );

  dropHandlerRef.current = async (
    idx: number,
    px: number,
    py: number,
    currentPieces: (GamePiece | null)[],
    currentBoard: Board,
    currentScore: number
  ) => {
    if (gamePhaseRef.current !== "idle") return;

    const piece = currentPieces[idx];
    if (!piece) {
      setDragState(null);
      return;
    }

    const { row, col } = getGridPos(px, py);
    if (
      !(row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE
        && isValidPlacement(currentBoard, piece.shape, row, col))
    ) {
      setDragState(null);
      return;
    }

    gamePhaseRef.current = "animating";
    setDragState(null);

    // Phase 1: Place piece on board
    let nb = placePiece(currentBoard, piece.shape, row, col, piece.color);
    const placed: PlacedCellAnim[] = piece.shape.map(([dr, dc]) => ({
      row: row + dr,
      col: col + dc,
      color: piece.color,
    }));
    setBoard(nb);
    setPlacedCells(placed);

    // Update pieces tray immediately
    const newPiecesArr = [...currentPieces] as (GamePiece | null)[];
    newPiecesArr[idx] = null;
    const finalPieces = newPiecesArr.every((p) => p === null)
      ? generateThreePieces()
      : newPiecesArr;
    setPieces(finalPieces);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await sleep(180);
    setPlacedCells([]);

    // Phase 2: Line clear cascade loop
    let totalLines = 0;
    let cascadeCount = 0;
    const blocksPlaced = piece.shape.length;

    while (true) {
      const { rows: fr, cols: fc } = findFullLines(nb);
      if (fr.length + fc.length === 0) break;

      const clearAnims = buildClearCells(nb, fr, fc);
      totalLines += fr.length + fc.length;
      cascadeCount++;

      setClearingCells(clearAnims);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await sleep(400);
      setClearingCells([]);

      nb = clearLines(nb, fr, fc);
      nb = applyGravity(nb);
      setBoard(nb);
      await sleep(120);
    }

    // Score
    const addedScore = calculateScore(blocksPlaced, totalLines, cascadeCount);
    const newScore = currentScore + addedScore;
    setScore(newScore);

    if (totalLines > 0) {
      showComboText(cascadeCount, totalLines);
    }

    // Persist
    saveGame(nb, finalPieces, newScore);

    // Game over check
    if (isGameOver(nb, finalPieces)) {
      setTimeout(() => {
        clearSave();
        setGameOver(true);
      }, 350);
    }

    gamePhaseRef.current = "idle";
  };

  const panResponders = useMemo(
    () =>
      [0, 1, 2].map((idx) =>
        PanResponder.create({
          onStartShouldSetPanResponder: () =>
            gamePhaseRef.current === "idle" && piecesRef.current[idx] !== null,
          onMoveShouldSetPanResponder: () => true,
          onPanResponderGrant: (evt) => {
            const piece = piecesRef.current[idx];
            if (!piece || gamePhaseRef.current !== "idle") return;
            boardViewRef.current?.measure((_x, _y, w, _h, bx, by) => {
              boardLayoutRef.current = { x: bx, y: by, cs: w / BOARD_SIZE };
            });
            const { pageX, pageY } = evt.nativeEvent;
            const { row, col } = getGridPos(pageX, pageY);
            const valid =
              row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE
              && isValidPlacement(boardRef.current, piece.shape, row, col);
            setDragState({ pieceIndex: idx, piece, pageX, pageY, ghostRow: row, ghostCol: col, isValid: valid });
          },
          onPanResponderMove: (evt) => {
            const { pageX, pageY } = evt.nativeEvent;
            const { row, col } = getGridPos(pageX, pageY);
            const piece = piecesRef.current[idx];
            if (!piece) return;
            const valid =
              row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE
              && isValidPlacement(boardRef.current, piece.shape, row, col);
            setDragState((prev) =>
              prev ? { ...prev, pageX, pageY, ghostRow: row, ghostCol: col, isValid: valid } : null
            );
          },
          onPanResponderRelease: (evt) => {
            const { pageX, pageY } = evt.nativeEvent;
            dropHandlerRef.current(
              idx, pageX, pageY,
              piecesRef.current, boardRef.current, scoreRef.current
            );
          },
          onPanResponderTerminate: () => setDragState(null),
        })
      ),
    [] // stable — uses refs
  );

  const ghostCells = useMemo(() => {
    if (!dragState || dragState.ghostRow < 0 || dragState.ghostCol < 0) return [];
    return dragState.piece.shape.map(([dr, dc]) => ({
      row: dragState.ghostRow + dr,
      col: dragState.ghostCol + dc,
      isValid: dragState.isValid,
    }));
  }, [dragState]);

  const restart = useCallback(() => {
    clearSave();
    setBoard(createEmptyBoard());
    setPieces(generateThreePieces());
    setScore(0);
    setGameOver(false);
    setComboText(null);
    setDragState(null);
    setPlacedCells([]);
    setClearingCells([]);
    gamePhaseRef.current = "idle";
  }, [clearSave]);

  const handleBack = useCallback(() => {
    saveGame(boardRef.current, piecesRef.current, scoreRef.current);
    router.replace("/menu");
  }, [saveGame]);

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const bottomPad = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  return (
    <View style={[styles.container, { paddingTop: topPad, paddingBottom: bottomPad }]}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.headerBtn}>
          <Text style={styles.headerBtnText}>←</Text>
        </Pressable>
        <View style={styles.scores}>
          <View style={styles.scoreBlock}>
            <Text style={styles.scoreLabel}>{t.score}</Text>
            <Text style={styles.scoreValue}>{score.toLocaleString()}</Text>
          </View>
          <View style={styles.scoreDivider} />
          <View style={styles.scoreBlock}>
            <Text style={styles.scoreLabel}>{t.best}</Text>
            <Text style={[styles.scoreValue, styles.bestValue]}>
              {bestScore.toLocaleString()}
            </Text>
          </View>
        </View>
        <Pressable onPress={restart} style={styles.headerBtn}>
          <Text style={styles.headerBtnText}>↺</Text>
        </Pressable>
      </View>

      {/* Board */}
      <View
        ref={boardViewRef}
        onLayout={measureBoard}
        style={{ width: boardSize, height: boardSize, marginHorizontal: BOARD_PAD }}
      >
        <GameBoard
          board={board}
          ghostCells={ghostCells}
          cellSize={cellSize}
          placedCells={placedCells}
          clearingCells={clearingCells}
        />
      </View>

      {/* Piece tray */}
      <View style={[styles.tray, { width: boardSize }]}>
        <PieceTray
          pieces={pieces}
          panHandlers={panResponders.map((pr) => pr.panHandlers)}
          draggingIndex={dragState?.pieceIndex ?? null}
          cellSize={cellSize}
        />
      </View>

      {/* Floating piece during drag */}
      {dragState && (
        <FloatingPiece
          piece={dragState.piece}
          pageX={dragState.pageX}
          pageY={dragState.pageY}
          cellSize={cellSize}
        />
      )}

      <ComboFeedback text={comboText} />

      {gameOver && (
        <GameOverModal
          score={score}
          bestScore={bestScore}
          isNewBest={score > 0 && score >= bestScore}
          onRestart={restart}
          onMenu={() => router.replace("/menu")}
          t={t}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0D0D",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 8,
    paddingVertical: 10,
    marginBottom: 4,
  },
  headerBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerBtnText: {
    fontSize: 22,
    color: "#6B6354",
  },
  scores: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  scoreBlock: {
    alignItems: "center",
    minWidth: 72,
  },
  scoreDivider: {
    width: 1,
    height: 28,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  scoreLabel: {
    fontSize: 9,
    fontFamily: "Inter_500Medium",
    color: "#6B6354",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  scoreValue: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#F5F0E8",
  },
  bestValue: {
    color: "#C8A96E",
  },
  tray: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
