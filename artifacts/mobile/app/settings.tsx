import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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

import { Language } from "@/constants/translations";
import { useLanguage } from "@/context/LanguageContext";

export default function SettingsScreen() {
  const { t, language, setLanguage } = useLanguage();
  const insets = useSafeAreaInsets();

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
        colors={["#262148", "#181432", "#0F0C22"]}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={6}>
          <Ionicons name="chevron-back" size={22} color="#C8B89A" />
        </Pressable>
        <Text style={styles.headerTitle}>{t.settings}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t.language}</Text>
          <View style={styles.languageRow}>
            <LanguageBtn
              label={t.english}
              lang="en"
              current={language}
              onSelect={setLanguage}
            />
            <LanguageBtn
              label={t.turkish}
              lang="tr"
              current={language}
              onSelect={setLanguage}
            />
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoBlock}>
          <Text style={styles.appName}>DROP THEORY</Text>
          <Text style={styles.appVersion}>v1.0</Text>
        </View>
      </View>
    </View>
  );
}

function LanguageBtn({
  label,
  lang,
  current,
  onSelect,
}: {
  label: string;
  lang: Language;
  current: Language;
  onSelect: (l: Language) => void;
}) {
  const active = lang === current;
  return (
    <TouchableOpacity
      style={[styles.langBtn, active && styles.langBtnActive]}
      activeOpacity={0.72}
      onPress={() => onSelect(lang)}
    >
      {active && <View style={styles.langBtnActiveDot} />}
      <Text style={[styles.langBtnText, active && styles.langBtnTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#181432",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginLeft: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#E8E4DE",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 36,
  },
  section: {
    marginBottom: 36,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    color: "#5A5448",
    letterSpacing: 2.5,
    textTransform: "uppercase",
    marginBottom: 16,
  },
  languageRow: {
    flexDirection: "row",
    gap: 12,
  },
  langBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1C1934",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    gap: 6,
    flexDirection: "row",
  },
  langBtnActive: {
    backgroundColor: "rgba(176,126,40,0.10)",
    borderColor: "#B07E28",
  },
  langBtnActiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#D4A83A",
  },
  langBtnText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: "#5A5448",
    letterSpacing: 0.5,
  },
  langBtnTextActive: {
    color: "#D4A83A",
    fontFamily: "Inter_600SemiBold",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginBottom: 36,
  },
  infoBlock: {
    alignItems: "center",
    gap: 4,
  },
  appName: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: "rgba(90,84,72,0.55)",
    letterSpacing: 5,
  },
  appVersion: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "rgba(90,84,72,0.35)",
    letterSpacing: 1,
  },
});
