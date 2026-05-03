import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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

import PuffyBlock from "@/components/PuffyBlock";
import { useLanguage } from "@/context/LanguageContext";

const GAME_SAVE_KEY = "drop_theory_saved_game";

let hasPlayedIntro = false;

const primaryBtnShadow = Platform.select({
  ios: {
    shadowColor: "#2E8C7C",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.55,
    shadowRadius: 22,
  },
  android: { elevation: 16 },
  default: {},
});

const previewShadow = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.6,
    shadowRadius: 26,
  },
  android: { elevation: 18 },
  default: {},
});

const blockShadow = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
  },
  android: { elevation: 6 },
  default: {},
});

// Hero mini-board sample composition — uses every palette color
const HERO_LAYOUT: (string | null)[][] = [
  [null,      "#5DADE2", "#5DADE2", null,      "#B084DC", "#F2B84B"],
  ["#E76F61", "#E76F61", "#5DADE2", "#7FB77E", "#7FB77E", "#F2B84B"],
  ["#E76F61", null,      "#45C4B0", "#7FB77E", "#45C4B0", "#45C4B0"],
];

const HERO_CELL = 30;

function HeroMiniBoard() {
  const cs = HERO_CELL;
  const rows = HERO_LAYOUT.length;
  const cols = HERO_LAYOUT[0].length;
  return (
    <View style={[styles.miniBoardFrame, previewShadow]}>
      <View style={styles.miniBoardInner}>
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
                  <PuffyBlock color={color} size={cs - 4} />
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
    </View>
  );
}

// Floating decorative 3D blocks scattered around the periphery
const BG_BLOCKS: { color: string; size: number; top: number; left: number; rotate: number }[] = [
  { color: "#F2B84B", size: 38, top: 100, left: 24,  rotate: -14 },
  { color: "#B084DC", size: 32, top: 170, left: 332, rotate:  20 },
  { color: "#5DADE2", size: 28, top: 380, left: 18,  rotate: -8 },
  { color: "#E76F61", size: 30, top: 410, left: 348, rotate:  16 },
  { color: "#7FB77E", size: 26, top: 580, left: 32,  rotate:  10 },
  { color: "#ED8B5C", size: 22, top: 640, left: 354, rotate: -18 },
  { color: "#45C4B0", size: 18, top: 80,  left: 290, rotate:  28 },
];

function DecorativeBlock({
  color, size, top, left, rotate,
}: typeof BG_BLOCKS[number]) {
  return (
    <View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          top,
          left,
          transform: [{ rotate: `${rotate}deg` }],
        },
        blockShadow,
      ]}
    >
      <PuffyBlock color={color} size={size} />
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

  const goPlay = (resume: boolean) =>
    router.push(resume ? "/game?resume=1" : "/game");

  return (
    <View
      style={[
        styles.container,
        { paddingTop: topPad, paddingBottom: bottomPad },
      ]}
    >
      <StatusBar style="light" />
      <LinearGradient
        colors={["#3D2670", "#241548", "#13082B"]}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      {/* Soft purple glow */}
      <View
        pointerEvents="none"
        style={[
          styles.glow,
          { top: topPad + 80, left: -50 },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.glow,
          {
            top: topPad + 200,
            right: -80,
            backgroundColor: "rgba(69,196,176,0.12)",
          },
        ]}
      />

      {BG_BLOCKS.map((b, i) => (
        <DecorativeBlock key={i} {...b} />
      ))}

      <Pressable
        style={[styles.settingsBtn, { top: topPad + 12 }]}
        onPress={() => router.push("/settings")}
        hitSlop={8}
      >
        <Ionicons name="settings-outline" size={18} color="#7FE0CC" />
      </Pressable>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.hero}>
          {playIntro ? (
            <Animated.View entering={FadeInDown.duration(380)} style={styles.crownWrap}>
              <MaterialCommunityIcons name="crown" size={26} color="#F2B84B" />
            </Animated.View>
          ) : (
            <View style={styles.crownWrap}>
              <MaterialCommunityIcons name="crown" size={26} color="#F2B84B" />
            </View>
          )}

          {playIntro ? (
            <Animated.Text
              entering={FadeInDown.duration(420).delay(60)}
              style={styles.titleDrop}
            >
              DROP
            </Animated.Text>
          ) : (
            <Text style={styles.titleDrop}>DROP</Text>
          )}

          {playIntro ? (
            <Animated.Text
              entering={FadeInDown.duration(420).delay(120)}
              style={styles.titleTheory}
            >
              THEORY
            </Animated.Text>
          ) : (
            <Text style={styles.titleTheory}>THEORY</Text>
          )}

          {playIntro ? (
            <Animated.Text
              entering={FadeInDown.duration(360).delay(200)}
              style={styles.tagline}
            >
              {t.tagline}
            </Animated.Text>
          ) : (
            <Text style={styles.tagline}>{t.tagline}</Text>
          )}

          {playIntro ? (
            <Animated.View
              entering={FadeInDown.duration(420).delay(280)}
              style={styles.heroPreviewWrap}
            >
              <HeroMiniBoard />
            </Animated.View>
          ) : (
            <View style={styles.heroPreviewWrap}>
              <HeroMiniBoard />
            </View>
          )}

          <View style={styles.ornamentRow}>
            <View style={styles.ornamentLine} />
            <Text style={styles.ornamentStar}>✦</Text>
            <View style={styles.ornamentLine} />
          </View>
        </View>

        <View style={styles.buttons}>
          {playIntro ? (
            <Animated.View entering={FadeInDown.duration(380).delay(380)} style={{ width: "100%" }}>
              <PrimaryButton
                label={hasSave ? t.continue : t.play}
                onPress={() => goPlay(hasSave)}
              />
            </Animated.View>
          ) : (
            <PrimaryButton
              label={hasSave ? t.continue : t.play}
              onPress={() => goPlay(hasSave)}
            />
          )}

          {hasSave && (
            <TouchableOpacity
              style={styles.secondaryBtn}
              activeOpacity={0.7}
              onPress={() => goPlay(false)}
            >
              <Text style={styles.secondaryBtnText}>{t.newGame}</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.footerTabs}>
          <FooterTab icon="trophy-outline" label={t.leaderboard} />
          <FooterTab icon="star-outline" label={t.dailyChallenge} badge />
          <FooterTab icon="gift-outline" label={t.rewards} />
        </View>
      </ScrollView>
    </View>
  );
}

function PrimaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.primaryBtn, primaryBtnShadow]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <LinearGradient
        colors={["#5DDDC4", "#3FB8A0", "#2E8C7C"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.primaryBtnGradient}
      >
        <View style={styles.primaryBtnInner}>
          <Ionicons name="play" size={20} color="#FFFFFF" />
          <Text style={styles.primaryBtnText}>{label}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

function FooterTab({
  icon,
  label,
  badge,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  badge?: boolean;
}) {
  return (
    <View style={styles.footerTab}>
      <View style={styles.footerIconWrap}>
        <Ionicons name={icon} size={22} color="#8FC9D9" />
        {badge && <View style={styles.footerBadge} />}
      </View>
      <Text style={styles.footerLabel}>{label.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#241548",
    overflow: "hidden",
  },
  glow: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "rgba(93,173,226,0.18)",
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 28,
    paddingBottom: 16,
    gap: 16,
  },
  settingsBtn: {
    position: "absolute",
    right: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(127,224,204,0.10)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(127,224,204,0.32)",
    zIndex: 10,
  },
  hero: {
    alignItems: "center",
    marginTop: 50,
    gap: 4,
  },
  crownWrap: {
    marginBottom: 6,
  },
  titleDrop: {
    fontSize: 56,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 60,
    letterSpacing: 4,
    textShadowColor: "rgba(0,0,0,0.45)",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
  },
  titleTheory: {
    fontSize: 56,
    fontFamily: "Inter_700Bold",
    color: "#5DDDC4",
    textAlign: "center",
    lineHeight: 60,
    letterSpacing: 4,
    textShadowColor: "rgba(46,140,124,0.65)",
    textShadowOffset: { width: 0, height: 6 },
    textShadowRadius: 18,
  },
  tagline: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: "#B5E8DC",
    letterSpacing: 1.6,
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 10,
  },
  heroPreviewWrap: {
    marginTop: 22,
    alignItems: "center",
  },
  miniBoardFrame: {
    backgroundColor: "rgba(69,196,176,0.10)",
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "rgba(127,224,204,0.45)",
    padding: 4,
  },
  miniBoardInner: {
    backgroundColor: "#1B0F38",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.35)",
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  ornamentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 18,
    opacity: 0.85,
  },
  ornamentLine: {
    width: 36,
    height: 1,
    backgroundColor: "rgba(127,224,204,0.45)",
  },
  ornamentStar: {
    color: "#7FE0CC",
    fontSize: 12,
  },
  buttons: {
    width: "100%",
    gap: 12,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 8,
  },
  primaryBtn: {
    borderRadius: 30,
    width: "100%",
    overflow: "hidden",
  },
  primaryBtnGradient: {
    paddingVertical: 18,
    alignItems: "center",
    borderRadius: 30,
  },
  primaryBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  primaryBtnText: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  secondaryBtn: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(127,224,204,0.50)",
    backgroundColor: "transparent",
    borderRadius: 30,
    minWidth: "100%",
  },
  secondaryBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#7FE0CC",
    letterSpacing: 2.4,
    textTransform: "uppercase",
  },
  footerTabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingTop: 18,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(127,224,204,0.15)",
    marginTop: 4,
  },
  footerTab: {
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  footerIconWrap: {
    position: "relative",
  },
  footerBadge: {
    position: "absolute",
    top: -2,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E04848",
    borderWidth: 1,
    borderColor: "#241548",
  },
  footerLabel: {
    fontSize: 8,
    fontFamily: "Inter_600SemiBold",
    color: "#9A8AB8",
    letterSpacing: 1.4,
  },
});
