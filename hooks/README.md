# ⚓ Hooks Directory

This folder houses the custom React hooks responsible for network requests, caching, and state management.

---

## 🛰️ Networking Hooks

### 1. 🗂️ `usePokemon.ts`
Manages general list fetches and search integrations.
- **`usePokemonList`**: Custom hook for paginated fetching of the Pokémon catalog (20 items per page).
  - Manages list states: `pokemons`, `loading`, `loadingMore`, `hasMore`, and triggers `loadMore()`.
- **`fetchPokemonById`**: Asynchronous utility function to fetch direct details by numerical ID.
- **⚡ Caching Strategy**: Uses module-level `Map` structures (`listCache` and `detailCache`) to persist fetched results across screen transitions without redundant network requests.

### 2. 🧬 `usePokemonDetail.ts`
Manages fetching comprehensive metadata for single Pokémon profiles.
- **`usePokemonDetail(id)`**: Fetches stats, specifications, learnsets, and evolution lines.
- **Complex API Traversals**:
  - **Details**: Height, weight, abilities, and stats.
  - **Flavor Text**: Fetches descriptions from the Pokémon species endpoint.
  - **Move Details**: Resolves each move's power (PWR), PP, and element type by fetching their distinct sub-endpoints.
  - **Evolution Tree**: Traverses the recursive tree structure from the evolution chain API, mapping names, sprites, and evolution triggers (e.g. Min Level, Friendship, Stones).
- **⚡ Caching Strategy**: Employs a module-level `Map` cache (`detailsCache`) to prevent duplicate complex chain-queries.
