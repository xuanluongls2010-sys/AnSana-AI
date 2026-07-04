export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface StressEntry {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  stressScore: number; // 1 to 10
  moodEmoji: string; // 😊, 😔, 🤯, 😴, etc.
  notes: string;
}

export interface ReframeResult {
  distortionsIdentified: string[];
  explanation: string;
  reframes: string[];
}

export type ActiveTab = "chat" | "breathing" | "reframer" | "journal";
