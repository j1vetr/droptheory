# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

---

## Drop Theory — Mobile App (`artifacts/mobile`)

A polished gravity-based block puzzle game built with Expo / React Native.

### Game Mechanics
- **8×8 grid**: place pieces by dragging them from the tray onto the board
- **Gravity**: after any line clears, all remaining blocks fall down
- **Cascade combos**: gravity can trigger additional line clears in a chain
- **Three-piece tray**: new set of 3 pieces dealt automatically when all are placed
- **Game over**: when none of the 3 active pieces can fit anywhere on the board

### Tech Stack
- **Framework**: Expo SDK 54, expo-router (file-based stack navigation)
- **Drag**: PanResponder (stable refs pattern for fresh closure state)
- **Animation**: Lottie splash (iOS/Android), `react-native-reanimated` for modals
- **Storage**: `@react-native-async-storage/async-storage` for best score persistence
- **Fonts**: `@expo-google-fonts/inter` (400/500/600/700)
- **Language**: bilingual EN/TR via `context/LanguageContext.tsx`
- **Theme**: Quiet Luxury dark — bg `#0D0D0D`, gold `#C8A96E`, cream `#F5F0E8`

### Key Files
| File | Purpose |
|------|---------|
| `app/index.tsx` | Lottie splash screen (web fallback) |
| `app/menu.tsx` | Main menu |
| `app/game.tsx` | Game screen — all drag, drop, scoring logic |
| `app/settings.tsx` | Language toggle |
| `app/_layout.tsx` | Root Stack layout + providers |
| `utils/gameEngine.ts` | Board logic: gravity, cascade, scoring |
| `utils/pieces.ts` | Piece shapes and random generation |
| `context/LanguageContext.tsx` | TR/EN translation context |
| `components/GameBoard.tsx` | Board renderer with ghost preview |
| `components/PieceTray.tsx` | 3-slot drag tray |
| `components/FloatingPiece.tsx` | Floating overlay during drag |
| `components/ComboFeedback.tsx` | Animated combo/cascade text |
| `components/GameOverModal.tsx` | End-of-game modal |

### Navigation Routes
- `/` → Splash (auto-navigates to `/menu`)
- `/menu` → Main menu
- `/game` → Game screen
- `/settings` → Settings (language)
