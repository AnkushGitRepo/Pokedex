# 📂 App Directory (Routes & Navigation)

This folder contains the application screens and routing structure managed by **Expo Router**. Expo Router uses file-system routing, where every file automatically maps to a route in the application.

---

## 🗺️ Route Maps & Pages

### 1. ⚙️ `_layout.tsx` (Root Stack Layout)
- **Description:** Initializes the navigation container and configures the default layout properties.
- **Key Features:**
  - Wraps the app in `SafeAreaProvider` for safe area inset management.
  - Sets `<StatusBar style="dark" />` to keep light-mode status bars consistent.
  - Configures the global `Stack` navigator with `headerShown: false` so that individual pages manage their headers.
  - Customizes transition animations (`animation: "slide_from_right"`) and default background color (`#FEF9F0`).

### 2. 🏠 `index.tsx` (Home Dashboard Screen)
- **Description:** The entry page of the Pokédex containing the hero section, type filter categories, and featured Pokémon.
- **Key Features:**
  - **Pokédex Red Header:** Red header (`#EF5350`) featuring a custom watermark background.
  - **Inline Search:** Text search filtering by name, ID, or type, with a fallback search fetching from the PokéAPI in real-time.
  - **Browse by Type Grid:** A rectangular 2-column grid representing 6 prominent types (Fire, Water, Grass, Electric, Psychic, Dragon) with remote SVG icons.
  - **Featured Pokémon Section:** Stacked, full-width cards representing Pokémon selected dynamically based on primary type diversity from initial fetches.

### 3. 📑 `types.tsx` (All Types Listing Screen)
- **Description:** Displays a full screen grid of all 18 Pokémon types for browsing.
- **Key Features:**
  - Layout matches the 3-column card arrangement.
  - Back button with fallback navigation back to the root if history is empty.

### 4. 🦖 `pokemon/[id].tsx` (Pokémon Details Screen)
- **Description:** Displays detailed metadata about a single Pokémon based on its route ID parameter (e.g. `/pokemon/25`).
- **Key Features:**
  - **Type-Themed Header:** The background matches the primary type color of the Pokémon.
  - **Tabbed Interface:**
    - **Details Tab:** Height, weight, category, abilities, and flavor description.
    - **Moves Tab:** List of learnable moves with type badges, power (PWR), and PP values.
    - **Status Tab:** Dynamic stats bars (HP, ATK, DEF, etc.) with concentric rings representing total stats percentage and tier levels.
    - **Evolutions Tab:** Visual mapping of the evolution chain with sprites and triggers (e.g., Level 16, Thunder Stone).

### 5. 🔍 `type/[type].tsx` (Type-Filtered Pokémon Screen)
- **Description:** Dynamic route page displaying all Pokémon matching a specified type keyword (e.g. `/type/fire`).
- **Key Features:**
  - Standardized 2-column list of `PokemonCard` elements.
  - Custom type-colored header.
