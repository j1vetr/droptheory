import {
  ChevronLeft,
  type LucideIcon,
  Smartphone,
  Volume2,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { fxBack } from "@/utils/feedback";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Language } from "@/constants/translations";
import { useLanguage } from "@/context/LanguageContext";
import {
  getHapticEnabled,
  getSoundEnabled,
  loadFeedbackPrefs,
  setHapticPref,
  setSoundPref,
} from "@/utils/feedback";

export default function SettingsScreen() {
  const { t, language, setLanguage } = useLanguage();
  const insets = useSafeAreaInsets();
  const [soundOn, setSoundOn] = useState(true);
  const [hapticOn, setHapticOn] = useState(true);

  useEffect(() => {
    loadFeedbackPrefs().then(() => {
      setSoundOn(getSoundEnabled());
      setHapticOn(getHapticEnabled());
    });
  }, []);

  const onToggleSound = (val: boolean) => {
    setSoundOn(val);
    setSoundPref(val);
  };
  const onToggleHaptic = (val: boolean) => {
    setHapticOn(val);
    setHapticPref(val);
  };

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
        colors={["#3D2670", "#241548", "#13082B"]}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      <View style={styles.header}>
        <Pressable
          onPress={() => {
            fxBack();
            router.back();
          }}
          style={styles.backBtn}
          hitSlop={6}
        >
          <ChevronLeft size={22} color="#C8B89A" strokeWidth={2.5} />
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

        <View style={styles.section}>
          <ToggleRow
            Icon={Volume2}
            label={t.sound}
            value={soundOn}
            onChange={onToggleSound}
          />
          <ToggleRow
            Icon={Smartphone}
            label={t.vibration}
            value={hapticOn}
            onChange={onToggleHaptic}
          />
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

function ToggleRow({
  Icon,
  label,
  value,
  onChange,
}: {
  Icon: LucideIcon;
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleLeft}>
        <Icon size={18} color="#C8A96E" strokeWidth={2} />
        <Text style={styles.toggleLabel}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: "#2A1F45", true: "#B07E28" }}
        thumbColor={value ? "#E8C870" : "#7A6F88"}
        ios_backgroundColor="#2A1F45"
      />
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
    backgroundColor: "#241548",
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
    marginBottom: 28,
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
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1C1934",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  toggleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  toggleLabel: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: "#E8E4DE",
    letterSpacing: 0.5,
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
