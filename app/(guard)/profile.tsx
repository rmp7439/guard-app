import React, { useMemo, useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Screen } from '../../components/ui/Screen';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { typography } from '../../theme/typography';
import { useAuth } from '../../features/auth/contexts/AuthContext';
import { useAttendance } from '../../features/attendance/contexts/AttendanceContext';
import { Ionicons } from '@expo/vector-icons';

const InfoRow = ({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={[styles.infoValue, valueColor ? { color: valueColor } : null]}>{value}</Text>
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
    onPress={() => {
      if (!disabled && onPress) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        onPress();
      }
    }}
    disabled={disabled}
  >
    <View style={styles.actionLeft}>
      <Ionicons 
        name={icon} 
        size={20} 
        color={disabled ? colors.textSecondary : colors.textPrimary} 
        style={styles.actionIcon} 
      />
      <Text style={[styles.actionTitle, disabled && styles.actionTitleDisabled]}>
        {title}
      </Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
  </Pressable>
);

const SectionHeader = ({ title }: { title: string }) => (
  <Text style={styles.sectionTitle}>{title}</Text>
);

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { attendanceHistory, currentStatus } = useAttendance();

  const [refreshing, setRefreshing] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const employeeData = useMemo(() => ({
    id: 'GRD-2026',
    designation: 'Senior Security Guard',
    department: 'Site Security',
    status: 'Active',
    joiningDate: '12 Jan 2024',
    assignedSite: 'ABC Construction Site',
  }), []);

  const stats = useMemo(() => {
    const totalDays = attendanceHistory.length;
    const completedShifts = attendanceHistory.filter(r => r.checkOutTime !== null).length;
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const currentMonthAttendance = attendanceHistory.filter(r => {
      const d = new Date(r.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    let displayStatus = 'Not Started';
    if (currentStatus === 'CHECKED_IN') displayStatus = 'On Duty';
    if (currentStatus === 'COMPLETED') displayStatus = 'Shift Completed';

    return {
      totalDays,
      completedShifts,
      currentMonthAttendance,
      displayStatus,
    };
  }, [attendanceHistory, currentStatus]);

  const handleRefresh = React.useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setRefreshing(true);
    setTimeout(() => {
      if (isMounted.current) setRefreshing(false);
    }, 1000);
  }, []);

  const confirmLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out of your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive', 
          onPress: () => {
            if (isMounted.current) {
              logout();
              router.replace('/(auth)/login');
            }
          }
        },
      ],
      { cancelable: true }
    );
  };

  const displayName = user?.name || 'John Doe';
  const displayMobile = user?.mobile ? `+91 ${user.mobile}` : '+91 9876543210';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <Screen 
      contentContainerStyle={styles.container} 
      backgroundColor={colors.background}
      refreshing={refreshing}
      onRefresh={handleRefresh}
    >
      
      {/* SECTION 1: Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.designationText}>{employeeData.designation}</Text>
        <View style={styles.badgesContainer}>
          <Badge label={employeeData.id} variant="neutral" />
          <View style={styles.badgeSpacer} />
          <Badge label={employeeData.status} variant="success" />
        </View>
      </View>

      {/* SECTION 2: Employee Information Card */}
      <View style={styles.section}>
        <SectionHeader title="Employee Information" />
        <Card>
          <InfoRow label="Employee ID" value={employeeData.id} />
          <View style={styles.divider} />
          <InfoRow label="Mobile Number" value={displayMobile} />
          <View style={styles.divider} />
          <InfoRow label="Assigned Site" value={employeeData.assignedSite} />
          <View style={styles.divider} />
          <InfoRow label="Department" value={employeeData.department} />
          <View style={styles.divider} />
          <InfoRow label="Joining Date" value={employeeData.joiningDate} />
        </Card>
      </View>

      {/* SECTION 3: Attendance Statistics */}
      <View style={styles.section}>
        <SectionHeader title="Attendance Overview" />
        <Card>
          <InfoRow label="Total Attendance Days" value={stats.totalDays.toString()} />
          <View style={styles.divider} />
          <InfoRow label="Completed Shifts" value={stats.completedShifts.toString()} />
          <View style={styles.divider} />
          <InfoRow label="Current Month" value={`${stats.currentMonthAttendance} Days`} />
          <View style={styles.divider} />
          <InfoRow 
            label="Current Status" 
            value={stats.displayStatus} 
            valueColor={currentStatus === 'CHECKED_IN' ? colors.success : colors.textPrimary}
          />
        </Card>
      </View>

      {/* SECTION 4: Quick Actions */}
      <View style={styles.section}>
        <SectionHeader title="Quick Actions" />
        <Card style={styles.actionsCard}>
          <ActionRow title="Profile Settings" icon="person-outline" onPress={() => {}} />
          <View style={styles.divider} />
          <ActionRow title="Privacy Policy" icon="shield-checkmark-outline" onPress={() => {}} />
          <View style={styles.divider} />
          <ActionRow title="Help & Support" icon="help-circle-outline" onPress={() => {}} />
          <View style={styles.divider} />
          <ActionRow title="About Application" icon="information-circle-outline" onPress={() => {}} />
        </Card>
      </View>

      {/* SECTION 5: Application Information */}
      <View style={styles.section}>
        <SectionHeader title="Application Info" />
        <Card style={styles.appInfoCard}>
          <View style={styles.appInfoRow}>
            <Text style={styles.appInfoLabel}>Version</Text>
            <Text style={styles.appInfoValue}>1.0.0</Text>
          </View>
          <View style={styles.appInfoRow}>
            <Text style={styles.appInfoLabel}>Build Number</Text>
            <Text style={styles.appInfoValue}>20260705</Text>
          </View>
          <View style={styles.appInfoRow}>
            <Text style={styles.appInfoLabel}>Environment</Text>
            <Text style={styles.appInfoValue}>Demo (Production)</Text>
          </View>
        </Card>
      </View>

      {/* SECTION 6: Logout */}
      <View style={styles.footer}>
        <Button
          title="Logout Securely"
          variant="danger"
          onPress={confirmLogout}
          style={styles.logoutButton}
        />
      </View>

    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.massive, 
    paddingBottom: 120, 
  },
  section: {
    marginBottom: spacing.xl, 
  },
  sectionTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    marginLeft: spacing.xs,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  avatarContainer: {
    width: 88,
    height: 88,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  avatarText: {
    fontSize: typography.size.display,
    color: colors.white,
    fontWeight: typography.weight.bold,
  },
  name: {
    fontSize: typography.size.title,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  designationText: {
    fontSize: typography.size.md,
    color: colors.textSecondary,
    fontWeight: typography.weight.medium,
    marginBottom: spacing.md,
  },
  badgesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeSpacer: {
    width: spacing.sm,
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
    marginVertical: spacing.xs,
  },
  appInfoCard: {
    backgroundColor: colors.backgroundAlt,
    paddingVertical: spacing.md,
    borderColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
  },
  appInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  appInfoLabel: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
  appInfoValue: {
    fontSize: typography.size.sm,
    color: colors.textPrimary,
    fontWeight: typography.weight.medium,
  },
  footer: {
    marginTop: spacing.xl, 
  },
  logoutButton: {
    marginBottom: spacing.xs,
  },
});