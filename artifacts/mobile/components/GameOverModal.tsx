import React, { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Translations } from "@/constants/translations";

interface Props {
  score: number;
  bestScore: number;
  isNewBest: boolean;
  onRestart: () => void;
  onMenu: () => void;
  t: Translations;
}

export default function GameOverModal({
  score,
  bestScore,
  isNewBest,
  onRestart,
  onMenu,
  t,
}: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, scale]);

  return (
    <Animated.View style={[styles.overlay, { opacity }]}>
      <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
        <Text style={styles.gameOverLabel}>{t.gameOver}</Text>
        <Text style={styles.noMovesText}>{t.noMoves}</Text>

        <View style={styles.divider} />

        {isNewBest && (
          <Text style={styles.newBestLabel}>{t.newBestScore}</Text>
        )}

        <View style={styles.scoreRow}>
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

        <TouchableOpacity style={styles.primaryBtn} onPress={onRestart}>
          <Text style={styles.primaryBtnText}>{t.tryAgain}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={onMenu}>
          <Text style={styles.secondaryBtnText}>{t.home}</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.82)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 500,
  },
  card: {
    backgroundColor: "#141414",
    borderRadius: 20,
    paddingVertical: 36,
    paddingHorizontal: 32,
    alignItems: "center",
    width: "82%",
    borderWidth: 1,
    borderColor: "rgba(200,169,110,0.20)",
  },
  gameOverLabel: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: "#F5F0E8",
    letterSpacing: 1,
    marginBottom: 6,
  },
  noMovesText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#6B6354",
    letterSpacing: 0.5,
    marginBottom: 24,
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "rgba(255,255,255,0.07)",
    marginBottom: 20,
  },
  newBestLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: "#C8A96E",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
    gap: 24,
  },
  scoreBlock: {
    alignItems: "center",
    minWidth: 80,
  },
  scoreDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  scoreLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: "#6B6354",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    color: "#F5F0E8",
  },
  bestValue: {
    color: "#C8A96E",
  },
  primaryBtn: {
    backgroundColor: "#C8A96E",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 48,
    marginBottom: 12,
    width: "100%",
    alignItems: "center",
  },
  primaryBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#0D0D0D",
    letterSpacing: 0.5,
  },
  secondaryBtn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  secondaryBtnText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: "#6B6354",
    letterSpacing: 0.5,
  },
});
