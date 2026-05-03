import { LinearGradient } from "expo-linear-gradient";
import { Crown, Play, Sparkles, X } from "lucide-react-native";
import { fxButton } from "@/utils/feedback";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
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

const { width: SCREEN_W } = Dimensions.get("window");

const cardShadow = Platform.select({
  ios: {
    shadowColor: "#5DDDC4",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.35,
    shadowRadius: 40,
  },
  android: { elevation: 24 },
  default: {},
});

const primaryShadow = Platform.select({
  ios: {
    shadowColor: "#2E8C7C",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 18,
  },
  android: { elevation: 12 },
  default: {},
});

function useCountUp(target: number, duration = 1100, delay = 320) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf: number;
    let start: number | null = null;
    const tick = (ts: number) => {
      if (start === null) start = ts;
      const elapsed = ts - start - delay;
      if (elapsed < 0) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const p = Math.min(1, elapsed / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, delay]);
  return val;
}

export default function GameOverModal({
  score,
  bestScore,
  isNewBest,
  onRestart,
  onMenu,
  t,
}: Props) {
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.86)).current;
  const cardY = useRef(new Animated.Value(28)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const crownScale = useRef(new Animated.Value(0)).current;
  const crownGlow = useRef(new Animated.Value(0)).current;
  const buttonsY = useRef(new Animated.Value(24)).current;
  const buttonsOpacity = useRef(new Animated.Value(0)).current;
  const ringRotate = useRef(new Animated.Value(0)).current;

  const animatedScore = useCountUp(score, 1100, 380);
  const animatedBest = useCountUp(bestScore, 1100, 520);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.spring(cardScale, {
          toValue: 1,
          friction: 7,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.spring(cardY, {
          toValue: 0,
          friction: 8,
          tension: 70,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(crownScale, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(buttonsOpacity, {
          toValue: 1,
          duration: 360,
          useNativeDriver: true,
        }),
        Animated.spring(buttonsY, {
          toValue: 0,
          friction: 8,
          tension: 60,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    if (isNewBest) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(crownGlow, {
            toValue: 1,
            duration: 1400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(crownGlow, {
            toValue: 0,
            duration: 1400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start();
      Animated.loop(
        Animated.timing(ringRotate, {
          toValue: 1,
          duration: 14000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ).start();
    }
  }, [
    overlayOpacity,
    cardScale,
    cardY,
    cardOpacity,
    crownScale,
    crownGlow,
    buttonsOpacity,
    buttonsY,
    ringRotate,
    isNewBest,
  ]);

  const glowOpacity = crownGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.85],
  });
  const glowScale = crownGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.18],
  });
  const ringRotation = ringRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
      <LinearGradient
        colors={["rgba(8,12,28,0.88)", "rgba(4,6,18,0.96)"]}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      <Animated.View
        style={[
          styles.card,
          cardShadow,
          {
            opacity: cardOpacity,
            transform: [{ scale: cardScale }, { translateY: cardY }],
          },
        ]}
      >
        <LinearGradient
          colors={["#1F1A40", "#160F30", "#0D0822"]}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        <View style={styles.cornerTL} />
        <View style={styles.cornerTR} />
        <View style={styles.cornerBL} />
        <View style={styles.cornerBR} />

        <View style={styles.crownArea}>
          {isNewBest && (
            <Animated.View
              style={[
                styles.ringWrap,
                { transform: [{ rotate: ringRotation }] },
              ]}
              pointerEvents="none"
            >
              <View style={styles.ringDot} />
              <View style={[styles.ringDot, styles.ringDot2]} />
              <View style={[styles.ringDot, styles.ringDot3]} />
              <View style={[styles.ringDot, styles.ringDot4]} />
            </Animated.View>
          )}
          {isNewBest && (
            <Animated.View
              style={[
                styles.crownGlow,
                {
                  opacity: glowOpacity,
                  transform: [{ scale: glowScale }],
                },
              ]}
              pointerEvents="none"
            />
          )}
          <Animated.View
            style={[
              styles.crownCircle,
              isNewBest ? styles.crownCircleBest : styles.crownCircleEnd,
              { transform: [{ scale: crownScale }] },
            ]}
          >
            {isNewBest ? (
              <Crown
                size={36}
                color="#FFD980"
                fill="#F2B84B"
                strokeWidth={2}
              />
            ) : (
              <X size={32} color="#E14A3F" strokeWidth={3} />
            )}
          </Animated.View>
        </View>

        <Text style={styles.gameOverLabel}>{t.gameOver}</Text>
        <View style={styles.subRow}>
          <View style={styles.subDot} />
          <Text style={styles.noMovesText}>{t.noMoves}</Text>
          <View style={styles.subDot} />
        </View>

        {isNewBest && (
          <View style={styles.newBestBadge}>
            <Sparkles size={11} color="#FFD980" strokeWidth={2.5} />
            <Text style={styles.newBestLabel}>{t.newBestScore}</Text>
            <Sparkles size={11} color="#FFD980" strokeWidth={2.5} />
          </View>
        )}

        <View style={styles.scoreRow}>
          <View style={styles.scoreChip}>
            <Text style={styles.scoreLabel}>{t.score.toUpperCase()}</Text>
            <Text style={styles.scoreValue}>
              {animatedScore.toLocaleString()}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.scoreChip}>
            <Text
              style={[
                styles.scoreLabel,
                { color: isNewBest ? "#FFD980" : "#7FE0CC" },
              ]}
            >
              {t.best.toUpperCase()}
            </Text>
            <Text
              style={[
                styles.scoreValue,
                { color: isNewBest ? "#FFE6A8" : "#E8FBF5" },
              ]}
            >
              {animatedBest.toLocaleString()}
            </Text>
          </View>
        </View>

        <Animated.View
          style={{
            opacity: buttonsOpacity,
            transform: [{ translateY: buttonsY }],
            width: "100%",
          }}
        >
          <TouchableOpacity
            style={[styles.primaryBtn, primaryShadow]}
            onPress={() => {
              fxButton();
              onRestart();
            }}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={["#5DDDC4", "#3FB8A0", "#2E8C7C"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryBtnGradient}
            >
              <Play size={16} color="#FFFFFF" fill="#FFFFFF" strokeWidth={0} />
              <Text style={styles.primaryBtnText}>{t.tryAgain}</Text>
            </LinearGradient>
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
    </Animated.View>
  );
}

const CARD_WIDTH = Math.min(SCREEN_W * 0.88, 380);
const CORNER_LEN = 18;
const CORNER_THICK = 2;
const CORNER_COLOR = "rgba(127,224,204,0.55)";

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 500,
    padding: 24,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 28,
    paddingTop: 56,
    paddingBottom: 28,
    paddingHorizontal: 28,
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(127,224,204,0.18)",
  },

  cornerTL: {
    position: "absolute",
    top: 14,
    left: 14,
    width: CORNER_LEN,
    height: CORNER_LEN,
    borderTopWidth: CORNER_THICK,
    borderLeftWidth: CORNER_THICK,
    borderColor: CORNER_COLOR,
    borderTopLeftRadius: 4,
  },
  cornerTR: {
    position: "absolute",
    top: 14,
    right: 14,
    width: CORNER_LEN,
    height: CORNER_LEN,
    borderTopWidth: CORNER_THICK,
    borderRightWidth: CORNER_THICK,
    borderColor: CORNER_COLOR,
    borderTopRightRadius: 4,
  },
  cornerBL: {
    position: "absolute",
    bottom: 14,
    left: 14,
    width: CORNER_LEN,
    height: CORNER_LEN,
    borderBottomWidth: CORNER_THICK,
    borderLeftWidth: CORNER_THICK,
    borderColor: CORNER_COLOR,
    borderBottomLeftRadius: 4,
  },
  cornerBR: {
    position: "absolute",
    bottom: 14,
    right: 14,
    width: CORNER_LEN,
    height: CORNER_LEN,
    borderBottomWidth: CORNER_THICK,
    borderRightWidth: CORNER_THICK,
    borderColor: CORNER_COLOR,
    borderBottomRightRadius: 4,
  },

  crownArea: {
    width: 88,
    height: 88,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  ringWrap: {
    position: "absolute",
    width: 110,
    height: 110,
    alignItems: "center",
    justifyContent: "center",
  },
  ringDot: {
    position: "absolute",
    top: 0,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#FFD980",
    shadowColor: "#FFD980",
    shadowOpacity: 0.9,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  ringDot2: { top: undefined, bottom: 0 },
  ringDot3: { top: "50%", left: 0, marginTop: -2.5 },
  ringDot4: { top: "50%", right: 0, marginTop: -2.5 },
  crownGlow: {
    position: "absolute",
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(242,184,75,0.32)",
  },
  crownCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  crownCircleBest: {
    backgroundColor: "rgba(242,184,75,0.10)",
    borderColor: "rgba(255,217,128,0.55)",
  },
  crownCircleEnd: {
    backgroundColor: "rgba(225,74,63,0.08)",
    borderColor: "rgba(225,74,63,0.45)",
  },

  gameOverLabel: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    color: "#F0F4FF",
    letterSpacing: 6,
    textTransform: "uppercase",
    marginBottom: 10,
    textAlign: "center",
  },
  subRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 26,
  },
  subDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(127,224,204,0.50)",
  },
  noMovesText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: "#7FE0CC",
    letterSpacing: 2.6,
    textTransform: "uppercase",
  },

  newBestBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(242,184,75,0.12)",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(255,217,128,0.42)",
    marginBottom: 18,
  },
  newBestLabel: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    color: "#FFD980",
    letterSpacing: 2.4,
    textTransform: "uppercase",
  },

  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 28,
  },
  scoreChip: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 4,
  },
  divider: {
    width: 1,
    height: 48,
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  scoreLabel: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    color: "#9DB0C5",
    letterSpacing: 2.6,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  scoreValue: {
    fontSize: 34,
    fontFamily: "Inter_700Bold",
    color: "#F0F4FF",
    letterSpacing: 0.5,
  },

  primaryBtn: {
    borderRadius: 28,
    overflow: "hidden",
    width: "100%",
    marginBottom: 8,
  },
  primaryBtnGradient: {
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  primaryBtnText: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    letterSpacing: 3.2,
    textTransform: "uppercase",
  },
  secondaryBtn: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  secondaryBtnText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: "#7A8AA0",
    letterSpacing: 3,
    textTransform: "uppercase",
  },
});
