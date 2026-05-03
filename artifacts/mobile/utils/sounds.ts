import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from "expo-audio";

type SoundName = "place" | "clear" | "combo" | "gameover" | "best" | "back" | "toggle" | "button";

const SOURCES: Record<SoundName, number> = {
  place: require("../assets/sounds/place.wav"),
  clear: require("../assets/sounds/clear.wav"),
  combo: require("../assets/sounds/combo.wav"),
  gameover: require("../assets/sounds/gameover.wav"),
  best: require("../assets/sounds/best.wav"),
  back: require("../assets/sounds/back.mp3"),
  toggle: require("../assets/sounds/toggle.mp3"),
  button: require("../assets/sounds/button.mp3"),
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

type MusicName = "menu";

const MUSIC_SOURCES: Record<MusicName, number> = {
  menu: require("../assets/sounds/menu_music.mp3"),
};

const musicPlayers: Partial<Record<MusicName, AudioPlayer>> = {};
let activeMusic: MusicName | null = null;

async function ensureMusic(name: MusicName) {
  await ensureInit();
  if (musicPlayers[name]) return musicPlayers[name]!;
  try {
    const p = createAudioPlayer(MUSIC_SOURCES[name]);
    p.loop = true;
    p.volume = 0.45;
    musicPlayers[name] = p;
    return p;
  } catch {
    return null;
  }
}

export function playMusic(name: MusicName) {
  if (!enabled) return;
  ensureMusic(name).then((p) => {
    if (!p) return;
    if (activeMusic && activeMusic !== name) {
      stopMusic(activeMusic);
    }
    activeMusic = name;
    try {
      if (!p.playing) {
        p.seekTo(0);
        p.play();
      }
    } catch {
      // ignore
    }
  });
}

export function stopMusic(name?: MusicName) {
  const target = name ?? activeMusic;
  if (!target) return;
  const p = musicPlayers[target];
  if (!p) return;
  try {
    p.pause();
    p.seekTo(0);
  } catch {
    // ignore
  }
  if (activeMusic === target) activeMusic = null;
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
