import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
  Animated,
} from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePokemonDetail } from "@/hooks/usePokemonDetail";
import { StatBar } from "@/components/StatBar";
import { TypeBadge } from "@/components/TypeBadge";
import { TYPE_COLORS } from "@/constants/typeColors";

const { width: SCREEN_W } = Dimensions.get("window");
const TABS = ["Details", "Moves", "Status", "Evolutions"] as const;
type Tab = (typeof TABS)[number];

export default function PokemonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const pokemonId = parseInt(id ?? "1");
  const { detail, loading, error } = usePokemonDetail(pokemonId);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<Tab>("Details");
  const scrollRef = useRef<ScrollView>(null);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={styles.loadingText}>Loading Pokémon…</Text>
      </View>
    );
  }

  if (error || !detail) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorEmoji}>😵</Text>
        <Text style={styles.errorText}>{error ?? "Not found"}</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.canGoBack() ? router.back() : router.replace("/" as any)}>
          <Text style={styles.backBtnText}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const primaryType = detail.types[0] ?? "normal";
  const typeColor = TYPE_COLORS[primaryType] ?? "#6C63FF";

  return (
    <View style={styles.screen}>
      {/* ── Hero Header ── */}
      <View style={[styles.hero, { backgroundColor: typeColor, paddingTop: insets.top + 12 }]}>
        {/* Decorative circles */}
        <View style={styles.heroCircle1} />
        <View style={styles.heroCircle2} />

        {/* Back button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.canGoBack() ? router.back() : router.replace("/" as any)}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        {/* Number + Name + Types */}
        <View style={styles.heroMeta}>
          <Text style={styles.heroNumber}>
            #{String(detail.id).padStart(3, "0")}
          </Text>
          <Text style={styles.heroName}>
            {detail.name.charAt(0).toUpperCase() + detail.name.slice(1)}
          </Text>
          <View style={styles.heroBadges}>
            {detail.types.map((t) => (
              <TypeBadge key={t} type={t} size="md" light />
            ))}
          </View>
        </View>

        {/* Large sprite */}
        <Image
          source={{ uri: detail.officialArt }}
          style={styles.heroSprite}
          contentFit="contain"
          transition={400}
        />
      </View>

      {/* ── White Card Body ── */}
      <View style={styles.body}>
        {/* Tab Bar */}
        <View style={styles.tabBar}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={styles.tabItem}
              onPress={() => {
                setActiveTab(tab);
                scrollRef.current?.scrollTo({ y: 0, animated: true });
              }}
            >
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === tab && { color: typeColor, fontWeight: "800" },
                ]}
              >
                {tab}
              </Text>
              {activeTab === tab && (
                <View style={[styles.tabIndicator, { backgroundColor: typeColor }]} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <ScrollView
          ref={scrollRef}
          style={styles.tabContent}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        >
          {activeTab === "Details" && <DetailsTab detail={detail} typeColor={typeColor} />}
          {activeTab === "Moves" && <MovesTab detail={detail} typeColor={typeColor} />}
          {activeTab === "Status" && <StatusTab detail={detail} typeColor={typeColor} />}
          {activeTab === "Evolutions" && <EvolutionsTab detail={detail} typeColor={typeColor} />}
        </ScrollView>
      </View>
    </View>
  );
}

// ── Details Tab ──────────────────────────────────────────────

