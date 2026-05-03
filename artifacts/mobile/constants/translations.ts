export type Language = "en" | "tr";

export interface Translations {
  appName: string;
  play: string;
  continue: string;
  restart: string;
  settings: string;
  language: string;
  turkish: string;
  english: string;
  score: string;
  best: string;
  gameOver: string;
  noMoves: string;
  tryAgain: string;
  cascade: string;
  chain: string;
  perfectDrop: string;
  newBestScore: string;
  tutorial1: string;
  tutorial2: string;
  tutorial3: string;
  newGame: string;
  home: string;
  back: string;
  notFound: string;
  goHome: string;
  tagline: string;
  eyebrow: string;
}

const en: Translations = {
  appName: "Drop Theory",
  play: "Play",
  continue: "Continue",
  restart: "Restart",
  settings: "Settings",
  language: "Language",
  turkish: "Turkish",
  english: "English",
  score: "Score",
  best: "Best",
  gameOver: "Game Over",
  noMoves: "No available moves",
  tryAgain: "Try Again",
  cascade: "Cascade",
  chain: "Chain",
  perfectDrop: "Perfect Drop",
  newBestScore: "New Best Score",
  tutorial1: "Drag pieces onto the board",
  tutorial2: "Clear full rows or columns",
  tutorial3: "Gravity creates chain reactions",
  newGame: "New Game",
  home: "Menu",
  back: "Back",
  notFound: "This screen doesn't exist.",
  goHome: "Go to home screen",
  tagline: "Think Before It Falls",
  eyebrow: "Puzzle · Gravity · Combo",
};

const tr: Translations = {
  appName: "Drop Theory",
  play: "Oyna",
  continue: "Devam Et",
  restart: "Yeniden Başlat",
  settings: "Ayarlar",
  language: "Dil",
  turkish: "Türkçe",
  english: "İngilizce",
  score: "Skor",
  best: "En İyi",
  gameOver: "Oyun Bitti",
  noMoves: "Uygun hamle kalmadı",
  tryAgain: "Tekrar Dene",
  cascade: "Zincir",
  chain: "Kombo",
  perfectDrop: "Kusursuz Düşüş",
  newBestScore: "Yeni Rekor",
  tutorial1: "Parçaları tahtaya sürükle",
  tutorial2: "Tam satırları veya sütunları temizle",
  tutorial3: "Yerçekimi zincirleme reaksiyonlar oluşturabilir",
  newGame: "Yeni Oyun",
  home: "Menü",
  back: "Geri",
  notFound: "Bu ekran mevcut değil.",
  goHome: "Ana ekrana git",
  tagline: "Düşmeden Önce Düşün",
  eyebrow: "Bulmaca · Yerçekimi · Kombo",
};

export const translations: Record<Language, Translations> = { en, tr };
