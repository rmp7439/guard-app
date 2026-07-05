import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Screen } from '../../components/ui/Screen';
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

const formatDate = (date: Date): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

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
  if (!start || !end) return '--';
  const diffMs = end.getTime() - start.getTime();
  if (diffMs < 0) return '--';
  
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${diffHrs}h ${diffMins}m`;
};

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

export default function AttendanceScreen() {
  const { status, checkInTime, checkOutTime, checkIn, checkOut } = useAttendance();
  const { 
    location, 
    permissionGranted, 
    isLoading: isLocationLoading, 
    error: locationError, 
    requestPermission, 
    refreshLocation 
  } = useLocation();

  const [isActionLoading, setIsActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleAction = () => {
    setIsActionLoading(true);
    setSuccessMessage(null);

    setTimeout(() => {
      if (status === 'checked_out' && location) {
        checkIn(location);
        setSuccessMessage('Attendance marked successfully.');
      } else {
        checkOut();
        setSuccessMessage('Checked out successfully.');
      }
      setIsActionLoading(false);

      setTimeout(() => setSuccessMessage(null), 3000);
    }, 800);
  };

  const isCheckedIn = status === 'checked_in';

  const renderLocationSection = () => {
    if (isLocationLoading) {
      return (
        <Card style={[styles.section, styles.centerCard]}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loadingText}>Fetching precise location...</Text>
        </Card>
      );
    }

    if (permissionGranted === false) {
      return (
        <Card style={styles.section}>
          <View style={styles.locationHeader}>
             <Text style={styles.cardTitle}>Location Required</Text>
             <Ionicons name="warning-outline" size={18} color={colors.warningText} />
          </View>
          <Text style={styles.permissionDesc}>
            GPS permission is required to verify your attendance location.
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
             <Ionicons name="alert-circle-outline" size={18} color={colors.error} />
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
            <Text style={styles.cardTitle}>Verified Location</Text>
            <Ionicons name="checkmark-circle" size={18} color={colors.success} />
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

  return (
    <Screen contentContainerStyle={styles.container} backgroundColor={colors.background}>
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Attendance</Text>
      </View>

      {/* Current Status Card (Compact) */}
      <Card style={[styles.section, styles.statusCardRow]}>
        <View>
          <Text style={styles.cardTitle}>Current Status</Text>
          <Badge 
            label={isCheckedIn ? 'Checked In' : 'Checked Out'} 
            variant={isCheckedIn ? 'success' : 'neutral'} 
          />
        </View>
        <View style={styles.timeContainerRight}>
          <Text style={styles.currentTime}>{formatTime(currentTime)}</Text>
          <Text style={styles.currentDate}>{formatDate(currentTime)}</Text>
        </View>
      </Card>

      {/* Real GPS Location Card */}
      {renderLocationSection()}

      {/* Action Section */}
      <View style={styles.actionSection}>
        {successMessage ? (
          <View style={styles.successMessage}>
            <Ionicons name="checkmark-circle-outline" size={20} color={colors.successText} style={styles.successIcon} />
            <Text style={styles.successMessageText}>{successMessage}</Text>
          </View>
        ) : null}
        
        <Button
          title={isCheckedIn ? 'Check Out' : 'Check In'}
          variant={isCheckedIn ? 'danger' : 'primary'}
          onPress={handleAction}
          loading={isActionLoading}
          disabled={!permissionGranted || !location || isLocationLoading} 
        />
      </View>

      {/* Today's Log */}
      <Card style={styles.section}>
        <Text style={styles.cardTitle}>Today's Log</Text>
        <View style={styles.logList}>
          <LogRow label="Check In" value={formatTime(checkInTime)} />
          <LogRow label="Check Out" value={formatTime(checkOutTime)} />
          <View style={styles.divider} />
          <LogRow
            label="Total Hours"
            value={calculateDuration(checkInTime, checkOutTime)}
          />
        </View>
      </Card>
      
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.massive, // Noticeably lower start to let the screen breathe
    paddingBottom: 120, // Even vertical distribution clear of the tab bar
  },
  section: {
    marginBottom: spacing.xxl, // Spread sections out evenly
  },
  centerCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  header: {
    marginBottom: spacing.xxxl, // Clear visual gap before the first card
  },
  title: {
    fontSize: typography.size.headline,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  statusCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  timeContainerRight: {
    alignItems: 'flex-end',
  },
  currentTime: {
    fontSize: typography.size.title,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  currentDate: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    fontWeight: typography.weight.medium,
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
    marginBottom: spacing.xxl, // Increase gap below main action button
  },
  successMessage: {
    flexDirection: 'row',
    backgroundColor: colors.successBg,
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  successIcon: {
    marginRight: spacing.sm,
  },
  successMessageText: {
    color: colors.successText,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
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
});