function DetailsTab({ detail, typeColor }: { detail: any; typeColor: string }) {
  const heightFt = ((detail.height * 0.328084)).toFixed(1);
  const weightLbs = (detail.weight * 0.220462).toFixed(1);

  return (
    <View style={tabs.container}>
      {/* Stats row */}
      <View style={tabs.statsRow}>
        <StatBlock label="Height" value={`${heightFt}'`} color={typeColor} />
        <StatBlock label="Weight" value={`${weightLbs} lbs`} color={typeColor} />
        <StatBlock label="Base Exp" value={String(detail.baseExp)} color={typeColor} />
        <StatBlock
          label="Abilities"
          value={detail.abilities[0] ?? "—"}
          color={typeColor}
        />
      </View>

      {/* Description */}
      {detail.description ? (
        <View style={tabs.descBox}>
          <Text style={tabs.descText}>{detail.description}</Text>
        </View>
      ) : null}

      {/* All abilities */}
      <Text style={tabs.subheading}>Abilities</Text>
      <View style={tabs.abilitiesRow}>
        {detail.abilities.map((a: string) => (
          <View key={a} style={[tabs.abilityChip, { borderColor: typeColor }]}>
            <Text style={[tabs.abilityText, { color: typeColor }]}>
              {a.charAt(0).toUpperCase() + a.slice(1)}
            </Text>
          </View>
        ))}
      </View>

      {/* Category */}
      <Text style={tabs.subheading}>Category</Text>
      <Text style={tabs.categoryText}>{detail.category}</Text>
    </View>
  );
}

function StatBlock({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View style={tabs.statBlock}>
      <Text style={[tabs.statValue, { color }]}>{value}</Text>
      <Text style={tabs.statLabel}>{label}</Text>
    </View>
  );
}

// ── Moves Tab ────────────────────────────────────────────────

function MovesTab({ detail, typeColor }: { detail: any; typeColor: string }) {
  return (
    <View style={tabs.container}>
      <View style={tabs.moveHeader}>
        <Text style={[tabs.moveCellHdr, { flex: 2 }]}>Move</Text>
        <Text style={tabs.moveCellHdr}>Lv.</Text>
        <Text style={tabs.moveCellHdr}>Pwr</Text>
        <Text style={tabs.moveCellHdr}>PP</Text>
      </View>
      {detail.moves.map((move: any, i: number) => (
        <View
          key={`${move.name}-${i}`}
          style={[tabs.moveRow, i % 2 === 0 && tabs.moveRowAlt]}
        >
          <View style={{ flex: 2, flexDirection: "row", alignItems: "center", gap: 6 }}>
            <View
              style={[
                tabs.moveDot,
                {
                  backgroundColor:
                    TYPE_COLORS[move.type] ?? typeColor,
                },
              ]}
            />
            <Text style={tabs.moveName}>{move.name}</Text>
          </View>
          <Text style={tabs.moveCell}>{move.level || "—"}</Text>
          <Text style={tabs.moveCell}>{move.power ?? "—"}</Text>
          <Text style={tabs.moveCell}>{move.pp ?? "—"}</Text>
        </View>
      ))}
      {detail.moves.length === 0 && (
        <Text style={tabs.empty}>No move data available</Text>
      )}
    </View>
  );
}

// ── Status Tab ────────────────────────────────────────────────

const STAT_FULL_LABELS: Record<string, string> = {
  HP: "Hit Points",
  ATK: "Attack",
  DEF: "Defense",
  "S.ATK": "Sp. Attack",
  "S.DEF": "Sp. Defense",
  SPD: "Speed",
};

const STAT_TIER: (value: number) => { label: string; color: string } = (v) => {
  if (v >= 120) return { label: "Excellent", color: "#22c55e" };
  if (v >= 90)  return { label: "Great",     color: "#84cc16" };
  if (v >= 60)  return { label: "Good",      color: "#facc15" };
  if (v >= 40)  return { label: "Average",   color: "#fb923c" };
  return                { label: "Low",       color: "#f87171" };
};

