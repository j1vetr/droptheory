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

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{t.settings}</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.content}>
        {/* Language section */}
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

        {/* App info */}
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
      activeOpacity={0.75}
      onPress={() => onSelect(lang)}
    >
      <Text style={[styles.langBtnText, active && styles.langBtnTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0D0D",
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
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  backText: {
    fontSize: 24,
    color: "#6B6354",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#F5F0E8",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    color: "#6B6354",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 16,
  },
  languageRow: {
    flexDirection: "row",
    gap: 12,
  },
  langBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#1C1C1C",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  langBtnActive: {
    backgroundColor: "rgba(200,169,110,0.12)",
    borderColor: "#C8A96E",
  },
  langBtnText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: "#6B6354",
    letterSpacing: 0.5,
  },
  langBtnTextActive: {
    color: "#C8A96E",
    fontFamily: "Inter_600SemiBold",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginBottom: 32,
  },
  infoBlock: {
    alignItems: "center",
    gap: 4,
  },
  appName: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: "rgba(107,99,84,0.5)",
    letterSpacing: 4,
  },
  appVersion: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "rgba(107,99,84,0.3)",
    letterSpacing: 1,
  },
});
