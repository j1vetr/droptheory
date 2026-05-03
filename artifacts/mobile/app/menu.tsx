import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useLanguage } from "@/context/LanguageContext";

const GAME_SAVE_KEY = "drop_theory_saved_game";

let hasPlayedIntro = false;

const primaryBtnShadow = Platform.select({
  ios: {
    shadowColor: "#B07E28",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  android: { elevation: 14 },
  default: {},
});

const previewShadow = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.55,
    shadowRadius: 24,
  },
  android: { elevation: 16 },
  default: {},
});

// Sample composition for the hero mini-board — uses every palette color
const HERO_LAYOUT: (string | null)[][] = [
  [null,      "#2D6494", "#2D6494", null,      "#6A59A4", "#B07E28"],
  ["#A84E6E", "#A84E6E", "#2D6494", "#4B7A5A", "#4B7A5A", "#B07E28"],
  ["#A84E6E", null,      "#327068", "#4B7A5A", "#2E7B8A", "#2E7B8A"],
];

const HERO_CELL = 32;

function HeroMiniBoard() {
  const cs = HERO_CELL;
  const rows = HERO_LAYOUT.length;
  const cols = HERO_LAYOUT[0].length;
  return (
    <View
      style={[
        styles.miniBoard,
        previewShadow,
        { width: cols * cs + 16, height: rows * cs + 16 },
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
                padding: 2,
              }}
            >
              {color ? (
                <View
                  style={{
                    flex: 1,
                    backgroundColor: color,
                    borderRadius: 6,
                    borderWidth: 0.8,
                    borderColor: "rgba(255,255,255,0.20)",
                    overflow: "hidden",
                  }}
                >
                  <View
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: "36%",
                      backgroundColor: "rgba(255,255,255,0.26)",
                      borderTopLeftRadius: 5,
                      borderTopRightRadius: 5,
                    }}
                  />
                  <View
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: "22%",
                      backgroundColor: "rgba(0,0,0,0.32)",
                      borderBottomLeftRadius: 5,
                      borderBottomRightRadius: 5,
                    }}
                  />
                </View>
              ) : (
                <View
                  style={{
                    flex: 1,
                    backgroundColor: "rgba(255,255,255,0.04)",
                    borderRadius: 4,
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

// Drifting colorful tiles in the background — pure decoration
const BG_TILES: { color: string; size: number; top: number; left: number; rotate: number; opacity: number }[] = [
  { color: "#2D6494", size: 28, top: 110, left: 24,  rotate: -12, opacity: 0.55 },
  { color: "#A84E6E", size: 18, top: 180, left: 320, rotate:  18, opacity: 0.45 },
  { color: "#4B7A5A", size: 22, top: 520, left: 30,  rotate:   8, opacity: 0.4 },
  { color: "#B07E28", size: 16, top: 600, left: 340, rotate: -22, opacity: 0.5 },
  { color: "#6A59A4", size: 14, top: 70,  left: 280, rotate:  30, opacity: 0.4 },
  { color: "#2E7B8A", size: 20, top: 480, left: 300, rotate: -8,  opacity: 0.45 },
];

function DecorativeTile({
  color, size, top, left, rotate, opacity,
}: typeof BG_TILES[number]) {
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        top,
        left,
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: 5,
        opacity,
        borderWidth: 0.6,
        borderColor: "rgba(255,255,255,0.18)",
        transform: [{ rotate: `${rotate}deg` }],
        overflow: "hidden",
      }}
    >
      <View
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: "36%",
          backgroundColor: "rgba(255,255,255,0.22)",
        }}
      />
    </View>
  );
}

export default function MenuScreen() {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [hasSave, setHasSave] = useState(false);
  const playedRef = useRef(hasPlayedIntro);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem(GAME_SAVE_KEY).then((val) => setHasSave(!!val));
    }, [])
  );

  const playIntro = !playedRef.current;
  if (!hasPlayedIntro) hasPlayedIntro = true;

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
      <LinearGradient
        colors={["#1A1822", "#111118", "#0B0B12"]}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      {BG_TILES.map((t, i) => (
        <DecorativeTile key={i} {...t} />
      ))}

      <Pressable
        style={[styles.settingsBtn, { top: topPad + 12 }]}
        onPress={() => router.push("/settings")}
        hitSlop={8}
      >
        <Ionicons name="settings-outline" size={18} color="#C8A96E" />
      </Pressable>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.hero}>
          {playIntro ? (
            <Animated.Text
              entering={FadeInDown.duration(420)}
              style={styles.title}
            >
              DROP{"\n"}THEORY
            </Animated.Text>
          ) : (
            <Text style={styles.title}>DROP{"\n"}THEORY</Text>
          )}

          {playIntro ? (
            <Animated.Text
              entering={FadeInDown.duration(360).delay(100)}
              style={styles.tagline}
            >
              {t.tagline}
            </Animated.Text>
          ) : (
            <Text style={styles.tagline}>{t.tagline}</Text>
          )}

          {playIntro ? (
            <Animated.View
              entering={FadeInDown.duration(420).delay(200)}
              style={styles.heroPreviewWrap}
            >
              <HeroMiniBoard />
            </Animated.View>
          ) : (
            <View style={styles.heroPreviewWrap}>
              <HeroMiniBoard />
            </View>
          )}
        </View>

        <View style={styles.buttons}>
          {hasSave ? (
            <>
              {playIntro ? (
                <Animated.View entering={FadeInDown.duration(360).delay(360)} style={{ width: "100%" }}>
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
                </Animated.View>
              ) : (
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
              )}
              <TouchableOpacity
                style={styles.secondaryBtn}
                activeOpacity={0.7}
                onPress={() => router.push("/game")}
              >
                <Text style={styles.secondaryBtnText}>{t.newGame}</Text>
              </TouchableOpacity>
            </>
          ) : playIntro ? (
            <Animated.View entering={FadeInDown.duration(360).delay(360)} style={{ width: "100%" }}>
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
            </Animated.View>
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111118",
    overflow: "hidden",
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 28,
    paddingBottom: 12,
    gap: 24,
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
    marginTop: 84,
    gap: 14,
  },
  title: {
    fontSize: 56,
    fontFamily: "Inter_700Bold",
    color: "#F4F1EA",
    textAlign: "center",
    lineHeight: 60,
    letterSpacing: 5,
    textShadowColor: "rgba(176,126,40,0.55)",
    textShadowOffset: { width: 0, height: 6 },
    textShadowRadius: 22,
  },
  tagline: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: "#C8A96E",
    letterSpacing: 1.6,
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 4,
  },
  heroPreviewWrap: {
    marginTop: 26,
    alignItems: "center",
  },
  miniBoard: {
    backgroundColor: "#15151C",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  buttons: {
    width: "100%",
    gap: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  primaryBtn: {
    backgroundColor: "#B07E28",
    borderRadius: 16,
    paddingVertical: 19,
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
    letterSpacing: 2.4,
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
