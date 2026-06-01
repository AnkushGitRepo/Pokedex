import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Dimensions,
  FlatList,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePokemonList, PokemonListItem } from "@/hooks/usePokemon";
import { SearchBar } from "@/components/SearchBar";
import { TypeBadge } from "@/components/TypeBadge";
import { TYPE_COLORS, TYPE_GRADIENTS } from "@/constants/typeColors";
import { FEATURED_COUNT } from "@/constants/featuredIds";

const SCREEN_W = Dimensions.get("window").width;
const TYPE_CARD_W = (SCREEN_W - 40) / 2; // 2 column grid with padding
const RESULT_CARD_W = (SCREEN_W - 40) / 2;

// 6 types for the grid - chosen for color diversity
const HOME_TYPES = ["fire", "water", "grass", "electric", "psychic", "dragon"] as const;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { pokemons, loading } = usePokemonList();
  const [search, setSearch] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<PokemonListItem | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Debounce search query to prevent excessive API requests
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(search.trim().toLowerCase());
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch search result from PokéAPI if not found locally
  useEffect(() => {
    if (!debouncedQuery) {
      setSearchResult(null);
      setSearchError(null);
      return;
    }

    const foundLocal = pokemons.find(
      (p) =>
        p.name.toLowerCase() === debouncedQuery ||
        String(p.id) === debouncedQuery
    );

    if (foundLocal) {
      setSearchResult(null);
      setSearchError(null);
      return;
    }

    // Only search PokéAPI if it looks like a valid name (length > 2) or is a number
    if (debouncedQuery.length > 2 || !isNaN(Number(debouncedQuery))) {
      fetchSearchApi(debouncedQuery);
    } else {
      setSearchResult(null);
      setSearchError("Keep typing to search…");
    }
  }, [debouncedQuery, pokemons]);

  async function fetchSearchApi(query: string) {
    setSearchLoading(true);
    setSearchError(null);
    setSearchResult(null);
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`);
      if (!res.ok) {
        setSearchError("No Pokémon found");
        return;
      }
      const data = await res.json();
      const item: PokemonListItem = {
        id: data.id,
        name: data.name,
        types: data.types.map((t: any) => t.type.name),
        sprite: data.sprites.front_default ?? "",
        officialArt:
          data.sprites.other?.["official-artwork"]?.front_default ??
          data.sprites.front_default ??
          "",
      };
      setSearchResult(item);
    } catch {
      setSearchError("No Pokémon found");
    } finally {
      setSearchLoading(false);
    }
  }

  // Filter local + remote search results
  const filteredResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];

    const localMatches = pokemons.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        String(p.id) === q ||
        `#${String(p.id).padStart(3, "0")}` === q ||
        p.types.some((t) => t.includes(q))
    );

    if (searchResult && !localMatches.some((p) => p.id === searchResult.id)) {
      return [searchResult, ...localMatches];
    }

    return localMatches;
  }, [pokemons, search, searchResult]);

  // Featured Pokémon selected dynamically for type diversity
  const featuredPokemons = useMemo(() => {
    const list: PokemonListItem[] = [];
    const seenTypes = new Set<string>();

    for (const p of pokemons) {
      const primaryType = p.types[0];
      if (primaryType && !seenTypes.has(primaryType)) {
        seenTypes.add(primaryType);
        list.push(p);
        if (list.length >= 6) break;
      }
    }

    // Fallback if we haven't loaded enough diverse types yet
    if (list.length < 4) {
      return pokemons.slice(0, 6);
    }
    return list;
  }, [pokemons]);

  const isSearching = search.trim().length > 0;

  // Render a result card in the search grid
  const renderSearchResultCard = useCallback(
    ({ item }: { item: PokemonListItem }) => {
      const primaryType = item.types[0] ?? "normal";
      const typeColor = TYPE_COLORS[primaryType] ?? "#A8A878";

      return (
        <TouchableOpacity
          activeOpacity={0.88}
          style={styles.resultCard}
          onPress={() => router.push(`/pokemon/${item.id}`)}
        >
          <View style={[styles.resultImageContainer, { backgroundColor: typeColor + "15" }]}>
            <View style={[styles.resultCircle, { borderColor: typeColor + "25" }]} />
            <Image
              source={{ uri: item.officialArt }}
              style={styles.resultSprite}
              contentFit="contain"
              transition={200}
              placeholder={{ uri: item.sprite }}
            />
          </View>
          <View style={styles.resultInfo}>
            <Text style={styles.resultNumber}>#{String(item.id).padStart(3, "0")}</Text>
            <Text style={styles.resultName} numberOfLines={1}>
              {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
            </Text>
            <View style={styles.resultBadges}>
              {item.types.map((t) => (
                <TypeBadge key={t} type={t} size="sm" />
              ))}
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [router]
  );

  return (
    <View style={styles.screen}>
      {/* ── Sticky Hero Header ── */}
      <View style={[styles.hero, { paddingTop: insets.top + 16 }]}>
        {/* Curved background decoration */}
        <View style={styles.heroPokeBallWatermark} />
        
        <View style={styles.heroContent}>
          <Text style={styles.heroSub}>Welcome to your</Text>
          <Text style={styles.heroTitle}>Pokédex</Text>
        </View>

        <SearchBar value={search} onChangeText={setSearch} />
      </View>

      {/* ── Search Active Mode ── */}
      {isSearching ? (
        <View style={styles.body}>
          {searchLoading && filteredResults.length === 0 ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color="#EF5350" />
              <Text style={styles.centeredText}>Searching PokéAPI…</Text>
            </View>
          ) : searchError && filteredResults.length === 0 ? (
            <View style={styles.centered}>
              <Text style={styles.centeredEmoji}>😵</Text>
              <Text style={styles.centeredText}>{searchError}</Text>
            </View>
          ) : (
            <FlatList
              data={filteredResults}
              keyExtractor={(item) => String(item.id)}
              renderItem={renderSearchResultCard}
              numColumns={2}
              columnWrapperStyle={styles.searchRow}
              contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              ListHeaderComponent={
                <Text style={styles.resultsCount}>
                  Found {filteredResults.length} matches
                </Text>
              }
            />
          )}
        </View>
      ) : (
        /* ── Standard Home Mode ── */
        <ScrollView
          style={styles.body}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Types Grid ── */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Browse by Type</Text>
            <TouchableOpacity onPress={() => router.push("/types" as any)}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.typesGrid}>
            {HOME_TYPES.map((type) => {
              const color = TYPE_COLORS[type] ?? "#A8A878";
              const gradient = TYPE_GRADIENTS[type] ?? [color, color];
              const iconUri = `https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/${type}.svg`;

              return (
                <TouchableOpacity
                  key={type}
                  activeOpacity={0.85}
                  style={[styles.typeCard, { backgroundColor: color }]}
                  onPress={() => router.push(`/type/${type}`)}
                >
                  {/* Decorative background ring */}
                  <View style={styles.typeCardRing} />

                  <View style={styles.typeCardContent}>
                    <Image
                      source={{ uri: iconUri }}
                      style={styles.typeCardIcon}
                      contentFit="contain"
                      tintColor="rgba(255,255,255,0.92)"
                    />
                    <View style={styles.typeCardTextContainer}>
                      <Text style={styles.typeCardName}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ── Featured List (Stacked full-width cards) ── */}
          <Text style={[styles.sectionTitle, { marginHorizontal: 16, marginTop: 24, marginBottom: 12 }]}>
            Featured Pokémon
          </Text>

          {loading ? (
            <View style={styles.featuredLoading}>
              <ActivityIndicator size="large" color="#EF5350" />
            </View>
          ) : (
            <View style={styles.featuredList}>
              {featuredPokemons.map((pokemon) => {
                const primaryType = pokemon.types[0] ?? "normal";
                const typeColor = TYPE_COLORS[primaryType] ?? "#A8A878";

                return (
                  <TouchableOpacity
                    key={pokemon.id}
                    activeOpacity={0.88}
                    style={styles.featuredCard}
                    onPress={() => router.push(`/pokemon/${pokemon.id}`)}
                  >
                    {/* Color splash circle in the background */}
                    <View style={[styles.featuredBgCircle, { backgroundColor: typeColor + "18" }]} />

                    <View style={styles.featuredContent}>
                      <View style={styles.featuredInfo}>
                        <Text style={styles.featuredNumber}>
                          #{String(pokemon.id).padStart(3, "0")}
                        </Text>
                        <Text style={styles.featuredName}>
                          {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
                        </Text>
                        <View style={styles.featuredBadges}>
                          {pokemon.types.map((t) => (
                            <TypeBadge key={t} type={t} size="sm" />
                          ))}
                        </View>
                      </View>

                      <View style={styles.featuredImageContainer}>
                        <Image
                          source={{ uri: pokemon.officialArt }}
                          style={styles.featuredSprite}
                          contentFit="contain"
                          transition={200}
                          placeholder={{ uri: pokemon.sprite }}
                        />
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FEF9F0",
  },
  hero: {
    backgroundColor: "#EF5350",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingBottom: 24,
    position: "relative",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#EF5350",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
      },
      android: { elevation: 8 },
    }),
  },
  heroPokeBallWatermark: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 48,
    borderColor: "rgba(255,255,255,0.08)",
    top: -60,
    right: -60,
  },
  heroContent: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  heroSub: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.75)",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 2,
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: -1,
  },
  body: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
  },

  // Browse by Type Section
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#1A1A2E",
  },
  seeAll: {
    fontSize: 14,
    fontWeight: "700",
    color: "#EF5350",
  },
  typesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    gap: 12,
    justifyContent: "center",
  },
  typeCard: {
    width: TYPE_CARD_W,
    height: 72,
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  typeCardRing: {
    position: "absolute",
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 12,
    borderColor: "rgba(255,255,255,0.18)",
    bottom: -16,
    right: -16,
    zIndex: 0,
  },
  typeCardContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    zIndex: 1,
  },
  typeCardIcon: {
    width: 30,
    height: 30,
  },
  typeCardTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  typeCardName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.05)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Featured Pokémon Section (stacked cards)
  featuredList: {
    paddingHorizontal: 16,
    gap: 16,
  },
  featuredCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    height: 124,
    position: "relative",
    overflow: "hidden",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: { elevation: 4 },
    }),
  },
  featuredBgCircle: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    right: -20,
    top: -8,
  },
  featuredContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  featuredInfo: {
    flex: 1,
    zIndex: 1,
  },
  featuredNumber: {
    fontSize: 12,
    fontWeight: "800",
    color: "#9CA3AF",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  featuredName: {
    fontSize: 22,
    fontWeight: "900",
    color: "#1A1A2E",
    marginBottom: 8,
  },
  featuredBadges: {
    flexDirection: "row",
    gap: 6,
  },
  featuredImageContainer: {
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  featuredSprite: {
    width: 90,
    height: 90,
  },
  featuredLoading: {
    paddingVertical: 40,
    alignItems: "center",
  },

  // Search results
  resultsCount: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    marginHorizontal: 16,
    marginBottom: 12,
  },
  searchRow: {
    paddingHorizontal: 12,
    gap: 12,
    marginBottom: 12,
  },
  resultCard: {
    width: RESULT_CARD_W,
    backgroundColor: "#fff",
    borderRadius: 24,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
    }),
  },
  resultImageContainer: {
    height: 110,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  resultCircle: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 15,
    bottom: -15,
    right: -10,
  },
  resultSprite: {
    width: 80,
    height: 80,
  },
  resultInfo: {
    padding: 12,
  },
  resultName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1A1A2E",
    marginBottom: 6,
  },
  resultNumber: {
    fontSize: 10,
    fontWeight: "800",
    color: "#9CA3AF",
    marginBottom: 2,
  },
  resultBadges: {
    flexDirection: "row",
    gap: 4,
    flexWrap: "wrap",
  },

  // Empty/Loading State
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
  },
  centeredEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  centeredText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6B7280",
  },
});
