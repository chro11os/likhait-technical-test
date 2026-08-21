const DEFAULT_EMOJIS: Record<string, string> = {
  Food: "🍔",
  Transportation: "🚗",
  Entertainment: "🎬",
  Shopping: "🛍️",
  Bills: "📄",
  Healthcare: "🏥",
  Education: "📚",
  Travel: "✈️",
  Personal: "👤",
  Other: "📦",
};

export const AVAILABLE_EMOJIS = [
  "🍔", "🚗", "🎬", "🛍️", "📄", "🏥", "📚", "✈️", "📦", "👤",
  "💡", "🎮", "🏋️", "🍕", "🐾", "☕", "💻", "🎨", "🛠️", "🏠"
];

export function getCategoryEmoji(category: string): string {
  try {
    const saved = localStorage.getItem("custom_category_emojis");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed[category]) return parsed[category];
    }
  } catch {
    // fallback to defaults
  }
  return DEFAULT_EMOJIS[category] || "📦";
}

export function saveCategoryEmoji(category: string, emoji: string) {
  try {
    const saved = localStorage.getItem("custom_category_emojis");
    const parsed = saved ? JSON.parse(saved) : {};
    parsed[category] = emoji;
    localStorage.setItem("custom_category_emojis", JSON.stringify(parsed));
  } catch {
    // ignore
  }
}
