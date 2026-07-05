import React from 'react';
import { Pressable, Text, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/radius';
import { typography } from '../../theme/typography';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: ButtonVariant;
  style?: ViewStyle | ViewStyle[];
}

export function Button({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  style,
}: ButtonProps) {
  const isSecondary = variant === 'secondary';
  const isDanger = variant === 'danger';
  const isPrimary = variant === 'primary';

  const handlePress = () => {
    if (!disabled && !loading && onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      onPress();
    }
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      // Increased hit area for better touch targets and accessibility
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      style={({ pressed }) => [
        styles.button,
        isPrimary && styles.primaryBg,
        isSecondary && styles.secondaryBg,
        isDanger && styles.dangerBg,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
      onPress={handlePress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={isSecondary ? colors.primary : colors.white} />
      ) : (
        <Text
          style={[
            styles.text,
            isPrimary && styles.primaryText,
            isSecondary && styles.secondaryText,
            isDanger && styles.dangerText,
            disabled && styles.disabledText,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 54,
    borderRadius: radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
    backgroundColor: colors.borderLight,
    borderColor: 'transparent',
  },
  primaryBg: {
    backgroundColor: colors.primary,
  },
  secondaryBg: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dangerBg: {
    backgroundColor: colors.error,
  },
  text: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.semibold,
  },
  primaryText: {
    color: colors.white,
  },
  secondaryText: {
    color: colors.textPrimary,
  },
  dangerText: {
    color: colors.white,
  },
  disabledText: {
    color: colors.textSecondary,
  },
});