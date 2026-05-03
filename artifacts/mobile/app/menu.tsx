import AsyncStorage from "@react-native-async-storage/async-storage";
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
    shadowColor: "#C8A96E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
  },
  android: { elevation: 6 },
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
            activeOpacity={0.8}
            onPress={() => router.push("/game?resume=1")}
          >
            <Text style={styles.continueBtnText}>{t.continue}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.primaryBtn, primaryBtnShadow]}
          activeOpacity={0.8}
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
    backgroundColor: "#0D0D0D",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 32,
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
    color: "#6B6354",
  },
  settingsLabel: {
    fontSize: 8,
    fontFamily: "Inter_500Medium",
    color: "#6B6354",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginTop: 2,
  },
  titleBlock: {
    alignItems: "center",
    marginTop: 72,
    gap: 20,
  },
  titleDecoration: {
    width: 32,
    height: 1,
    backgroundColor: "#C8A96E",
    opacity: 0.6,
  },
  title: {
    fontSize: 52,
    fontFamily: "Inter_700Bold",
    color: "#F5F0E8",
    textAlign: "center",
    lineHeight: 56,
    letterSpacing: 4,
  },
  hints: {
    width: "100%",
    gap: 12,
    paddingHorizontal: 8,
  },
  hintRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  hintDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#C8A96E",
    opacity: 0.7,
  },
  hintText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#6B6354",
    letterSpacing: 0.3,
  },
  buttons: {
    width: "100%",
    gap: 12,
  },
  continueBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(200,169,110,0.40)",
    backgroundColor: "rgba(200,169,110,0.06)",
  },
  continueBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#C8A96E",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  primaryBtn: {
    backgroundColor: "#C8A96E",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#0D0D0D",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  footer: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: "rgba(107,99,84,0.4)",
    letterSpacing: 3,
    marginBottom: 8,
  },
});