function StatusTab({ detail, typeColor }: { detail: any; typeColor: string }) {
  const total = detail.stats.reduce((s: number, st: any) => s + st.value, 0);
  const maxTotal = 720;
  const totalPct = Math.min((total / maxTotal) * 100, 100);

  return (
    <View style={tabs.container}>
      {/* Stat Cards */}
      {detail.stats.map((stat: any, i: number) => {
        const pct = Math.min((stat.value / stat.max) * 100, 100);
        const tier = STAT_TIER(stat.value);
        const fullLabel = STAT_FULL_LABELS[stat.name] ?? stat.name;
        return (
          <StatBar
            key={stat.name}
            label={stat.name}
            value={stat.value}
            max={stat.max}
            color={typeColor}
            delay={i * 80}
          />
        );
      })}

      {/* Total Base Stat Card */}
      <View style={[tabs.totalCard, { borderColor: typeColor + "33" }]}>
        <View style={tabs.totalCardLeft}>
          <Text style={tabs.totalCardLabel}>Base Stat Total</Text>
          <Text style={[tabs.totalCardValue, { color: typeColor }]}>{total}</Text>
          <Text style={tabs.totalCardSub}>out of {maxTotal} max</Text>
        </View>
        <View style={tabs.totalCardRight}>
          {/* Arc-style percentage display */}
          <View style={[tabs.totalRing, { borderColor: typeColor + "22" }]}>
            <View style={[tabs.totalRingInner, { borderColor: typeColor }]}>
              <Text style={[tabs.totalPct, { color: typeColor }]}>
                {Math.round(totalPct)}%
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Legend */}
      <View style={tabs.legend}>
        {[
          { label: "Excellent", color: "#22c55e", min: 120 },
          { label: "Great",     color: "#84cc16", min: 90 },
          { label: "Good",      color: "#facc15", min: 60 },
          { label: "Average",   color: "#fb923c", min: 40 },
          { label: "Low",       color: "#f87171", min: 0 },
        ].map((tier) => (
          <View key={tier.label} style={tabs.legendItem}>
            <View style={[tabs.legendDot, { backgroundColor: tier.color }]} />
            <Text style={tabs.legendText}>{tier.label} ({tier.min}+)</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ── Evolutions Tab ───────────────────────────────────────────

function EvolutionsTab({ detail, typeColor }: { detail: any; typeColor: string }) {
  const router = useRouter();
  const evos = detail.evolutions;

  if (!evos || evos.length === 0) {
    return (
      <View style={[tabs.container, tabs.centered]}>
        <Text style={tabs.empty}>No evolution data</Text>
      </View>
    );
  }

  return (
    <View style={tabs.container}>
      {evos.map((evo: any, i: number) => (
        <React.Fragment key={evo.id}>
          {i > 0 && (
            <View style={tabs.evoArrow}>
              <View style={[tabs.evoArrowLine, { backgroundColor: typeColor + "55" }]} />
              <Text style={[tabs.evoArrowLabel, { color: typeColor }]}>
                {evos[i].trigger || "→"}
              </Text>
            </View>
          )}
          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              tabs.evoCard,
              evo.id === detail.id && { borderColor: typeColor, borderWidth: 2 },
            ]}
            onPress={() => router.replace(`/pokemon/${evo.id}`)}
          >
            <View
              style={[
                tabs.evoSpriteWrap,
                { backgroundColor: typeColor + "18" },
              ]}
            >
              <Image
                source={{ uri: evo.sprite }}
                style={tabs.evoSprite}
                contentFit="contain"
                transition={300}
              />
            </View>
            <View style={tabs.evoInfo}>
              <Text style={tabs.evoNumber}>
                #{String(evo.id).padStart(3, "0")}
              </Text>
              <Text style={tabs.evoName}>
                {evo.name.charAt(0).toUpperCase() + evo.name.slice(1)}
              </Text>
              {evo.id === detail.id && (
                <Text style={[tabs.evoCurrent, { color: typeColor }]}>
                  Current
                </Text>
              )}
            </View>
          </TouchableOpacity>
        </React.Fragment>
      ))}
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F5F7FA" },

  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F7FA",
    gap: 12,
  },
  loadingText: { fontSize: 15, color: "#6B7280", marginTop: 8 },
  errorEmoji: { fontSize: 48 },
  errorText: { fontSize: 16, color: "#EF4444", fontWeight: "600" },
  backBtn: {
    marginTop: 8,
    backgroundColor: "#6C63FF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  backBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  // Hero
  hero: {
    minHeight: 300,
    paddingHorizontal: 20,
    paddingBottom: 20,
    overflow: "hidden",
    position: "relative",
  },
  heroCircle1: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 40,
    borderColor: "rgba(255,255,255,0.12)",
    right: -60,
    bottom: -60,
  },
  heroCircle2: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 25,
    borderColor: "rgba(255,255,255,0.08)",
    right: 40,
    top: -20,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  backIcon: { fontSize: 18, color: "#fff", fontWeight: "700" },

  heroMeta: { zIndex: 1 },
  heroNumber: {
    fontSize: 14,
    fontWeight: "700",
    color: "rgba(255,255,255,0.75)",
    marginBottom: 4,
  },
  heroName: {
    fontSize: 36,
    fontWeight: "900",
    color: "#fff",
    textTransform: "capitalize",
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  heroBadges: { flexDirection: "row", gap: 8, flexWrap: "wrap" },

  heroSprite: {
    position: "absolute",
    right: -10,
    bottom: -10,
    width: 180,
    height: 180,
    zIndex: 2,
  },

  // Body
  body: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -24,
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

  // Tabs
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingTop: 20,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingBottom: 12,
    position: "relative",
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    height: 3,
    width: "60%",
    borderRadius: 2,
  },

  tabContent: { flex: 1 },
});

const tabs = StyleSheet.create({
  container: {
    padding: 20,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  empty: {
    fontSize: 15,
    color: "#9CA3AF",
    textAlign: "center",
    paddingVertical: 24,
  },

  // Details tab
  statsRow: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    gap: 4,
  },
  statBlock: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "800",
    textTransform: "capitalize",
    textAlign: "center",
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9CA3AF",
    textAlign: "center",
  },
  descBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  descText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#374151",
  },
  subheading: {
    fontSize: 13,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 10,
    marginTop: 4,
  },
  abilitiesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  abilityChip: {
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  abilityText: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  categoryText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A2E",
    marginBottom: 8,
  },

  // Moves tab
  moveHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    marginBottom: 4,
  },
  moveCellHdr: {
    fontSize: 11,
    fontWeight: "800",
    color: "#9CA3AF",
    textAlign: "center",
    letterSpacing: 0.5,
    width: 40,
  },
  moveRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 10,
  },
  moveRowAlt: { backgroundColor: "#F9FAFB" },
  moveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  moveName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A2E",
    textTransform: "capitalize",
    flex: 1,
  },
  moveCell: {
    width: 40,
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    fontWeight: "600",
  },

  // Status tab — Total card
  totalCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 20,
    marginTop: 8,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  totalCardLeft: {
    gap: 2,
  },
  totalCardLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  totalCardValue: {
    fontSize: 40,
    fontWeight: "900",
    lineHeight: 46,
    letterSpacing: -1,
  },
  totalCardSub: {
    fontSize: 12,
    fontWeight: "500",
    color: "#9CA3AF",
  },
  totalCardRight: {
    alignItems: "center",
    justifyContent: "center",
  },
  totalRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  totalRingInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  totalPct: {
    fontSize: 14,
    fontWeight: "800",
  },

  // Legend
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    padding: 14,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6B7280",
  },

  // Evolutions tab
  evoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 20,
    padding: 14,
    gap: 16,
    borderWidth: 2,
    borderColor: "transparent",
  },
  evoSpriteWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  evoSprite: { width: 70, height: 70 },
  evoInfo: { flex: 1 },
  evoNumber: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9CA3AF",
    marginBottom: 2,
  },
  evoName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1A1A2E",
    textTransform: "capitalize",
    marginBottom: 2,
  },
  evoCurrent: {
    fontSize: 12,
    fontWeight: "700",
  },
  evoArrow: {
    alignItems: "center",
    marginVertical: 10,
    gap: 4,
  },
  evoArrowLine: {
    width: 2,
    height: 20,
    borderRadius: 1,
  },
  evoArrowLabel: {
    fontSize: 12,
    fontWeight: "700",
  },
});
