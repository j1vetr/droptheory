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
    shadowOpacity: 0.38,
    shadowRadius: 14,
  },
  android: { elevation: 10 },
  default: {},
});

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

  return (
    <View
      style={[
        styles.container,
        { paddingTop: topPad, paddingBottom: bottomPad },
      ]}
    >
      <StatusBar style="light" />
      <LinearGradient
        colors={["#16161E", "#111118", "#0E0E14"]}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      <Pressable
        style={[styles.settingsBtn, { top: topPad + 12 }]}
        onPress={() => router.push("/settings")}
        hitSlop={8}
      >
        <Ionicons name="settings-outline" size={18} color="#B07E28" />
      </Pressable>

      <View style={styles.titleBlock}>
        <View style={styles.puzzleMotif}>
          <View style={[styles.motifTile, { backgroundColor: "#B07E28" }]} />
          <View style={[styles.motifTile, { backgroundColor: "#2E7B8A" }]} />
          <View style={[styles.motifTile, { backgroundColor: "#B05730" }]} />
        </View>
        <Text style={styles.title}>DROP{"\n"}THEORY</Text>
        <Text style={styles.tagline}>{t.tagline}</Text>
      </View>

      <View style={styles.hints}>
        <HintRow text={t.tutorial1} />
        <HintRow text={t.tutorial2} />
        <HintRow text={t.tutorial3} />
      </View>

      <View style={styles.buttons}>
        {hasSave ? (
          <>
            <TouchableOpacity
              style={[styles.primaryBtn, primaryBtnShadow]}
              activeOpacity={0.78}
              onPress={() => router.push("/game?resume=1")}
            >
              <Text style={styles.primaryBtnText}>{t.continue}</Text>
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
            activeOpacity={0.78}
            onPress={() => router.push("/game")}
          >
            <Text style={styles.primaryBtnText}>{t.play}</Text>
          </TouchableOpacity>
        )}
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
  settingsBtn: {
    position: "absolute",
    right: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(200,169,110,0.06)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(200,169,110,0.22)",
    zIndex: 10,
  },
  titleBlock: {
    alignItems: "center",
    marginTop: 72,
    gap: 18,
  },
  puzzleMotif: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 4,
  },
  motifTile: {
    width: 8,
    height: 8,
    borderRadius: 2,
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
    gap: 10,
    alignItems: "center",
  },
  primaryBtn: {
    backgroundColor: "#B07E28",
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
    width: "100%",
  },
  primaryBtnText: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: "#FDFAF4",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  secondaryBtn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  secondaryBtnText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "rgba(212,168,58,0.55)",
    letterSpacing: 2.2,
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
