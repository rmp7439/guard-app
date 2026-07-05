import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/radius';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  prefix?: string;
}

export function Input({ label, error, prefix, style, ...props }: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View 
      style={styles.container}
      accessible={true}
      accessibilityRole="none"
    >
      {label && (
        <Text 
          style={styles.label}
          importantForAccessibility="no"
        >
          {label}
        </Text>
      )}
      
      <View 
        style={[
          styles.inputWrapper, 
          isFocused && styles.inputFocused,
          error ? styles.inputError : null
        ]}
      >
        {prefix && (
          <View style={styles.prefixContainer}>
            <Text style={styles.prefixText}>{prefix}</Text>
          </View>
        )}
        <TextInput
          accessibilityLabel={label || props.placeholder}
          accessibilityHint={error}
          style={[
            styles.input,
            prefix ? styles.inputWithPrefix : styles.inputStandard,
            style,
          ]}
          placeholderTextColor={colors.textSecondary}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          // Enhance keyboard enterprise experience
          returnKeyType={props.keyboardType === 'numeric' ? 'done' : 'default'}
          autoCorrect={false}
          {...props}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: spacing.md, 
  },
  label: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    fontWeight: typography.weight.medium,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    width: '100%',
    height: 54, 
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.inputBackground,
    overflow: 'hidden',
  },
  inputFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.white,
    // Add subtle shadow for focus state elevation
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputError: {
    borderColor: colors.error,
    backgroundColor: colors.errorBg,
  },
  prefixContainer: {
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: colors.borderLight,
  },
  prefixText: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.medium,
    color: colors.textPrimary,
  },
  input: {
    flex: 1,
    fontSize: typography.size.lg,
    color: colors.textPrimary,
  },
  inputWithPrefix: {
    paddingHorizontal: spacing.lg,
  },
  inputStandard: {
    paddingHorizontal: spacing.lg,
  },
});