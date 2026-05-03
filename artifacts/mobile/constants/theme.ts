// Drop Theory — shared design tokens.
// Keep this small and stable: only tokens used in 2+ files belong here.
// Per-screen one-offs stay inline.

export const colors = {
  // Backgrounds (gradient stops, top → bottom)
  bgTop: "#1A1822",
  bgMid: "#111118",
  bgBottom: "#0B0B12",
  panel: "#15151C",

  // Surfaces
  surfaceSubtle: "rgba(255,255,255,0.035)",
  surfaceRaised: "rgba(22,22,30,0.85)",

  // Borders
  borderSubtle: "rgba(255,255,255,0.08)",
  borderGold: "rgba(200,169,110,0.22)",

  // Text
  textPrimary: "#F4F1EA",
  textSecondary: "#9A9180",
  textMuted: "#7A7266",
  textFaint: "#5A5448",

  // Accent (gold family)
  gold: "#B07E28",
  goldLight: "#D4A83A",
  goldOnGold: "#FDFAF4",
  goldText: "#C8A96E",

  // Block bevel overlays — used by GameBoard, PieceTray, FloatingPiece, menu mini-board
  blockHighlight: "rgba(255,255,255,0.26)",
  blockShadow: "rgba(0,0,0,0.32)",
  blockBorder: "rgba(255,255,255,0.20)",
} as const;

export const radii = {
  sm: 6,
  md: 12,
  lg: 14,
  xl: 16,
} as const;

// Typography token names — sizes only; family is set per-call so we don't
// fight the loaded font weights.
export const type = {
  display: 52,
  title: 24,
  heading: 17,
  body: 13,
  label: 9,
  value: 20,
  valueLg: 28,
} as const;

export const labelLetterSpacing = 2.2;
