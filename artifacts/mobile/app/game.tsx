import { ChevronLeft } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
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
  FallingCellAnim,
  ParticleBurstAnim,
  PlacedCellAnim,
} from "@/components/GameBoard";
import GameOverModal from "@/components/GameOverModal";
import PieceTray, { TRAY_HEIGHT } from "@/components/PieceTray";
import ScorePopup from "@/components/ScorePopup";
import { useLanguage } from "@/context/LanguageContext";
import {
  fxGameOver,
  fxInvalid,
  fxLineClear,
  fxPickup,
  fxPlace,
} from "@/utils/feedback";
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
const FINGER_LIFT = 80;

interface DragState {
  pieceIndex: number;
  piece: GamePiece;
  pageX: number;
  pageY: number;
  ghostRow: number;
  ghostCol: number;
  isValid: boolean;
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function buildClearCells(board: Board, rows: number[], cols: number[]): ClearingCellAnim[] {
  const seen = new Set<string>();
  const result: ClearingCellAnim[] = [];
  for (const r of rows) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const key = `${r},${c}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push({ row: r, col: c, color: board[r][c] ?? "#B07E28" });
      }
    }
  }
  for (const c of cols) {
    for (let r = 0; r < BOARD_SIZE; r++) {
      const key = `${r},${c}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push({ row: r, col: c, color: board[r][c] ?? "#B07E28" });
      }
    }
  }
  return result;
}

