import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

interface StatBarProps {
  label: string;
  value: number;
  max: number;
  color: string;
  delay?: number;
}

function getTierColor(value: number): string {
  if (value >= 120) return "#22c55e";
  if (value >= 90)  return "#84cc16";
  if (value >= 60)  return "#facc15";
  if (value >= 40)  return "#fb923c";
  return "#f87171";
}

export function StatBar({ label, value, max, color, delay = 0 }: StatBarProps) {
  const progress = useSharedValue(0);
  const percentage = Math.min((value / max) * 100, 100);
  const barColor = getTierColor(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      progress.value = withTiming(percentage, {
        duration: 900,
        easing: Easing.out(Easing.cubic),
      });
    }, delay);
    return () => clearTimeout(timer);
  }, [percentage]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  return (
    <View style={styles.row}>
      {/* Left: label + full name */}
      <View style={styles.left}>
        <Text style={[styles.label, { color }]}>{label}</Text>
      </View>

      {/* Center: track */}
      <View style={styles.trackWrap}>
        <View style={styles.track}>
          <Animated.View
            style={[styles.fill, barStyle, { backgroundColor: barColor }]}
          />
        </View>
      </View>

      {/* Right: value + tier dot */}
      <View style={styles.right}>
        <View style={[styles.valuePill, { backgroundColor: barColor + "20", borderColor: barColor + "50" }]}>
          <View style={[styles.dot, { backgroundColor: barColor }]} />
          <Text style={[styles.value, { color: barColor }]}>{value}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 10,
  },
  left: {
    width: 52,
  },
  label: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  trackWrap: {
    flex: 1,
  },
  track: {
    height: 10,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 8,
  },
  right: {
    width: 72,
    alignItems: "flex-end",
  },
  valuePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  value: {
    fontSize: 13,
    fontWeight: "800",
  },
});
