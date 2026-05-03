import React, { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
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

const cardShadow = Platform.select({
  ios: {
    shadowColor: "#C8A96E",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
  },
  android: { elevation: 20 },
  default: {},
});

const btnShadow = Platform.select({
  ios: {
    shadowColor: "#B07E28",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  android: { elevation: 8 },
  default: {},
});

export default function GameOverModal({
  score,
  bestScore,
  isNewBest,
  onRestart,
  onMenu,
  t,
}: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.82)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 7,
        tension: 65,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        friction: 7,
        tension: 65,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, scale, translateY]);

  return (
    <Animated.View style={[styles.overlay, { opacity }]}>
      <Animated.View
        style={[
          styles.card,
          cardShadow,
          { transform: [{ scale }, { translateY }] },
        ]}
      >
        <Text style={styles.gameOverLabel}>{t.gameOver}</Text>
        <Text style={styles.noMovesText}>{t.noMoves}</Text>

        <View style={styles.divider} />

        {isNewBest && (
          <View style={styles.newBestBadge}>
            <Text style={styles.newBestLabel}>{t.newBestScore}</Text>
          </View>
        )}

        <View style={styles.scoreRow}>
          <View style={styles.scoreChip}>
            <Text style={styles.scoreLabel}>{t.score}</Text>
            <Text style={styles.scoreValue}>{score.toLocaleString()}</Text>
          </View>
          <View style={[styles.scoreChip, styles.bestChip]}>
            <Text style={styles.scoreLabel}>{t.best}</Text>
            <Text style={[styles.scoreValue, styles.bestValue]}>
              {bestScore.toLocaleString()}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.primaryBtn, btnShadow]}
          onPress={onRestart}
          activeOpacity={0.82}
        >
          <Text style={styles.primaryBtnText}>{t.tryAgain}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={onMenu}
          activeOpacity={0.7}
        >
          <Text style={styles.secondaryBtnText}>{t.home}</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(6,6,10,0.88)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 500,
  },
  card: {
    backgroundColor: "#18181F",
    borderRadius: 24,
    paddingVertical: 38,
    paddingHorizontal: 32,
    alignItems: "center",
    width: "84%",
    borderWidth: 1,
    borderColor: "rgba(200,169,110,0.22)",
  },
  gameOverLabel: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
    color: "#F0EDE8",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  noMovesText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#7A7266",
    letterSpacing: 0.4,
    marginBottom: 26,
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "rgba(255,255,255,0.07)",
    marginBottom: 22,
  },
  newBestBadge: {
    backgroundColor: "rgba(176,126,40,0.14)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "rgba(200,169,110,0.35)",
    marginBottom: 16,
  },
  newBestLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: "#D4A83A",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  scoreRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 34,
  },
  scoreChip: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 22,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    minWidth: 88,
  },
  bestChip: {
    borderColor: "rgba(200,169,110,0.22)",
    backgroundColor: "rgba(200,169,110,0.06)",
  },
  scoreLabel: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    color: "#6B6354",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
    color: "#F0EDE8",
  },
  bestValue: {
    color: "#D4A83A",
  },
  primaryBtn: {
    backgroundColor: "#B07E28",
    borderRadius: 14,
    paddingVertical: 15,
    marginBottom: 12,
    width: "100%",
    alignItems: "center",
  },
  primaryBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#FDFAF4",
    letterSpacing: 1,
  },
  secondaryBtn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  secondaryBtnText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: "#5A5448",
    letterSpacing: 0.5,
  },
});
