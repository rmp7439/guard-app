import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
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
import { useLocation } from '../../features/location/hooks/useLocation';
import { useAttendance } from '../../features/attendance/contexts/AttendanceContext';
import { Ionicons } from '@expo/vector-icons';
import { formatDate, formatTime, formatDuration } from '../../utils/formatters';

const LogRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.logRow}>
    <Text style={styles.logLabel}>{label}</Text>
    <Text style={styles.logValue}>{value}</Text>
  </View>
);

const LocationRow = ({ label, value }: { label: string; value: string | number }) => (
  <View style={styles.locationRow}>
    <Text style={styles.locationLabel}>{label}</Text>
    <Text style={styles.locationValue}>{value}</Text>
  </View>
);

interface SuccessFeedback {
  title: string;
  subtitle: string;
}

export default function AttendanceScreen() {
  const { 
    attendanceHistory,
    todayRecord, 
    currentStatus, 
    canCheckIn, 
    canCheckOut, 
    workingMinutes,
    isAttendanceLoading,
    checkIn, 
    checkOut 
  } = useAttendance();
  
  const { 
    location, 
    permissionGranted, 
    isLoading: isLocationLoading, 
    error: locationError, 
    requestPermission, 
    refreshLocation 
  } = useLocation();

  const [isActionLoading, setIsActionLoading] = useState(false);
  const [successFeedback, setSuccessFeedback] = useState<SuccessFeedback | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  
  const feedbackOpacity = useRef(new Animated.Value(0)).current;
  const isMounted = useRef(true);
  const actionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (actionTimeoutRef.current) clearTimeout(actionTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (successFeedback) {
      Animated.timing(feedbackOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      feedbackOpacity.setValue(0);
    }
  }, [successFeedback, feedbackOpacity]);

  const handleRefresh = React.useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setRefreshing(true);
    await refreshLocation();
    if (isMounted.current) setRefreshing(false);
  }, [refreshLocation]);

  const handleAction = () => {
    setIsActionLoading(true);
    setSuccessFeedback(null);

    actionTimeoutRef.current = setTimeout(() => {
      if (!isMounted.current) return;
      
      const now = new Date();
      if (canCheckIn && location) {
        checkIn(location);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        setSuccessFeedback({
          title: 'Check In Successful',
          subtitle: `Started at ${formatTime(now)} • Location Verified`,
        });
      } else if (canCheckOut) {
        checkOut();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        setSuccessFeedback({
          title: 'Shift Completed',
          subtitle: `Total hours worked: ${formatDuration(workingMinutes)}`,
        });
      }
      setIsActionLoading(false);

      setTimeout(() => {
        if (isMounted.current) setSuccessFeedback(null);
      }, 4000);
    }, 800);
  };

  const getStatusBadgeLabel = () => {
    if (currentStatus === 'NOT_STARTED') return 'Not Started';
    if (currentStatus === 'CHECKED_IN') return 'On Duty';
    return 'Shift Completed';
  };

  const getStatusBadgeVariant = () => {
    if (currentStatus === 'CHECKED_IN') return 'success';
    if (currentStatus === 'COMPLETED') return 'primary';
    return 'neutral';
  };

  const getHistoryBadgeVariant = (status: string) => {
    if (status === 'Present') return 'success';
    if (status === 'Absent' || status === 'Leave') return 'danger';
    if (status === 'Late' || status === 'Half Day') return 'warning';
    return 'neutral';
  };

  const sortedHistory = [...attendanceHistory].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const renderStatusContext = () => {
    if (currentStatus === 'NOT_STARTED') {
      return <Text style={styles.statusSubtext}>Ready for Check In</Text>;
    }
    if (currentStatus === 'CHECKED_IN') {
      return (
        <Text style={styles.statusSubtext}>
          Working: <Text style={styles.statusHighlight}>{formatDuration(workingMinutes, false)}</Text>
        </Text>
      );
    }
    return (
      <Text style={styles.statusSubtext}>
        Worked: <Text style={styles.statusHighlight}>{formatDuration(workingMinutes, false)}</Text>
      </Text>
    );
  };

  const renderLocationSection = () => {
    if (isLocationLoading) {
      return (
        <Card style={[styles.section, styles.centerCard]}>
          <Skeleton height={24} width={24} borderRadius={12} style={{ marginBottom: spacing.md }} />
          <Skeleton height={14} width={180} />
        </Card>
      );
    }

    if (permissionGranted === false) {
      return (
        <Card style={styles.section}>
          <View style={styles.locationHeader}>
             <Text style={styles.cardTitle}>Location Required</Text>
             <Ionicons name="warning" size={18} color={colors.warningText} />
          </View>
          <Text style={styles.permissionDesc}>
            GPS permission is required to verify your attendance location before taking action.
          </Text>
          <Button 
            title="Grant Permission" 
            onPress={requestPermission} 
            style={styles.smallButton}
          />
        </Card>
      );
    }

    if (locationError) {
      return (
        <Card style={styles.section}>
          <View style={styles.locationHeader}>
             <Text style={[styles.cardTitle, { color: colors.error }]}>Location Error</Text>
             <Ionicons name="alert-circle" size={18} color={colors.error} />
          </View>
          <Text style={styles.permissionDesc}>{locationError}</Text>
          <Button 
            title="Retry Connection" 
            variant="secondary"
            onPress={refreshLocation} 
            style={styles.smallButton}
          />
        </Card>
      );
    }

    if (location) {
      return (
        <Card style={styles.section}>
          <View style={styles.locationHeader}>
            <Text style={styles.cardTitle}>Location Verified</Text>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          </View>
          <View style={styles.locationContainer}>
            <LocationRow label="Coordinates" value={`${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`} />
            <LocationRow label="Accuracy" value={location.accuracy ? `±${location.accuracy.toFixed(0)} meters` : 'Unknown'} />
            <LocationRow label="Last Updated" value={formatTime(new Date(location.timestamp))} />
          </View>
          
          <Button 
            title="Refresh Location" 
            variant="secondary"
            onPress={refreshLocation} 
            style={styles.refreshButton}
          />
        </Card>
      );
    }

    return null;
  };

  const renderActionSection = () => {
    if (currentStatus === 'COMPLETED') {
      return (
        <View style={styles.completedBanner}>
          <Ionicons name="checkmark-done-circle" size={28} color={colors.successText} />
          <Text style={styles.completedBannerText}>Today's Shift Completed</Text>
        </View>
      );
    }

    return (
      <Button
        title={canCheckIn ? 'Check In' : 'Check Out'}
        variant={canCheckIn ? 'primary' : 'danger'}
        onPress={handleAction}
        loading={isActionLoading}
        disabled={!permissionGranted || !location || isLocationLoading} 
      />
    );
  };

  if (isAttendanceLoading) {
    return (
      <Screen contentContainerStyle={styles.container} backgroundColor={colors.background}>
        <View style={styles.header}>
          <Skeleton width={180} height={32} />
        </View>
        <Card style={styles.section}><Skeleton height={100} /></Card>
        <Card style={styles.section}><Skeleton height={140} /></Card>
        <Skeleton height={54} borderRadius={radius.xl} style={styles.section} />
        <Card style={styles.section}><Skeleton height={120} /></Card>
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
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Attendance</Text>
      </View>

      {/* Hero Status Card */}
      <Card style={[styles.section, styles.heroCard]}>
        <View style={styles.heroTop}>
          <Badge 
            label={getStatusBadgeLabel()} 
            variant={getStatusBadgeVariant()} 
          />
          {renderStatusContext()}
        </View>
        <View style={styles.heroBottom}>
          <Text style={styles.currentTime}>{formatTime(currentTime)}</Text>
          <Text style={styles.currentDate}>{formatDate(currentTime)}</Text>
        </View>
      </Card>

      {/* Real GPS Location Card */}
      {renderLocationSection()}

      {/* Action Section */}
      <View style={styles.actionSection}>
        {successFeedback ? (
          <Animated.View style={[styles.successMessage, { opacity: feedbackOpacity }]}>
            <Ionicons name="checkmark-circle" size={24} color={colors.successText} style={styles.successIcon} />
            <View style={styles.successTextContainer}>
              <Text style={styles.successTitle}>{successFeedback.title}</Text>
              <Text style={styles.successSubtitle}>{successFeedback.subtitle}</Text>
            </View>
          </Animated.View>
        ) : null}
        
        {renderActionSection()}
      </View>

      {/* Today's Log */}
      <Card style={styles.section}>
        <Text style={styles.cardTitle}>Today's Log</Text>
        <View style={styles.logList}>
          <LogRow label="Check In" value={formatTime(todayRecord?.checkInTime)} />
          <LogRow label="Check Out" value={formatTime(todayRecord?.checkOutTime)} />
          <View style={styles.divider} />
          <LogRow
            label="Total Hours"
            value={formatDuration(workingMinutes, false)}
          />
          <LogRow
            label="Status"
            value={todayRecord?.status || '--'}
          />
        </View>
      </Card>

      {/* Attendance History */}
      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>Attendance History</Text>
        
        {sortedHistory.length === 0 ? (
          <Card style={styles.emptyStateCard}>
            <Text style={styles.emptyStateText}>Ready to begin your first shift.</Text>
          </Card>
        ) : (
          sortedHistory.map((record) => (
            <Card key={record.id} style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyDate}>{formatDate(record.date)}</Text>
                <Badge label={record.status} variant={getHistoryBadgeVariant(record.status)} />
              </View>
              <View style={styles.logList}>
                <LogRow label="Check In" value={formatTime(record.checkInTime)} />
                <LogRow label="Check Out" value={formatTime(record.checkOutTime)} />
                <View style={styles.divider} />
                <LogRow 
                  label="Working Hours" 
                  value={formatDuration(record.totalMinutes, false)} 
                />
              </View>
            </Card>
          ))
        )}
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
    marginBottom: spacing.xxl, 
  },
  centerCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  header: {
    marginBottom: spacing.xxxl, 
  },
  title: {
    fontSize: typography.size.headline,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  heroCard: {
    padding: spacing.xl,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
    width: '100%',
  },
  heroBottom: {
    alignItems: 'center',
    width: '100%',
  },
  cardTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusSubtext: {
    fontSize: typography.size.md,
    color: colors.textSecondary,
    fontWeight: typography.weight.medium,
  },
  statusHighlight: {
    color: colors.textPrimary,
    fontWeight: typography.weight.bold,
  },
  currentTime: {
    fontSize: typography.size.display,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    letterSpacing: -1,
  },
  currentDate: {
    fontSize: typography.size.md,
    color: colors.textSecondary,
    fontWeight: typography.weight.medium,
    marginTop: spacing.xs,
  },
  permissionDesc: {
    fontSize: typography.size.sm,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  loadingText: {
    marginTop: spacing.sm,
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  locationContainer: {
    gap: spacing.xs,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationLabel: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
  locationValue: {
    fontSize: typography.size.sm,
    color: colors.textPrimary,
    fontWeight: typography.weight.medium,
  },
  smallButton: {
    height: 44,
  },
  refreshButton: {
    height: 44,
  },
  actionSection: {
    marginBottom: spacing.xxl, 
  },
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.successBg,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#bbf7d0', 
  },
  completedBannerText: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.successText,
    marginLeft: spacing.sm,
  },
  successMessage: {
    flexDirection: 'row',
    backgroundColor: colors.successBg,
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  successIcon: {
    marginRight: spacing.md,
  },
  successTextContainer: {
    flex: 1,
  },
  successTitle: {
    color: colors.successText,
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    marginBottom: 2,
  },
  successSubtitle: {
    color: colors.successText,
    fontSize: typography.size.sm,
    opacity: 0.9,
  },
  logList: {
    marginTop: spacing.xs,
    gap: spacing.sm,
  },
  logRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  logLabel: {
    fontSize: typography.size.md,
    color: colors.textSecondary,
    fontWeight: typography.weight.medium,
  },
  logValue: {
    fontSize: typography.size.md,
    color: colors.textPrimary,
    fontWeight: typography.weight.semibold,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.sm,
  },
  historySection: {
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  historyCard: {
    marginBottom: spacing.lg,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  historyDate: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  emptyStateCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.huge,
  },
  emptyStateText: {
    fontSize: typography.size.md,
    color: colors.textSecondary,
  },
});