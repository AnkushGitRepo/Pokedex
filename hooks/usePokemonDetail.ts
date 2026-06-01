import { useState, useEffect } from "react";

export interface PokemonStat {
  name: string;
  value: number;
  max: number;
}

export interface PokemonMove {
  name: string;
  level: number;
  method: string;
  type: string;
  power: number | null;
  pp: number | null;
}

export interface EvolutionStep {
  id: number;
  name: string;
  sprite: string;
  trigger: string;
}

export interface PokemonDetail {
  id: number;
  name: string;
  types: string[];
  officialArt: string;
  sprite: string;
  height: number;   // in decimetres
  weight: number;   // in hectograms
  abilities: string[];
  category: string;
  description: string;
  stats: PokemonStat[];
  moves: PokemonMove[];
  evolutions: EvolutionStep[];
  baseExp: number;
}

const detailCache = new Map<number, PokemonDetail>();

const STAT_MAX: Record<string, number> = {
  hp: 255,
  attack: 190,
  defense: 250,
  "special-attack": 194,
  "special-defense": 250,
  speed: 200,
};

const STAT_LABELS: Record<string, string> = {
  hp: "HP",
  attack: "ATK",
  defense: "DEF",
  "special-attack": "S.ATK",
  "special-defense": "S.DEF",
  speed: "SPD",
};

export function usePokemonDetail(id: number) {
  const [detail, setDetail] = useState<PokemonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchDetail(id);
  }, [id]);

  async function fetchDetail(pokemonId: number) {
    setLoading(true);
    setError(null);

    if (detailCache.has(pokemonId)) {
      setDetail(detailCache.get(pokemonId)!);
      setLoading(false);
      return;
    }

    try {
      const [pokemonRes, speciesRes] = await Promise.all([
        fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`),
        fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`),
      ]);
      const pokemon = await pokemonRes.json();
      const species = await speciesRes.json();

      // Description — prefer English
      const flavorEntry = species.flavor_text_entries
        ?.filter((e: any) => e.language.name === "en")
        ?.at(-1);
      const description = flavorEntry
        ? flavorEntry.flavor_text.replace(/\f/g, " ").replace(/\n/g, " ")
        : "";

      // Category (genus in English)
      const genusEntry = species.genera?.find(
        (g: any) => g.language.name === "en"
      );
      const category = genusEntry ? genusEntry.genus : "Unknown";

      // Stats
      const stats: PokemonStat[] = pokemon.stats.map((s: any) => ({
        name: STAT_LABELS[s.stat.name] ?? s.stat.name,
        value: s.base_stat,
        max: STAT_MAX[s.stat.name] ?? 200,
      }));

      // Top moves (first 20 by level-up)
      const levelUpMoves = pokemon.moves
        .filter((m: any) =>
          m.version_group_details.some(
            (v: any) => v.move_learn_method.name === "level-up"
          )
        )
        .slice(0, 20);

      const moves: PokemonMove[] = await Promise.all(
        levelUpMoves.map(async (m: any) => {
          const vd = m.version_group_details.find(
            (v: any) => v.move_learn_method.name === "level-up"
          );
          try {
            const moveRes = await fetch(m.move.url);
            const moveData = await moveRes.json();
            return {
              name: m.move.name.replace(/-/g, " "),
              level: vd?.level_learned_at ?? 0,
              method: vd?.move_learn_method.name ?? "",
              type: moveData.type?.name ?? "normal",
              power: moveData.power,
              pp: moveData.pp,
            };
          } catch {
            return {
              name: m.move.name.replace(/-/g, " "),
              level: vd?.level_learned_at ?? 0,
              method: "level-up",
              type: "normal",
              power: null,
              pp: null,
            };
          }
        })
      );

      moves.sort((a, b) => a.level - b.level);

      // Evolution chain
      const evolutions: EvolutionStep[] = [];
      if (species.evolution_chain?.url) {
        try {
          const evoRes = await fetch(species.evolution_chain.url);
          const evoData = await evoRes.json();
          await traverseEvolution(evoData.chain, evolutions);
        } catch {
          // silently skip evolution errors
        }
      }

      const built: PokemonDetail = {
        id: pokemonId,
        name: pokemon.name,
        types: pokemon.types.map((t: any) => t.type.name),
        officialArt:
          pokemon.sprites.other?.["official-artwork"]?.front_default ??
          pokemon.sprites.front_default ??
          "",
        sprite: pokemon.sprites.front_default ?? "",
        height: pokemon.height,
        weight: pokemon.weight,
        abilities: pokemon.abilities.map((a: any) =>
          a.ability.name.replace(/-/g, " ")
        ),
        category,
        description,
        stats,
        moves,
        evolutions,
        baseExp: pokemon.base_experience ?? 0,
      };

      detailCache.set(pokemonId, built);
      setDetail(built);
    } catch (e: any) {
      setError(e.message ?? "Failed to load Pokémon");
    } finally {
      setLoading(false);
    }
  }

  return { detail, loading, error };
}

async function traverseEvolution(
  chain: any,
  results: EvolutionStep[],
  trigger = ""
) {
  const idMatch = chain.species.url.match(/\/(\d+)\/$/);
  const id = idMatch ? parseInt(idMatch[1]) : 0;

  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const data = await res.json();
    results.push({
      id,
      name: chain.species.name,
      sprite:
        data.sprites.other?.["official-artwork"]?.front_default ??
        data.sprites.front_default ??
        "",
      trigger,
    });
  } catch {
    results.push({
      id,
      name: chain.species.name,
      sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
      trigger,
    });
  }

  for (const next of chain.evolves_to ?? []) {
    const nextTrigger = buildTriggerLabel(next.evolution_details?.[0]);
    await traverseEvolution(next, results, nextTrigger);
  }
}

function buildTriggerLabel(detail: any): string {
  if (!detail) return "";
  const trigger = detail.trigger?.name ?? "";
  if (trigger === "level-up") {
    if (detail.min_level) return `Lv. ${detail.min_level}`;
    if (detail.min_happiness) return "Friendship";
    if (detail.min_beauty) return "Beauty";
    if (detail.time_of_day) return `${detail.time_of_day} time`;
    return "Level up";
  }
  if (trigger === "use-item" && detail.item?.name) {
    return detail.item.name
      .split("-")
      .map((w: string) => w[0].toUpperCase() + w.slice(1))
      .join(" ");
  }
  if (trigger === "trade") return "Trade";
  return trigger;
}
