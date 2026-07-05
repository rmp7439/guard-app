import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../components/ui/Screen';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { typography } from '../../theme/typography';
import { useAuth } from '../../features/auth/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const ActionRow = ({
  title,
  icon,
  onPress,
  disabled = false,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  disabled?: boolean;
}) => (
  <Pressable
    style={({ pressed }) => [
      styles.actionRow, 
      disabled && styles.actionRowDisabled,
      pressed && !disabled && styles.actionRowPressed
    ]}
    onPress={disabled ? undefined : onPress}
    disabled={disabled}
  >
    <View style={styles.actionLeft}>
      <Ionicons 
        name={icon} 
        size={20} 
        color={disabled ? colors.textSecondary : colors.primary} 
        style={styles.actionIcon} 
      />
      <Text style={[styles.actionTitle, disabled && styles.actionTitleDisabled]}>
        {title}
      </Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
  </Pressable>
);

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  const displayName = user?.name || 'John Doe';
  const displayMobile = user?.mobile ? `+91 ${user.mobile}` : '+91 9876543210';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <Screen contentContainerStyle={styles.container} backgroundColor={colors.background}>
      
      {/* Header / Avatar Section */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <Text style={styles.name}>{displayName}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Guard ID: GRD-2026</Text>
        </View>
      </View>

      {/* Personal Info Card */}
      <Card style={styles.section}>
        <InfoRow label="Mobile Number" value={displayMobile} />
        <View style={styles.divider} />
        <InfoRow label="Assigned Site" value="ABC Construction Site" />
      </Card>

      {/* Actions Card */}
      <Card style={[styles.section, styles.actionsCard]}>
        <ActionRow title="Edit Profile" icon="person-outline" disabled />
        <View style={styles.divider} />
        <ActionRow title="Help & Support" icon="help-circle-outline" onPress={() => {}} />
        <View style={styles.divider} />
        <ActionRow title="Privacy Policy" icon="shield-checkmark-outline" onPress={() => {}} />
      </Card>

      {/* Logout & Version */}
      <View style={styles.footer}>
        <Button
          title="Logout"
          variant="danger"
          onPress={handleLogout}
          style={styles.logoutButton}
        />
        <Text style={styles.versionText}>App Version 1.0.0</Text>
      </View>

    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.massive, // Noticeably lower start to let the screen breathe
    paddingBottom: 120, // Even vertical distribution away from bottom navigation
  },
  section: {
    marginBottom: spacing.xxl, // Spread sections out evenly
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxxl, // Clear visual gap before the first card
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: typography.size.headline,
    color: colors.white,
    fontWeight: typography.weight.bold,
  },
  name: {
    fontSize: typography.size.xxxl,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  badge: {
    backgroundColor: colors.logoBackground,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.round,
    marginTop: spacing.xs,
  },
  badgeText: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    fontWeight: typography.weight.semibold,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  infoLabel: {
    fontSize: typography.size.md,
    color: colors.textSecondary,
    fontWeight: typography.weight.medium,
  },
  infoValue: {
    fontSize: typography.size.md,
    color: colors.textPrimary,
    fontWeight: typography.weight.semibold,
  },
  actionsCard: {
    paddingVertical: spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  actionRowPressed: {
    opacity: 0.7,
  },
  actionRowDisabled: {
    opacity: 0.5,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    marginRight: spacing.md,
  },
  actionTitle: {
    fontSize: typography.size.md,
    color: colors.textPrimary,
    fontWeight: typography.weight.medium,
  },
  actionTitleDisabled: {
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
  },
  footer: {
    marginTop: spacing.xl, // Fixed spacing instead of 'auto' for natural center alignment
  },
  logoutButton: {
    marginBottom: spacing.lg,
  },
  versionText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: typography.size.xs,
  },
});