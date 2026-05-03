import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useLanguage } from "@/context/LanguageContext";

const GAME_SAVE_KEY = "drop_theory_saved_game";

const primaryBtnShadow = Platform.select({
  ios: {
    shadowColor: "#B07E28",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.38,
    shadowRadius: 14,
  },
  android: { elevation: 10 },
  default: {},
});

// Slow-drifting semi-transparent shape for background depth
function DriftShape({
  style,
  dx,
  dy,
}: {
  style: object;
  dx: Animated.Value;
  dy: Animated.Value;
}) {
  return (
    <Animated.View
      pointerEvents="none"
      style={[style, { transform: [{ translateX: dx }, { translateY: dy }] }]}
    />
  );
}

export default function MenuScreen() {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [hasSave, setHasSave] = useState(false);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem(GAME_SAVE_KEY).then((val) => setHasSave(!!val));
    }, [])
  );

  // Four independent drift animations
  const d = useRef(
    Array.from({ length: 4 }, () => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    const drift = (
      val: Animated.Value,
      range: number,
      duration: number,
      delay: number
    ) => {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, {
            toValue: range,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(val, {
            toValue: -range,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
      return loop;
    };

    const cfg = [
      [14, 18, 9000, 10000, 0, 500],
      [20, 12, 10500, 8500, 1000, 0],
      [10, 22, 8000, 11000, 0, 800],
      [18, 14, 11500, 9500, 600, 200],
    ];
    const anims = cfg.map(([xr, yr, xd, yd, xdel, ydel], i) => [
      drift(d[i].x, xr, xd, xdel),
      drift(d[i].y, yr, yd, ydel),
    ]);

    return () => {
      anims.forEach(([ax, ay]) => {
        ax.stop();
        ay.stop();
      });
    };
  }, [d]);

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

      {/* Drifting background shapes */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <DriftShape
          style={styles.drift1}
          dx={d[0].x}
          dy={d[0].y}
        />
        <DriftShape
          style={styles.drift2}
          dx={d[1].x}
          dy={d[1].y}
        />
        <DriftShape
          style={styles.drift3}
          dx={d[2].x}
          dy={d[2].y}
        />
        <DriftShape
          style={styles.drift4}
          dx={d[3].x}
          dy={d[3].y}
        />
      </View>

      <Pressable
        style={[styles.settingsBtn, { top: topPad + 8 }]}
        onPress={() => router.push("/settings")}
      >
        <Text style={styles.settingsIcon}>⚙</Text>
        <Text style={styles.settingsLabel}>{t.settings}</Text>
      </Pressable>

      <View style={styles.titleBlock}>
        <View style={styles.titleDecoration} />
        <Text style={styles.title}>DROP{"\n"}THEORY</Text>
        <View style={styles.titleDecoration} />
        <Text style={styles.tagline}>{t.tagline}</Text>
      </View>

      <View style={styles.hints}>
        <HintRow text={t.tutorial1} />
        <HintRow text={t.tutorial2} />
        <HintRow text={t.tutorial3} />
      </View>

      <View style={styles.buttons}>
        {hasSave && (
          <TouchableOpacity
            style={styles.continueBtn}
            activeOpacity={0.78}
            onPress={() => router.push("/game?resume=1")}
          >
            <Text style={styles.continueBtnText}>{t.continue}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.primaryBtn, primaryBtnShadow]}
          activeOpacity={0.78}
          onPress={() => router.push("/game")}
        >
          <Text style={styles.primaryBtnText}>{t.play}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>— DROP THEORY —</Text>
    </View>
  );
}

function HintRow({ text }: { text: string }) {
  return (
    <View style={styles.hintRow}>
      <View style={styles.hintDot} />
      <Text style={styles.hintText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111118",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 32,
    overflow: "hidden",
  },
  // Drifting background shapes
  drift1: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 14,
    backgroundColor: "#2D6494",
    opacity: 0.07,
    top: "8%",
    left: "-12%",
  },
  drift2: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 10,
    backgroundColor: "#B05730",
    opacity: 0.07,
    top: "58%",
    right: "-8%",
  },
  drift3: {
    position: "absolute",
    width: 70,
    height: 160,
    borderRadius: 12,
    backgroundColor: "#4B7A5A",
    opacity: 0.06,
    top: "28%",
    right: "4%",
  },
  drift4: {
    position: "absolute",
    width: 110,
    height: 80,
    borderRadius: 10,
    backgroundColor: "#6A59A4",
    opacity: 0.07,
    top: "72%",
    left: "-8%",
  },
  settingsBtn: {
    position: "absolute",
    right: 20,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  settingsIcon: {
    fontSize: 18,
    color: "#5A5448",
  },
  settingsLabel: {
    fontSize: 8,
    fontFamily: "Inter_500Medium",
    color: "#5A5448",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginTop: 2,
  },
  titleBlock: {
    alignItems: "center",
    marginTop: 72,
    gap: 16,
  },
  titleDecoration: {
    width: 36,
    height: 1.5,
    backgroundColor: "#B07E28",
    opacity: 0.7,
  },
  title: {
    fontSize: 54,
    fontFamily: "Inter_700Bold",
    color: "#F0EDE8",
    textAlign: "center",
    lineHeight: 58,
    letterSpacing: 5,
  },
  tagline: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#6B6354",
    letterSpacing: 1.5,
    textAlign: "center",
    marginTop: 4,
    fontStyle: "italic",
  },
  hints: {
    width: "100%",
    gap: 10,
    paddingHorizontal: 4,
    backgroundColor: "rgba(255,255,255,0.025)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    paddingVertical: 16,
  },
  hintRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
  },
  hintDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#B07E28",
    opacity: 0.75,
  },
  hintText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#5A5448",
    letterSpacing: 0.3,
  },
  buttons: {
    width: "100%",
    gap: 12,
  },
  continueBtn: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(176,126,40,0.45)",
    backgroundColor: "rgba(176,126,40,0.07)",
  },
  continueBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#D4A83A",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  primaryBtn: {
    backgroundColor: "#B07E28",
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
  },
  primaryBtnText: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: "#FDFAF4",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  footer: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: "rgba(90,84,72,0.45)",
    letterSpacing: 3,
    marginBottom: 8,
  },
});
