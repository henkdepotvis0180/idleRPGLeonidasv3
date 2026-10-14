import React, { type ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
export function Button({
  label,
  onPress,
  disabled = false,
  secondary = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  secondary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={[
        ui.button,
        secondary && ui.secondary,
        disabled && { opacity: 0.35 },
      ]}
    >
      <Text style={[ui.buttonText, secondary && { color: "#e8d9bd" }]}>
        {label}
      </Text>
    </Pressable>
  );
}
export function Card({
  children,
  color,
  style,
}: {
  children: ReactNode;
  color?: string;
  style?: ViewStyle;
}) {
  return (
    <View style={[ui.card, color ? { borderColor: color } : null, style]}>
      {children}
    </View>
  );
}
export function Bar({
  value,
  max,
  color = "#e4c183",
}: {
  value: number;
  max: number;
  color?: string;
}) {
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max, now: value }}
      style={ui.bar}
    >
      <View
        style={{
          height: 6,
          width: `${Math.max(0, Math.min(100, (value / max) * 100))}%`,
          backgroundColor: color,
          borderRadius: 6,
        }}
      />
    </View>
  );
}
export const ui = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#151e2c" },
  content: { padding: 18, paddingBottom: 24, gap: 14 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 18,
    paddingBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    color: "#f4e5c9",
    letterSpacing: 1.8,
  },
  eyebrow: {
    fontSize: 9,
    letterSpacing: 1.6,
    color: "#a7a7bf",
    textTransform: "uppercase",
    marginBottom: 5,
  },
  heading: {
    fontSize: 23,
    fontWeight: "800",
    color: "#f5e9d0",
    marginBottom: 4,
  },
  subheading: { fontSize: 17, fontWeight: "700", color: "#eee1c7" },
  body: { fontSize: 13, color: "#c4c9d7", lineHeight: 21 },
  small: { fontSize: 11, color: "#a2adbf", lineHeight: 17 },
  gold: { fontSize: 15, fontWeight: "800", color: "#e9c990" },
  card: {
    backgroundColor: "#202d3f",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#354459",
    gap: 9,
  },
  button: {
    backgroundColor: "#e3c48c",
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#202838",
    textAlign: "center",
  },
  secondary: {
    backgroundColor: "#2d3d53",
    borderWidth: 1,
    borderColor: "#526079",
  },
  bar: {
    height: 6,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: "#35445b",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  slot: { width: "48%", minHeight: 155 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  nav: {
    flexDirection: "row",
    backgroundColor: "#1c2939",
    padding: 5,
    borderTopWidth: 1,
    borderColor: "#354459",
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    borderRadius: 10,
    paddingVertical: 7,
  },
  navActive: { backgroundColor: "#35445a" },
  navText: { fontSize: 10, fontWeight: "700", color: "#a9b6c9" },
  selected: { borderColor: "#e3c48c", backgroundColor: "#354258" },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: "#2d3d53",
    borderWidth: 1,
    borderColor: "#45556c",
  },
});
