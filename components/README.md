# 🧩 Components Directory

This directory contains reusable presentation components utilized across the application's routes. They are designed to be self-contained, modular, and optimized for performance.

---

## 📦 Component Library

### 1. 📇 `PokemonCard.tsx`
- **Description:** Grid card representing summary information for a single Pokémon.
- **Key Features:**
  - Dynamic type-tinted background blocks representing the primary element.
  - Performance optimized artwork loading using `expo-image` with cache-first loading and fallback sprite placeholders.
  - Display of numerical index (`#001`), capitalized name, and type badges.
  - Flexibly accepts custom styles (e.g. width/margin overrides) for different grid configurations.

### 2. 🔍 `SearchBar.tsx`
- **Description:** Custom styling for search fields across the application.
- **Key Features:**
  - Includes a search icon indicator and clear button (`✕`) appearing only when text is entered.
  - Prevents auto-correction and capitalization to make text-matching robust for Pokémon names.
  - Styled as a clean card with soft borders and subtle shadows.

### 3. 📊 `StatBar.tsx`
- **Description:** High-performance animated horizontal bar graphs representing base stats in the Status tab.
- **Key Features:**
  - Uses `react-native-reanimated` for high-performance CPU/GPU animations.
  - Dynamically changes the accent color of the stat value indicator dot depending on value thresholds:
    - 🟢 **Excellent (>= 120)** — Green
    - 🟡 **Good (>= 90)** — Lime
    - 🟡 **Above Average (>= 70)** — Yellow
    - 🟠 **Average (>= 50)** — Orange
    - 🔴 **Low (< 50)** — Red

### 4. 🏷️ `TypeBadge.tsx`
- **Description:** Colorful labels identifying a Pokémon's elemental types.
- **Key Features:**
  - Auto-adjusts layout constraints and font sizes depending on `size` props (`sm` or `md`).
  - Supports a `light` prop:
    - **`light = true`**: Translucent white background with white text (best for headers with dark colored backgrounds).
    - **`light = false`**: Solid type-colored background with colored text border.
