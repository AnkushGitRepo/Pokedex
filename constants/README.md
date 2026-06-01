# 🎨 Constants Directory

This directory stores configuration variables, type lists, and color palettes that shape the visual theme of the application.

---

## ⚙️ Configuration Files

### 1. 🌈 `typeColors.ts`
This file defines the official styling system mapped to the 18 Pokémon types:
- **`TYPE_COLORS`**: Core hex values representing the primary color for each type (e.g. Grass `#78C850`, Fire `#F08030`).
- **`TYPE_GRADIENTS`**: Two-color arrays mapping starting and ending gradient hex values for headers and backgrounds.
- **`TYPE_DARK_COLORS`**: Darkened hex values for elements needing high contrast, such as text labels or indicators on light elements.

### 2. ⚡ `featuredIds.ts`
Contains global structural configurations:
- **`FEATURED_COUNT`**: Sets the number of items fetched for the home screen (set to `8`).
- **`FEATURED_TYPES`**: An ordered list of all 18 types (used to structure lists and categories).
- **`TYPE_ICONS`**: Mapping of emoji characters to elemental types.
