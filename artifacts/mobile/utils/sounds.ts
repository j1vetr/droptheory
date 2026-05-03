import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from "expo-audio";

type SoundName = "place" | "clear" | "combo" | "gameover" | "best" | "back" | "toggle";

const SOURCES: Record<SoundName, number> = {
  place: require("../assets/sounds/place.wav"),
  clear: require("../assets/sounds/clear.wav"),
  combo: require("../assets/sounds/combo.wav"),
  gameover: require("../assets/sounds/gameover.wav"),
  best: require("../assets/sounds/best.wav"),
  back: require("../assets/sounds/back.mp3"),
  toggle: require("../assets/sounds/toggle.mp3"),
};

const POOL_SIZE: Partial<Record<SoundName, number>> = {
  clear: 4,
};

const players: Partial<Record<SoundName, AudioPlayer[]>> = {};
const cursor: Partial<Record<SoundName, number>> = {};
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
    const size = POOL_SIZE[name] ?? 1;
    const pool: AudioPlayer[] = [];
    for (let i = 0; i < size; i += 1) {
      try {
        pool.push(createAudioPlayer(SOURCES[name]));
      } catch {
        // ignore — playSound calls will be no-ops
      }
    }
    players[name] = pool;
    cursor[name] = 0;
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
    const pool = players[name];
    if (!pool || pool.length === 0) return;
    const idx = cursor[name] ?? 0;
    const p = pool[idx % pool.length];
    cursor[name] = (idx + 1) % pool.length;
    try {
      p.seekTo(0);
      p.play();
    } catch {
      // ignore playback errors
    }
  });
}
