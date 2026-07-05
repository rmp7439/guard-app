import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../components/ui/Screen';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../features/auth/contexts/AuthContext';
import { useAttendance } from '../../features/attendance/contexts/AttendanceContext';

const formatTime = (date: Date | null): string => {
  if (!date) return '--';
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const strMinutes = minutes < 10 ? `0${minutes}` : minutes.toString();
  return `${hours}:${strMinutes} ${ampm}`;
};

const calculateDuration = (start: Date | null, end: Date | null): string => {
  if (!start || !end) return '0h 00m';
  const diffMs = end.getTime() - start.getTime();
  if (diffMs < 0) return '0h 00m';
  
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${diffHrs}h ${diffMins}m`;
};

const SummaryRow = ({ label, value, icon }: { label: string; value: string; icon: keyof typeof Ionicons.glyphMap }) => (
  <View style={styles.summaryRow}>
    <View style={styles.summaryLabelContainer}>
      <Ionicons name={icon} size={16} color={colors.textSecondary} style={styles.summaryIcon} />
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
    <Text style={styles.summaryValue}>{value}</Text>
  </View>
);

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { status, checkInTime, checkOutTime } = useAttendance();

  const isCheckedIn = status === 'checked_in';

  return (
    <Screen contentContainerStyle={styles.container} backgroundColor={colors.background}>
      
      {/* Balanced Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good Morning 👋</Text>
          <Text style={styles.userName}>{user?.name || 'John Doe'}</Text>
        </View>
      </View>

      <Card style={[styles.section, styles.siteCard]}>
        <Ionicons name="location" size={20} color={colors.primary} />
        <View style={styles.siteInfo}>
          <Text style={styles.siteLabel}>Assigned Site</Text>
          <Text style={styles.siteName}>ABC Construction Site</Text>
        </View>
      </Card>

      {/* Status Card (Compact) */}
      <Card style={[styles.section, styles.rowCard]}>
        <View style={styles.flex1}>
          <Text style={styles.cardTitle}>Today's Status</Text>
          <Badge 
            label={isCheckedIn ? 'Checked In' : 'Checked Out'} 
            variant={isCheckedIn ? 'success' : 'neutral'} 
          />
        </View>
        <View style={styles.dividerVertical} />
        <View style={styles.flex1}>
          <Text style={styles.cardTitle}>Current Shift</Text>
          <Text style={styles.shiftValue}>09:00 AM - 06:00 PM</Text>
        </View>
      </Card>

      {/* Quick Actions */}
      <View style={[styles.actionsContainer, styles.section]}>
        <Button 
          title={isCheckedIn ? "Go to Check Out" : "Go to Check In"}
          variant="primary" 
          onPress={() => router.navigate('/(guard)/attendance')}
        />
      </View>

      {/* Today Summary Card */}
      <Card style={styles.section}>
        <Text style={styles.cardTitle}>Today's Summary</Text>
        <View style={styles.summaryList}>
          <SummaryRow icon="time-outline" label="Working Hours" value={calculateDuration(checkInTime, checkOutTime)} />
          <SummaryRow icon="log-in-outline" label="Check In" value={formatTime(checkInTime)} />
          <SummaryRow icon="log-out-outline" label="Check Out" value={formatTime(checkOutTime)} />
        </View>
      </Card>

      {/* Bottom Section: Upcoming Shift */}
      <Card style={styles.section}>
        <Text style={styles.cardTitle}>Upcoming Shift</Text>
        <View style={styles.upcomingContent}>
          <View style={styles.upcomingRow}>
            <View style={styles.upcomingLeft}>
              <Ionicons name="calendar-outline" size={16} color={colors.textPrimary} style={styles.upcomingIcon} />
              <Text style={styles.upcomingDay}>Tomorrow</Text>
            </View>
            <Text style={styles.upcomingTime}>09:00 AM</Text>
          </View>
          <Text style={styles.upcomingSite}>ABC Construction Site</Text>
        </View>
      </Card>

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
  flex1: {
    flex: 1,
  },
  header: {
    marginBottom: spacing.xxxl, // Clear visual gap before the first card
  },
  greeting: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontWeight: typography.weight.medium,
  },
  userName: {
    fontSize: typography.size.title,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  siteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderWidth: 0,
  },
  siteInfo: {
    marginLeft: spacing.sm,
  },
  siteLabel: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  siteName: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.textPrimary,
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  dividerVertical: {
    width: 1,
    backgroundColor: colors.borderLight,
    marginHorizontal: spacing.lg,
    alignSelf: 'stretch',
  },
  cardTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  shiftValue: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
    color: colors.textPrimary,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryList: {
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryIcon: {
    marginRight: spacing.sm,
  },
  summaryLabel: {
    fontSize: typography.size.md,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.textPrimary,
  },
  upcomingContent: {
    gap: spacing.xs,
  },
  upcomingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  upcomingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  upcomingIcon: {
    marginRight: 6,
  },
  upcomingDay: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.textPrimary,
  },
  upcomingTime: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
    color: colors.textPrimary,
  },
  upcomingSite: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    marginLeft: 22,
  },
});