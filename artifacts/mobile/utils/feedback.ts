import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

import { playMusic, playSound, setSoundEnabled, stopMusic } from "@/utils/sounds";

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
  if (!value) stopMusic();
  try {
    await AsyncStorage.setItem(SOUND_KEY, value ? "1" : "0");
  } catch {
    // ignore
  }
}

export function fxMenuMusicStart() {
  playMusic("menu");
}

export function fxMenuMusicStop() {
  stopMusic("menu");
}

export async function setHapticPref(value: boolean) {
  hapticOn = value;
  try {
    await AsyncStorage.setItem(HAPTIC_KEY, value ? "1" : "0");
  } catch {
    // ignore
  }
}

type SoundName = "place" | "clear" | "combo" | "gameover" | "best" | "back" | "toggle" | "button" | "score" | "cancel" | "wrong" | "pickup";

export function fxButton() {
  if (hapticOn) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  playSound("button");
}

export function fxScore() {
  playSound("score");
}

export function fxBack() {
  if (hapticOn) Haptics.selectionAsync();
  playSound("back");
}

export function fxToggle() {
  if (hapticOn) Haptics.selectionAsync();
  playSound("toggle");
}

export function fxPlace() {
  if (hapticOn) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export function fxInvalid() {
  if (hapticOn) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  playSound("cancel");
}

export function fxWrong() {
  if (hapticOn) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  playSound("wrong");
}

export function fxPickup() {
  if (hapticOn && Platform.OS !== "web") Haptics.selectionAsync();
  playSound("pickup");
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
  const hits = Math.min(4, Math.max(1, linesThisStep));
  for (let i = 0; i < hits; i += 1) {
    if (i === 0) {
      playSound("clear");
    } else {
      setTimeout(() => playSound("clear"), i * 90);
    }
  }
  const isCombo = cascadeCount > 1 || linesThisStep > 1;
  if (isCombo) {
    setTimeout(() => playSound("combo"), 60);
  }
}

export function fxGameOver(isNewBest: boolean) {
  if (hapticOn) {
    Haptics.notificationAsync(
      isNewBest
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Error
    );
  }
  playSound("gameover");
}

export function playFx(name: SoundName) {
  playSound(name);
}
