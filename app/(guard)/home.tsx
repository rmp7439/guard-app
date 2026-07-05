import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Screen } from '../../components/ui/Screen';
import { Skeleton } from '../../components/ui/Skeleton';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { radius } from '../../theme/radius';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../features/auth/contexts/AuthContext';
import { useAttendance } from '../../features/attendance/contexts/AttendanceContext';
import { formatTime, formatDuration } from '../../utils/formatters';

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
  const { 
    todayRecord, 
    currentStatus, 
    workingMinutes, 
    canCheckIn, 
    canCheckOut,
    isAttendanceLoading,
  } = useAttendance();

  const [greeting, setGreeting] = useState('Good Morning ☀️');
  const [refreshing, setRefreshing] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) setGreeting('Good Morning ☀️');
      else if (hour >= 12 && hour < 17) setGreeting('Good Afternoon 🌤️');
      else if (hour >= 17 && hour < 21) setGreeting('Good Evening 🌇');
      else setGreeting('Good Night 🌙');
    };

    updateGreeting();
    const timer = setInterval(updateGreeting, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleRefresh = React.useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setRefreshing(true);
    setTimeout(() => {
      if (isMounted.current) setRefreshing(false);
    }, 1000);
  }, []);

  const getStatusBadgeLabel = () => {
    if (currentStatus === 'NOT_STARTED') return 'Not Started';
    if (currentStatus === 'CHECKED_IN') return 'On Duty';
    return 'Shift Completed';
  };

  const getStatusBadgeVariant = () => {
    if (currentStatus === 'CHECKED_IN') return 'success';
    return 'neutral';
  };

  const getActionButtonTitle = () => {
    if (canCheckIn) return 'Go to Check In';
    if (canCheckOut) return 'Go to Check Out';
    return 'View Attendance';
  };

  if (isAttendanceLoading) {
    return (
      <Screen contentContainerStyle={styles.container} backgroundColor={colors.background}>
        <View style={styles.header}>
          <Skeleton width={140} height={16} style={{ marginBottom: spacing.sm }} />
          <Skeleton width={200} height={32} />
        </View>
        <Card style={styles.section}><Skeleton height={24} /></Card>
        <Card style={styles.section}><Skeleton height={60} /></Card>
        <Skeleton height={54} borderRadius={radius.xl} style={styles.section} />
        <Card style={styles.section}><Skeleton height={100} /></Card>
        <Card style={styles.section}><Skeleton height={100} /></Card>
      </Screen>
    );
  }

  return (
    <Screen 
      contentContainerStyle={styles.container} 
      backgroundColor={colors.background}
      refreshing={refreshing}
      onRefresh={handleRefresh}
    >
      
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greeting}</Text>
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

      <Card style={[styles.section, styles.rowCard]}>
        <View style={styles.flex1}>
          <Text style={styles.cardTitle}>Today's Status</Text>
          <Badge 
            label={getStatusBadgeLabel()} 
            variant={getStatusBadgeVariant()} 
          />
        </View>
        <View style={styles.dividerVertical} />
        <View style={styles.flex1}>
          <Text style={styles.cardTitle}>Current Shift</Text>
          <Text style={styles.shiftValue}>09:00 AM - 06:00 PM</Text>
        </View>
      </Card>

      <View style={[styles.actionsContainer, styles.section]}>
        <Button 
          title={getActionButtonTitle()}
          variant="primary" 
          onPress={() => router.navigate('/(guard)/attendance')}
        />
      </View>

      <Card style={styles.section}>
        <Text style={styles.cardTitle}>Today's Summary</Text>
        <View style={styles.summaryList}>
          <SummaryRow icon="time-outline" label="Working Hours" value={formatDuration(workingMinutes)} />
          <SummaryRow icon="log-in-outline" label="Check In" value={formatTime(todayRecord?.checkInTime)} />
          <SummaryRow icon="log-out-outline" label="Check Out" value={formatTime(todayRecord?.checkOutTime)} />
        </View>
      </Card>

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
    paddingTop: spacing.massive, 
    paddingBottom: 120, 
  },
  section: {
    marginBottom: spacing.xxl, 
  },
  flex1: {
    flex: 1,
  },
  header: {
    marginBottom: spacing.xxxl, 
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