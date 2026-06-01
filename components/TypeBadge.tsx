import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { TYPE_COLORS } from "@/constants/typeColors";

interface TypeBadgeProps {
  type: string;
  size?: "sm" | "md" | "lg";
  /** Use light variant for dark/colored backgrounds */
  light?: boolean;
}

export function TypeBadge({ type, size = "md", light = false }: TypeBadgeProps) {
  const color = TYPE_COLORS[type] ?? "#A8A878";
  const fontSize = size === "sm" ? 10 : size === "lg" ? 14 : 12;
  const paddingH = size === "sm" ? 8 : size === "lg" ? 14 : 10;
  const paddingV = size === "sm" ? 3 : size === "lg" ? 6 : 4;

  const bgColor = light ? "rgba(255,255,255,0.25)" : color + "22";
  const borderColor = light ? "rgba(255,255,255,0.5)" : color;
  const textColor = light ? "#fff" : color;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bgColor,
          borderColor,
          paddingHorizontal: paddingH,
          paddingVertical: paddingV,
        },
      ]}
    >
      <Text style={[styles.text, { color: textColor, fontSize }]}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 20,
    borderWidth: 1.5,
    alignSelf: "flex-start",
  },
  text: {
    fontWeight: "700",
    textTransform: "capitalize",
    letterSpacing: 0.5,
  },
});
