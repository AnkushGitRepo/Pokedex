// Featured Pokémon are the FIRST items fetched from the API (no hardcoded IDs)
export const FEATURED_COUNT = 8;

// Pokémon types to show as category cards (ordered by visual appeal)
export const FEATURED_TYPES = [
  "fire",
  "water",
  "grass",
  "electric",
  "psychic",
  "dragon",
  "ghost",
  "ice",
  "fighting",
  "poison",
  "flying",
  "dark",
  "steel",
  "fairy",
  "rock",
  "ground",
  "bug",
  "normal",
];

export const TYPE_ICONS: Record<string, string> = {
  fire:     "🔥",
  water:    "💧",
  grass:    "🌿",
  electric: "⚡",
  psychic:  "🔮",
  dragon:   "🐉",
  ghost:    "👻",
  ice:      "❄️",
  fighting: "🥊",
  poison:   "☠️",
  flying:   "🦅",
  dark:     "🌑",
  steel:    "⚙️",
  fairy:    "✨",
  rock:     "🪨",
  ground:   "🌍",
  bug:      "🐛",
  normal:   "⭐",
};