function computeFallingCells(before: Board, after: Board): FallingCellAnim[] {
  const result: FallingCellAnim[] = [];
  for (let col = 0; col < BOARD_SIZE; col++) {
    const beforeFilled: { row: number; color: string }[] = [];
    const afterFilled: { row: number; color: string }[] = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      if (before[r][col]) beforeFilled.push({ row: r, color: before[r][col]! });
      if (after[r][col]) afterFilled.push({ row: r, color: after[r][col]! });
    }
    for (let i = 0; i < beforeFilled.length && i < afterFilled.length; i++) {
      if (beforeFilled[i].row !== afterFilled[i].row) {
        result.push({
          fromRow: beforeFilled[i].row,
          toRow: afterFilled[i].row,
          col,
          color: beforeFilled[i].color,
        });
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
  const [isNewBest, setIsNewBest] = useState(false);
  const [comboText, setComboText] = useState<string | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [placedCells, setPlacedCells] = useState<PlacedCellAnim[]>([]);
  const [clearingCells, setClearingCells] = useState<ClearingCellAnim[]>([]);
  const [fallingCells, setFallingCells] = useState<FallingCellAnim[]>([]);
  const [particleBursts, setParticleBursts] = useState<ParticleBurstAnim[]>([]);
  const [scorePopups, setScorePopups] = useState<
    { id: number; x: number; y: number; value: number }[]
  >([]);
  const popupIdRef = useRef(0);

  const boardViewRef = useRef<View>(null);
  const boardLayoutRef = useRef({ x: 0, y: 0, cs: cellSize });
  const gamePhaseRef = useRef<"idle" | "animating">("idle");

  const piecesRef = useRef(pieces);
  const boardRef = useRef(board);
  const scoreRef = useRef(score);
  const bestScoreRef = useRef(bestScore);
  useEffect(() => { piecesRef.current = pieces; }, [pieces]);
  useEffect(() => { boardRef.current = board; }, [board]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { bestScoreRef.current = bestScore; }, [bestScore]);

  useEffect(() => {
    AsyncStorage.getItem(BEST_SCORE_KEY).then((val) => {
      if (val) setBestScore(parseInt(val, 10));
    });
  }, []);

  useEffect(() => {
    if (resume !== "1") return;
    AsyncStorage.getItem(GAME_SAVE_KEY).then((val) => {
      if (!val) return;
      try {
        const saved = JSON.parse(val) as { board: Board; pieces: (GamePiece | null)[]; score: number };
        setBoard(saved.board);
        setPieces(saved.pieces);
        setScore(saved.score ?? 0);
      } catch (e) {
        // Ignore corrupted save data
      }
    });
  }, [resume]);

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
      if (cascades >= 3) text = `${t.chain} x${cascades}`;
      else if (cascades === 2) text = `${t.cascade} x2`;
      else if (totalLines >= 3) text = t.perfectDrop;
      if (text) {
        setComboText(text);
        setTimeout(() => setComboText(null), 2200);
      }
    },
    [t]
  );

  const spawnScorePopup = useCallback(
    (rows: number[], cols: number[], value: number) => {
      const { x, y, cs } = boardLayoutRef.current;
      const allCells: { r: number; c: number }[] = [];
      for (const r of rows) {
        for (let c = 0; c < BOARD_SIZE; c++) allCells.push({ r, c });
      }
      for (const c of cols) {
        for (let r = 0; r < BOARD_SIZE; r++) allCells.push({ r, c });
      }
      if (allCells.length === 0) return;
      const cr = allCells.reduce((s, p) => s + p.r, 0) / allCells.length;
      const cc = allCells.reduce((s, p) => s + p.c, 0) / allCells.length;
      const px = x + cc * cs + cs / 2 - 18;
      const py = y + cr * cs + cs / 2 - 12;
      const id = ++popupIdRef.current;
      setScorePopups((prev) => [...prev, { id, x: px, y: py, value }]);
      setTimeout(() => {
        setScorePopups((prev) => prev.filter((p) => p.id !== id));
      }, 1000);
    },
    []
  );

  const dropHandlerRef = useRef(
    (_idx: number, _px: number, _py: number, _p: (GamePiece | null)[], _b: Board, _s: number) => {}
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

    const { row, col } = getGridPos(px, py - FINGER_LIFT);
    if (
      !(row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE
        && isValidPlacement(currentBoard, piece.shape, row, col))
    ) {
      fxInvalid();
      setDragState(null);
      return;
    }

    gamePhaseRef.current = "animating";
    setDragState(null);

    let nb = placePiece(currentBoard, piece.shape, row, col, piece.color);
    setBoard(nb);
    setPlacedCells(
      piece.shape.map(([dr, dc]) => ({ row: row + dr, col: col + dc, color: piece.color }))
    );

    const newPiecesArr = [...currentPieces] as (GamePiece | null)[];
    newPiecesArr[idx] = null;
    const finalPieces = newPiecesArr.every((p) => p === null)
      ? generateThreePieces()
      : newPiecesArr;
    setPieces(finalPieces);

    fxPlace();
    await sleep(220);
    setPlacedCells([]);

    let totalLines = 0;
    let cascadeCount = 0;
    const blocksPlaced = piece.shape.length;

    while (true) {
      const { rows: fr, cols: fc } = findFullLines(nb);
      if (fr.length + fc.length === 0) break;

      const linesThisStep = fr.length + fc.length;
      totalLines += linesThisStep;
      cascadeCount++;

      const stepValue = linesThisStep * 100 * cascadeCount;
      spawnScorePopup(fr, fc, stepValue);

      const clearAnims = buildClearCells(nb, fr, fc);
      setClearingCells(clearAnims);
      const burstIntensity = cascadeCount === 1 ? 1 : 0.45;
      setParticleBursts(
        clearAnims.map((c) => ({
          row: c.row,
          col: c.col,
          color: c.color,
          intensity: burstIntensity,
        }))
      );
      setTimeout(() => setParticleBursts([]), 520);
      fxLineClear(cascadeCount, linesThisStep);
      await sleep(400);
      setClearingCells([]);

      const clearedBoard = clearLines(nb, fr, fc);
      const gravityBoard = applyGravity(clearedBoard);
      const falling = computeFallingCells(clearedBoard, gravityBoard);

      if (falling.length > 0) {
        setBoard(gravityBoard);
        setFallingCells(falling);
        await sleep(490);
        setFallingCells([]);
      } else {
        setBoard(gravityBoard);
        await sleep(80);
      }

      nb = gravityBoard;
    }

    const addedScore = calculateScore(blocksPlaced, totalLines, cascadeCount);
    const newScore = currentScore + addedScore;
    const wasNewBest = newScore > bestScoreRef.current;
    setScore(newScore);

    if (totalLines > 0) showComboText(cascadeCount, totalLines);

    saveGame(nb, finalPieces, newScore);

    if (isGameOver(nb, finalPieces)) {
      setTimeout(() => {
        clearSave();
        setIsNewBest(wasNewBest);
        setGameOver(true);
        fxGameOver(wasNewBest);
      }, 350);
    } else if (wasNewBest) {
      fxGameOver(true);
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
            fxPickup();
            boardViewRef.current?.measure((_x, _y, w, _h, bx, by) => {
              boardLayoutRef.current = { x: bx, y: by, cs: w / BOARD_SIZE };
            });
            const { pageX, pageY } = evt.nativeEvent;
            const { row, col } = getGridPos(pageX, pageY - FINGER_LIFT);
            const valid =
              row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE
              && isValidPlacement(boardRef.current, piece.shape, row, col);
            setDragState({ pieceIndex: idx, piece, pageX, pageY, ghostRow: row, ghostCol: col, isValid: valid });
          },
          onPanResponderMove: (evt) => {
            const { pageX, pageY } = evt.nativeEvent;
            const { row, col } = getGridPos(pageX, pageY - FINGER_LIFT);
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
    []
  );

  const ghostCells = useMemo(() => {
    if (!dragState || dragState.ghostRow < 0 || dragState.ghostCol < 0) return [];
    return dragState.piece.shape.map(([dr, dc]) => ({
      row: dragState.ghostRow + dr,
      col: dragState.ghostCol + dc,
      isValid: dragState.isValid,
      color: dragState.piece.color,
    }));
  }, [dragState]);

  const restart = useCallback(() => {
    clearSave();
    setBoard(createEmptyBoard());
    setPieces(generateThreePieces());
    setScore(0);
    setGameOver(false);
    setIsNewBest(false);
    setComboText(null);
    setDragState(null);
    setPlacedCells([]);
    setClearingCells([]);
    setFallingCells([]);
    setParticleBursts([]);
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
      <LinearGradient
        colors={["#3D2670", "#241548", "#13082B"]}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.iconBtn} hitSlop={6}>
          <ChevronLeft size={22} color="#C8B89A" strokeWidth={2.5} />
        </Pressable>

        <View style={styles.scoreBanner}>
          <View style={styles.scoreSide}>
            <Text style={styles.scoreLabel}>{t.score}</Text>
            <View style={styles.scoreAccent} />
            <Text style={styles.scoreValue}>{score.toLocaleString()}</Text>
          </View>
          <View style={styles.scoreDivider} />
          <View style={styles.scoreSide}>
            <Text style={[styles.scoreLabel, styles.bestLabel]}>{t.best}</Text>
            <View style={[styles.scoreAccent, styles.bestAccent]} />
            <Text style={[styles.scoreValue, styles.bestValue]}>
              {bestScore.toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.iconBtnSpacer} />
      </View>

      <View
        ref={boardViewRef}
        onLayout={measureBoard}
        style={[styles.boardWrapper, { width: boardSize, height: boardSize, marginHorizontal: BOARD_PAD }]}
      >
        <View style={[styles.cornerAccent, styles.cornerTL]} />
        <View style={[styles.cornerAccent, styles.cornerTR]} />
        <View style={[styles.cornerAccent, styles.cornerBL]} />
        <View style={[styles.cornerAccent, styles.cornerBR]} />
        <GameBoard
          board={board}
          ghostCells={ghostCells}
          cellSize={cellSize}
          placedCells={placedCells}
          clearingCells={clearingCells}
          fallingCells={fallingCells}
          particleBursts={particleBursts}
        />
      </View>

      <View style={[styles.trayWrapper, { width: boardSize }]}>
        <PieceTray
          pieces={pieces}
          panHandlers={panResponders.map((pr) => pr.panHandlers)}
          draggingIndex={dragState?.pieceIndex ?? null}
          cellSize={cellSize}
        />
      </View>

      {dragState && (
        <FloatingPiece
          piece={dragState.piece}
          pageX={dragState.pageX}
          pageY={dragState.pageY - FINGER_LIFT}
          cellSize={cellSize}
          isValid={dragState.isValid}
        />
      )}

      {scorePopups.map((p) => (
        <ScorePopup key={p.id} id={p.id} x={p.x} y={p.y} value={p.value} />
      ))}

      <ComboFeedback text={comboText} />

      {gameOver && (
        <GameOverModal
          score={score}
          bestScore={bestScore}
          isNewBest={isNewBest}
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
    backgroundColor: "#241548",
    alignItems: "center",
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  iconBtnSpacer: {
    width: 40,
    height: 40,
  },
  scoreBanner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "space-around",
    backgroundColor: "rgba(20,16,42,0.78)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(200,169,110,0.22)",
    paddingVertical: 10,
    paddingHorizontal: 6,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 14,
      },
      android: { elevation: 8 },
      default: {},
    }),
  },
  scoreSide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    gap: 4,
  },
  scoreDivider: {
    width: 1,
    backgroundColor: "rgba(200,169,110,0.22)",
    marginVertical: 6,
  },
  scoreLabel: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    color: "#9A9180",
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  bestLabel: {
    color: "#C8A96E",
  },
  scoreAccent: {
    width: 18,
    height: 2,
    borderRadius: 1,
    backgroundColor: "rgba(154,145,128,0.45)",
  },
  bestAccent: {
    backgroundColor: "#C8A96E",
    shadowColor: "#C8A96E",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
  scoreValue: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#F4F1EA",
    letterSpacing: 0.5,
    marginTop: 2,
  },
  bestValue: {
    color: "#E8C870",
  },
  boardWrapper: {
    position: "relative",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.55,
        shadowRadius: 24,
      },
      android: { elevation: 18 },
      default: {},
    }),
  },
  cornerAccent: {
    position: "absolute",
    width: 18,
    height: 18,
    borderColor: "#C8A96E",
    zIndex: 2,
  },
  cornerTL: {
    top: -5,
    left: -5,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  cornerTR: {
    top: -5,
    right: -5,
    borderTopWidth: 2,
    borderRightWidth: 2,
  },
  cornerBL: {
    bottom: -5,
    left: -5,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
  },
  cornerBR: {
    bottom: -5,
    right: -5,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
  trayWrapper: {
    height: TRAY_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    marginBottom: 4,
  },
});
