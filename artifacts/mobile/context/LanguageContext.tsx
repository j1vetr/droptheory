import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { NativeModules, Platform } from "react-native";

import { Language, Translations, translations } from "@/constants/translations";

const STORAGE_KEY = "drop_theory_language";

function detectDeviceLanguage(): Language {
  try {
    let locale = "en";
    if (Platform.OS === "ios") {
      locale =
        NativeModules.SettingsManager?.settings?.AppleLocale ||
        NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] ||
        "en";
    } else if (Platform.OS === "android") {
      locale = NativeModules.I18nManager?.localeIdentifier || "en";
    } else {
      locale = navigator?.language || "en";
    }
    if (locale.startsWith("tr")) return "tr";
  } catch {}
  return "en";
}

interface LanguageContextType {
  language: Language;
  t: Translations;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  t: translations.en,
  setLanguage: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === "en" || stored === "tr") {
        setLanguageState(stored);
      } else {
        setLanguageState(detectDeviceLanguage());
      }
    });
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    AsyncStorage.setItem(STORAGE_KEY, lang);
  }, []);

  return (
    <LanguageContext.Provider
      value={{ language, t: translations[language], setLanguage }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
