import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

import { playSound, setSoundEnabled } from "@/utils/sounds";

const SOUND_KEY = "drop_theory_sound_enabled";
const HAPTIC_KEY = "drop_theory_haptic_enabled";

let soundOn = true;
let hapticOn = true;
let loaded = false;

export async function loadFeedbackPrefs() {
  if (loaded) return;
  loaded = true;
  try {
    const [s, h] = await Promise.all([
      AsyncStorage.getItem(SOUND_KEY),
      AsyncStorage.getItem(HAPTIC_KEY),
    ]);
    if (s !== null) soundOn = s === "1";
    if (h !== null) hapticOn = h === "1";
  } catch {
    // ignore
  }
  setSoundEnabled(soundOn);
}

export function getSoundEnabled() {
  return soundOn;
}

export function getHapticEnabled() {
  return hapticOn;
}

export async function setSoundPref(value: boolean) {
  soundOn = value;
  setSoundEnabled(value);
  try {
    await AsyncStorage.setItem(SOUND_KEY, value ? "1" : "0");
  } catch {
    // ignore
  }
}

export async function setHapticPref(value: boolean) {
  hapticOn = value;
  try {
    await AsyncStorage.setItem(HAPTIC_KEY, value ? "1" : "0");
  } catch {
    // ignore
  }
}

type SoundName = "place" | "clear" | "combo" | "gameover" | "best";

export function fxPlace() {
  if (hapticOn) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  playSound("place");
}

export function fxInvalid() {
  if (hapticOn) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
}

export function fxPickup() {
  if (hapticOn && Platform.OS !== "web") Haptics.selectionAsync();
}

export function fxLineClear(cascadeCount: number, linesThisStep: number) {
  if (hapticOn) {
    const intense = cascadeCount > 1 || linesThisStep > 1;
    Haptics.impactAsync(
      intense
        ? Haptics.ImpactFeedbackStyle.Heavy
        : Haptics.ImpactFeedbackStyle.Medium
    );
  }
  playSound(cascadeCount > 1 || linesThisStep > 1 ? "combo" : "clear");
}

export function fxGameOver(isNewBest: boolean) {
  if (hapticOn) {
    Haptics.notificationAsync(
      isNewBest
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Error
    );
  }
  playSound(isNewBest ? "best" : "gameover");
}

export function playFx(name: SoundName) {
  playSound(name);
}
