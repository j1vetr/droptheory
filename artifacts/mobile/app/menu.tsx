import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
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

export default function MenuScreen() {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const bottomPad = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  return (
    <View style={[styles.container, { paddingTop: topPad, paddingBottom: bottomPad }]}>
      <StatusBar style="light" />

      {/* Settings button top-right */}
      <Pressable
        style={styles.settingsBtn}
        onPress={() => router.push("/settings")}
      >
        <Text style={styles.settingsIcon}>⚙</Text>
      </Pressable>

      {/* Title block */}
      <View style={styles.titleBlock}>
        <View style={styles.titleDecoration} />
        <Text style={styles.title}>DROP{"\n"}THEORY</Text>
        <View style={styles.titleDecoration} />
      </View>

      {/* Tutorial hints */}
      <View style={styles.hints}>
        <HintRow text={t.tutorial1} />
        <HintRow text={t.tutorial2} />
        <HintRow text={t.tutorial3} />
      </View>

      {/* Buttons */}
      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.primaryBtn}
          activeOpacity={0.8}
          onPress={() => router.push("/game")}
        >
          <Text style={styles.primaryBtnText}>{t.play}</Text>
        </TouchableOpacity>
      </View>

      {/* Footer mark */}
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
    top: 56,
    right: 24,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  settingsIcon: {
    fontSize: 20,
    color: "#6B6354",
  },
  titleBlock: {
    alignItems: "center",
    marginTop: 80,
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
  primaryBtn: {
    backgroundColor: "#C8A96E",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    ...Platform.select({
      ios: { shadowColor: "#C8A96E", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 12 },
      android: { elevation: 6 },
      web: { boxShadow: "0 4px 20px rgba(200,169,110,0.30)" } as any,
    }),
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
