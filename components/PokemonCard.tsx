import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { TYPE_COLORS } from "@/constants/typeColors";
import { TypeBadge } from "./TypeBadge";
import type { PokemonListItem } from "@/hooks/usePokemon";

interface PokemonCardProps {
  pokemon: PokemonListItem;
  style?: object;
}

export function PokemonCard({ pokemon, style }: PokemonCardProps) {
  const router = useRouter();
  const primaryType = pokemon.types[0] ?? "normal";
  const typeColor = TYPE_COLORS[primaryType] ?? "#A8A878";

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      style={[styles.card, style]}
      onPress={() => router.push(`/pokemon/${pokemon.id}`)}
    >
      {/* Colored header block */}
      <View style={[styles.colorBlock, { backgroundColor: typeColor + "22" }]}>
        {/* Decorative circle */}
        <View
          style={[styles.circle, { borderColor: typeColor + "44" }]}
        />
        <Image
          source={{ uri: pokemon.officialArt }}
          style={styles.sprite}
          contentFit="contain"
          transition={200}
          placeholder={{ uri: pokemon.sprite }}
        />
      </View>

      {/* Info block */}
      <View style={styles.info}>
        <Text style={styles.number}>
          #{String(pokemon.id).padStart(3, "0")}
        </Text>
        <Text style={styles.name} numberOfLines={1}>
          {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
        </Text>
        <View style={styles.badges}>
          {pokemon.types.map((t) => (
            <TypeBadge key={t} type={t} size="sm" />
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  colorBlock: {
    height: 120,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  circle: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 20,
    bottom: -20,
    right: -10,
  },
  sprite: {
    width: 90,
    height: 90,
  },
  info: {
    padding: 12,
  },
  number: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1A1A2E",
    textTransform: "capitalize",
    marginBottom: 6,
  },
  badges: {
    flexDirection: "row",
    gap: 4,
    flexWrap: "wrap",
  },
});
