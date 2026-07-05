import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";
import { radius } from "../../theme/radius";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";

type BadgeVariant = "success" | "warning" | "danger" | "neutral" | "primary";

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

export function Badge({ label, variant = "neutral" }: BadgeProps) {
  return (
    <View style={[styles.badge, styles[`${variant}Bg`]]}>
      <Text style={[styles.text, styles[`${variant}Text`]]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.round,
    alignSelf: "flex-start",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
  },
  successBg: { backgroundColor: colors.successBg },
  successText: { color: colors.successText },
  warningBg: { backgroundColor: colors.warningBg },
  warningText: { color: colors.warningText },
  dangerBg: { backgroundColor: colors.errorBg },
  dangerText: { color: colors.errorText },
  neutralBg: { backgroundColor: colors.neutralBg },
  neutralText: { color: colors.neutralText },
  primaryBg: {
    backgroundColor: colors.primary,
  },

  primaryText: {
    color: colors.white,
  },
});
