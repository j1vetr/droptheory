import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useState } from "react";
import {
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
    shadowOpacity: 0.42,
    shadowRadius: 16,
  },
  android: { elevation: 12 },
  default: {},
});

const previewShadow = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
  },
  android: { elevation: 12 },
  default: {},
});

// Sample composition for the hero mini-board
const HERO_LAYOUT: (string | null)[][] = [
  [null,      "#2D6494", "#2D6494", null,      null,      "#B07E28"],
  ["#A84E6E", "#A84E6E", "#2D6494", "#4B7A5A", "#4B7A5A", "#B07E28"],
  ["#A84E6E", null,      null,      "#4B7A5A", "#2E7B8A", "#2E7B8A"],
];

function HeroMiniBoard() {
  const cs = 22;
  const rows = HERO_LAYOUT.length;
  const cols = HERO_LAYOUT[0].length;
  return (
    <View
      style={[
        styles.miniBoard,
        previewShadow,
        { width: cols * cs + 12, height: rows * cs + 12 },
      ]}
    >
      <View style={{ width: cols * cs, height: rows * cs }}>
        {HERO_LAYOUT.map((row, r) =>
          row.map((color, c) => (
            <View
              key={`${r},${c}`}
              style={{
                position: "absolute",
                top: r * cs,
                left: c * cs,
                width: cs,
                height: cs,
                padding: 1.5,
              }}
            >
              {color ? (
                <View
                  style={{
                    flex: 1,
                    backgroundColor: color,
                    borderRadius: 4,
                    borderWidth: 0.6,
                    borderColor: "rgba(255,255,255,0.18)",
                    overflow: "hidden",
                  }}
                >
                  <View
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: "32%",
                      backgroundColor: "rgba(255,255,255,0.24)",
                      borderTopLeftRadius: 4,
                      borderTopRightRadius: 4,
                    }}
                  />
                  <View
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: "22%",
                      backgroundColor: "rgba(0,0,0,0.28)",
                      borderBottomLeftRadius: 4,
                      borderBottomRightRadius: 4,
                    }}
                  />
                </View>
              ) : (
                <View
                  style={{
                    flex: 1,
                    backgroundColor: "rgba(255,255,255,0.03)",
                    borderRadius: 3,
                  }}
                />
              )}
            </View>
          ))
        )}
      </View>
    </View>
  );
}

const FEATURE_DOTS = ["#2D6494", "#B07E28", "#A84E6E"];

export default function MenuScreen() {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [hasSave, setHasSave] = useState(false);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem(GAME_SAVE_KEY).then((val) => setHasSave(!!val));
    }, [])
  );

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const bottomPad = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  const tutorials = [t.tutorial1, t.tutorial2, t.tutorial3];

  return (
    <View
      style={[
        styles.container,
        { paddingTop: topPad, paddingBottom: bottomPad },
      ]}
    >
      <StatusBar style="light" />
      <LinearGradient
        colors={["#1A1822", "#111118", "#0B0B12"]}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      <Pressable
        style={[styles.settingsBtn, { top: topPad + 12 }]}
        onPress={() => router.push("/settings")}
        hitSlop={8}
      >
        <Ionicons name="settings-outline" size={18} color="#C8A96E" />
      </Pressable>

      <View style={styles.hero}>
        <Text style={styles.eyebrow}>PUZZLE · GRAVITY · COMBO</Text>
        <Text style={styles.title}>DROP{"\n"}THEORY</Text>
        <Text style={styles.tagline}>{t.tagline}</Text>
        <View style={styles.heroPreviewWrap}>
          <HeroMiniBoard />
        </View>
      </View>

      <View style={styles.features}>
        {tutorials.map((text, i) => (
          <View key={i} style={styles.featureCard}>
            <View
              style={[
                styles.featureDot,
                { backgroundColor: FEATURE_DOTS[i] },
              ]}
            />
            <Text style={styles.featureText}>{text}</Text>
          </View>
        ))}
      </View>

      <View style={styles.buttons}>
        {hasSave ? (
          <>
            <TouchableOpacity
              style={[styles.primaryBtn, primaryBtnShadow]}
              activeOpacity={0.82}
              onPress={() => router.push("/game?resume=1")}
            >
              <View style={styles.primaryBtnInner}>
                <Ionicons name="play" size={18} color="#FDFAF4" />
                <Text style={styles.primaryBtnText}>{t.continue}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryBtn}
              activeOpacity={0.7}
              onPress={() => router.push("/game")}
            >
              <Text style={styles.secondaryBtnText}>{t.newGame}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[styles.primaryBtn, primaryBtnShadow]}
            activeOpacity={0.82}
            onPress={() => router.push("/game")}
          >
            <View style={styles.primaryBtnInner}>
              <Ionicons name="play" size={18} color="#FDFAF4" />
              <Text style={styles.primaryBtnText}>{t.play}</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111118",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 28,
    overflow: "hidden",
  },
  settingsBtn: {
    position: "absolute",
    right: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(200,169,110,0.06)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(200,169,110,0.22)",
    zIndex: 10,
  },
  hero: {
    alignItems: "center",
    marginTop: 56,
    gap: 10,
  },
  eyebrow: {
    fontSize: 9,
    fontFamily: "Inter_600SemiBold",
    color: "#B07E28",
    letterSpacing: 4,
    marginBottom: 2,
  },
  title: {
    fontSize: 52,
    fontFamily: "Inter_700Bold",
    color: "#F4F1EA",
    textAlign: "center",
    lineHeight: 56,
    letterSpacing: 5,
  },
  tagline: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#7A7266",
    letterSpacing: 1.4,
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 2,
  },
  heroPreviewWrap: {
    marginTop: 18,
    alignItems: "center",
  },
  miniBoard: {
    backgroundColor: "#15151C",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    padding: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  features: {
    width: "100%",
    gap: 8,
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255,255,255,0.035)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  featureText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#9A9180",
    letterSpacing: 0.3,
  },
  buttons: {
    width: "100%",
    gap: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryBtn: {
    backgroundColor: "#B07E28",
    borderRadius: 16,
    paddingVertical: 18,
    width: "100%",
    alignItems: "center",
  },
  primaryBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  primaryBtnText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#FDFAF4",
    letterSpacing: 2.2,
    textTransform: "uppercase",
  },
  secondaryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(176,126,40,0.4)",
    backgroundColor: "transparent",
    borderRadius: 12,
    minWidth: 180,
  },
  secondaryBtnText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "rgba(212,168,58,0.8)",
    letterSpacing: 2.2,
    textTransform: "uppercase",
  },
});
