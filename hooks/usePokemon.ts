import { useState, useEffect, useRef } from "react";

export interface PokemonListItem {
  id: number;
  name: string;
  types: string[];
  sprite: string;
  officialArt: string;
}

// Module-level cache to avoid re-fetching
const listCache = new Map<number, PokemonListItem[]>();
const detailCache = new Map<number, PokemonListItem>();

const PAGE_SIZE = 20;

export function usePokemonList() {
  const [pokemons, setPokemons] = useState<PokemonListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const fetchingRef = useRef(false);

  useEffect(() => {
    loadPage(0, true);
  }, []);

  async function loadPage(pageOffset: number, initial = false) {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    if (initial) setLoading(true);
    else setLoadingMore(true);

    try {
      // Return from cache if available
      if (listCache.has(pageOffset)) {
        const cached = listCache.get(pageOffset)!;
        setPokemons((prev) => (initial ? cached : [...prev, ...cached]));
        setOffset(pageOffset + PAGE_SIZE);
        if (initial) setLoading(false);
        else setLoadingMore(false);
        fetchingRef.current = false;
        return;
      }

      const res = await fetch(
        `https://pokeapi.co/api/v2/pokemon?limit=${PAGE_SIZE}&offset=${pageOffset}`
      );
      const data = await res.json();

      if (!data.next) setHasMore(false);

      const items: PokemonListItem[] = await Promise.all(
        data.results.map(async (p: { name: string; url: string }) => {
          const idMatch = p.url.match(/\/(\d+)\/$/);
          const id = idMatch ? parseInt(idMatch[1]) : 0;

          if (detailCache.has(id)) return detailCache.get(id)!;

          const detailRes = await fetch(p.url);
          const detail = await detailRes.json();
          const item: PokemonListItem = {
            id,
            name: p.name,
            types: detail.types.map((t: any) => t.type.name),
            sprite: detail.sprites.front_default ?? "",
            officialArt:
              detail.sprites.other?.["official-artwork"]?.front_default ??
              detail.sprites.front_default ??
              "",
          };
          detailCache.set(id, item);
          return item;
        })
      );

      listCache.set(pageOffset, items);
      setPokemons((prev) => (initial ? items : [...prev, ...items]));
      setOffset(pageOffset + PAGE_SIZE);
    } catch (e) {
      console.error("Error fetching pokemon list:", e);
    } finally {
      if (initial) setLoading(false);
      else setLoadingMore(false);
      fetchingRef.current = false;
    }
  }

  function loadMore() {
    if (!loadingMore && hasMore) {
      loadPage(offset);
    }
  }

  return { pokemons, loading, loadingMore, loadMore, hasMore };
}

export async function fetchPokemonById(id: number): Promise<PokemonListItem> {
  if (detailCache.has(id)) return detailCache.get(id)!;

  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  const detail = await res.json();
  const item: PokemonListItem = {
    id,
    name: detail.name,
    types: detail.types.map((t: any) => t.type.name),
    sprite: detail.sprites.front_default ?? "",
    officialArt:
      detail.sprites.other?.["official-artwork"]?.front_default ??
      detail.sprites.front_default ??
      "",
  };
  detailCache.set(id, item);
  return item;
}
