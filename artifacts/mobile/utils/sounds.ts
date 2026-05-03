import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from "expo-audio";

type SoundName = "place" | "clear" | "combo" | "gameover" | "best";

const SOURCES: Record<SoundName, number> = {
  place: require("../assets/sounds/place.wav"),
  clear: require("../assets/sounds/clear.wav"),
  combo: require("../assets/sounds/combo.wav"),
  gameover: require("../assets/sounds/gameover.wav"),
  best: require("../assets/sounds/best.wav"),
};

const players: Partial<Record<SoundName, AudioPlayer>> = {};
let initialized = false;
let enabled = true;

async function ensureInit() {
  if (initialized) return;
  initialized = true;
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: "mixWithOthers",
    });
  } catch {
    // non-fatal on web / some platforms
  }
  (Object.keys(SOURCES) as SoundName[]).forEach((name) => {
    try {
      players[name] = createAudioPlayer(SOURCES[name]);
    } catch {
      // ignore — playSound calls will be no-ops
    }
  });
}

export function setSoundEnabled(value: boolean) {
  enabled = value;
}

export function isSoundEnabled() {
  return enabled;
}

export function playSound(name: SoundName) {
  if (!enabled) return;
  ensureInit().then(() => {
    const p = players[name];
    if (!p) return;
    try {
      p.seekTo(0);
      p.play();
    } catch {
      // ignore playback errors
    }
  });
}
