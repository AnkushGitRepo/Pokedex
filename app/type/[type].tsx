import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PokemonCard } from "@/components/PokemonCard";
import { TYPE_COLORS } from "@/constants/typeColors";
import { TYPE_ICONS } from "@/constants/featuredIds";
import type { PokemonListItem } from "@/hooks/usePokemon";

const SCREEN_W = Dimensions.get("window").width;
const CARD_W = (SCREEN_W - 48) / 2;

export default function TypeScreen() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [pokemons, setPokemons] = useState<PokemonListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const typeColor = TYPE_COLORS[type ?? "normal"] ?? "#A8A878";
  const typeIcon = TYPE_ICONS[type ?? "normal"] ?? "❓";

  useEffect(() => {
    if (type) fetchByType(type);
  }, [type]);

  async function fetchByType(typeName: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/type/${typeName}`);
      const data = await res.json();

      // Limit to first 60 to keep it manageable
      const entries = data.pokemon.slice(0, 60);

      const items: PokemonListItem[] = await Promise.all(
        entries.map(async ({ pokemon }: { pokemon: { name: string; url: string } }) => {
          const idMatch = pokemon.url.match(/\/(\d+)\/$/);
          const id = idMatch ? parseInt(idMatch[1]) : 0;
          if (id > 10000) return null; // skip forms

          try {
            const pRes = await fetch(pokemon.url);
            const pData = await pRes.json();
            return {
              id,
              name: pokemon.name,
              types: pData.types.map((t: any) => t.type.name),
              sprite: pData.sprites.front_default ?? "",
              officialArt:
                pData.sprites.other?.["official-artwork"]?.front_default ??
                pData.sprites.front_default ??
                "",
            } satisfies PokemonListItem;
          } catch {
            return null;
          }
        })
      );

      setPokemons(items.filter(Boolean) as PokemonListItem[]);
    } catch (e: any) {
      setError(e.message ?? "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  const renderCard = useCallback(
    ({ item, index }: { item: PokemonListItem; index: number }) => (
      <PokemonCard
        pokemon={item}
        style={[
          styles.card,
          { marginLeft: index % 2 === 0 ? 16 : 8, marginRight: index % 2 === 1 ? 16 : 8 },
        ]}
      />
    ),
    []
  );

  return (
    <View style={styles.screen}>
      {/* ── Colored Header ── */}
      <View
        style={[
          styles.header,
          { backgroundColor: typeColor, paddingTop: insets.top + 10 },
        ]}
      >
        {/* Decorative circles */}
        <View style={styles.circle1} />
        <View style={styles.circle2} />

        <TouchableOpacity
          style={styles.back}
          onPress={() => router.canGoBack() ? router.back() : router.replace("/" as any)}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <View style={styles.titleRow}>
          <Text style={styles.icon}>{typeIcon}</Text>
          <View>
            <Text style={styles.subtitle}>
              {pokemons.length > 0 ? `${pokemons.length} Pokémon` : "Loading…"}
            </Text>
            <Text style={styles.title}>
              {(type ?? "").charAt(0).toUpperCase() + (type ?? "").slice(1)}{" "}
              Type
            </Text>
          </View>
        </View>
      </View>

      {/* ── Content ── */}
      <View style={styles.body}>
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={typeColor} />
            <Text style={[styles.loadingText, { color: typeColor }]}>
              Loading {type} Pokémon…
            </Text>
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Text style={styles.errorText}>😵 {error}</Text>
          </View>
        ) : (
          <FlatList
            data={pokemons}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderCard}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={[
              styles.list,
              { paddingBottom: insets.bottom + 16 },
            ]}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F5F7FA" },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    overflow: "hidden",
    position: "relative",
  },
  circle1: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 36,
    borderColor: "rgba(255,255,255,0.15)",
    right: -50,
    bottom: -60,
  },
  circle2: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 20,
    borderColor: "rgba(255,255,255,0.1)",
    right: 60,
    top: -10,
  },
  back: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  backIcon: { fontSize: 18, color: "#fff", fontWeight: "700" },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  icon: { fontSize: 44 },
  subtitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.75)",
    marginBottom: 2,
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: -0.5,
  },

  // Body
  body: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
      },
      android: { elevation: 8 },
    }),
  },
  list: { paddingTop: 20 },
  row: { marginBottom: 12 },
  card: { width: CARD_W },

  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingTop: 60,
  },
  loadingText: { fontSize: 15, fontWeight: "600" },
  errorText: { fontSize: 16, color: "#EF4444" },
});
