import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
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
import GameBoard from "@/components/GameBoard";
import GameOverModal from "@/components/GameOverModal";
import PieceTray from "@/components/PieceTray";
import { useLanguage } from "@/context/LanguageContext";
import {
  BOARD_SIZE,
  Board,
  CascadeResult,
  applyGravity,
  calculateScore,
  clearLines,
  createEmptyBoard,
  findFullLines,
  isGameOver,
  isValidPlacement,
  placePiece,
  runCascade,
} from "@/utils/gameEngine";
import { GamePiece, generateThreePieces } from "@/utils/pieces";

const BEST_SCORE_KEY = "drop_theory_best_score";
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

export default function GameScreen() {
  const { t } = useLanguage();
  const { width: screenWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const boardSize = screenWidth - BOARD_PAD * 2;
  const cellSize = boardSize / BOARD_SIZE;

  const [board, setBoard] = useState<Board>(createEmptyBoard());
  const [pieces, setPieces] = useState<(GamePiece | null)[]>(
    generateThreePieces()
  );
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [comboText, setComboText] = useState<string | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);

  const boardViewRef = useRef<View>(null);
  const boardLayoutRef = useRef({ x: 0, y: 0, cs: cellSize });

  useEffect(() => {
    AsyncStorage.getItem(BEST_SCORE_KEY).then((val) => {
      if (val) setBestScore(parseInt(val, 10));
    });
  }, []);

  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      AsyncStorage.setItem(BEST_SCORE_KEY, score.toString());
    }
  }, [score, bestScore]);

  const measureBoard = useCallback(() => {
    boardViewRef.current?.measure((_x, _y, w, _h, px, py) => {
      boardLayoutRef.current = { x: px, y: py, cs: w / BOARD_SIZE };
    });
  }, []);

  const getGridPos = useCallback((px: number, py: number) => {
    const { x, y, cs } = boardLayoutRef.current;
    const col = Math.floor((px - x) / cs);
    const row = Math.floor((py - y) / cs);
    return { row, col };
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

  // Stable drop handler ref — always has fresh closure
  const dropHandlerRef = useRef(
    (
      idx: number,
      px: number,
      py: number,
      _pieces: (GamePiece | null)[],
      _board: Board,
      _score: number
    ) => {}
  );

  dropHandlerRef.current = (
    idx: number,
    px: number,
    py: number,
    currentPieces: (GamePiece | null)[],
    currentBoard: Board,
    currentScore: number
  ) => {
    const piece = currentPieces[idx];
    if (!piece) {
      setDragState(null);
      return;
    }
    const { row, col } = getGridPos(px, py);
    if (
      row >= 0 &&
      row < BOARD_SIZE &&
      col >= 0 &&
      col < BOARD_SIZE &&
      isValidPlacement(currentBoard, piece.shape, row, col)
    ) {
      let nb = placePiece(currentBoard, piece.shape, row, col, piece.color);
      const blocksPlaced = piece.shape.length;
      const { rows: fr, cols: fc } = findFullLines(nb);
      const initialLines = fr.length + fc.length;
      let totalLines = initialLines;
      let cascadeCount = 0;

      if (initialLines > 0) {
        nb = clearLines(nb, fr, fc);
        nb = applyGravity(nb);
        const cascade: CascadeResult = runCascade(nb);
        nb = cascade.board;
        totalLines += cascade.totalLinesCleared;
        cascadeCount = 1 + cascade.cascadeCount;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        showComboText(cascadeCount, totalLines);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      const newScore = currentScore + calculateScore(blocksPlaced, totalLines, cascadeCount);
      const newPieces: (GamePiece | null)[] = [...currentPieces];
      newPieces[idx] = null;
      const finalPieces = newPieces.every((p) => p === null)
        ? generateThreePieces()
        : newPieces;

      setBoard(nb);
      setPieces(finalPieces);
      setScore(newScore);

      if (isGameOver(nb, finalPieces)) {
        setTimeout(() => setGameOver(true), 700);
      }
    }
    setDragState(null);
  };

  // Stable refs for pan responder closures
  const piecesRef = useRef(pieces);
  const boardRef = useRef(board);
  const scoreRef = useRef(score);
  useEffect(() => { piecesRef.current = pieces; }, [pieces]);
  useEffect(() => { boardRef.current = board; }, [board]);
  useEffect(() => { scoreRef.current = score; }, [score]);

  const panResponders = useMemo(
    () =>
      [0, 1, 2].map((idx) =>
        PanResponder.create({
          onStartShouldSetPanResponder: () => piecesRef.current[idx] !== null,
          onMoveShouldSetPanResponder: () => true,
          onPanResponderGrant: (evt) => {
            const piece = piecesRef.current[idx];
            if (!piece) return;
            boardViewRef.current?.measure((_x, _y, w, _h, bx, by) => {
              boardLayoutRef.current = { x: bx, y: by, cs: w / BOARD_SIZE };
            });
            const { pageX, pageY } = evt.nativeEvent;
            const { row, col } = getGridPos(pageX, pageY);
            const valid =
              row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE
              && isValidPlacement(boardRef.current, piece.shape, row, col);
            setDragState({
              pieceIndex: idx,
              piece,
              pageX,
              pageY,
              ghostRow: row,
              ghostCol: col,
              isValid: valid,
            });
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
              prev
                ? { ...prev, pageX, pageY, ghostRow: row, ghostCol: col, isValid: valid }
                : null
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
    [] // created once, uses stable refs
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
    setBoard(createEmptyBoard());
    setPieces(generateThreePieces());
    setScore(0);
    setGameOver(false);
    setComboText(null);
    setDragState(null);
  }, []);

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const bottomPad = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  return (
    <View
      style={[
        styles.container,
        { paddingTop: topPad, paddingBottom: bottomPad },
      ]}
    >
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.replace("/menu")} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
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
        <Pressable
          onPress={restart}
          style={styles.backBtn}
        >
          <Text style={styles.restartText}>↺</Text>
        </Pressable>
      </View>

      {/* Board */}
      <View
        ref={boardViewRef}
        onLayout={measureBoard}
        style={{ width: boardSize, height: boardSize, marginHorizontal: BOARD_PAD }}
      >
        <GameBoard board={board} ghostCells={ghostCells} cellSize={cellSize} />
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

      {/* Floating piece */}
      {dragState && (
        <FloatingPiece
          piece={dragState.piece}
          pageX={dragState.pageX}
          pageY={dragState.pageY}
          cellSize={cellSize}
        />
      )}

      {/* Combo text */}
      <ComboFeedback text={comboText} />

      {/* Game over overlay */}
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
  backBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  backText: {
    fontSize: 24,
    color: "#6B6354",
  },
  restartText: {
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
