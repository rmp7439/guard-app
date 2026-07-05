import React, { createContext, useState, useContext, ReactNode, useMemo, useEffect, useCallback} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocationData } from '../../location/hooks/useLocation';

export type AttendanceStatusType = 'Present' | 'Late' | 'Half Day' | 'Leave' | 'Absent';
export type ShiftStatus = 'NOT_STARTED' | 'CHECKED_IN' | 'COMPLETED';

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  checkInTime: Date;
  checkOutTime: Date | null;
  location: LocationData;
  totalMinutes: number;
  status: AttendanceStatusType;
}

const ATTENDANCE_STORAGE_KEY = '@guard_attendance_history';

interface AttendanceState {
  attendanceHistory: AttendanceRecord[];
  todayRecord: AttendanceRecord | null;
  currentStatus: ShiftStatus;
  canCheckIn: boolean;
  canCheckOut: boolean;
  workingMinutes: number;
  isAttendanceLoading: boolean;
  checkIn: (location: LocationData) => void;
  checkOut: () => void;
}

const AttendanceContext = createContext<AttendanceState | undefined>(undefined);

// Pure helpers extracted to prevent recreation on re-renders
const getTodayDateString = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const calculateWorkingMinutes = (start: Date, end: Date): number => {
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  const diffMs = end.getTime() - start.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60)));
};

export function AttendanceProvider({ children }: { children: ReactNode }) {
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [isAttendanceLoading, setIsAttendanceLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  // Initialization: Load from AsyncStorage safely
  useEffect(() => {
    const loadAttendance = async () => {
      try {
        const storedData = await AsyncStorage.getItem(ATTENDANCE_STORAGE_KEY);
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          
          if (Array.isArray(parsedData)) {
            // Safely hydrate Date objects, filtering out corrupted records
            const hydratedData = parsedData.reduce((acc: AttendanceRecord[], record: any) => {
              try {
                if (!record.checkInTime || !record.date) return acc;
                
                const checkInTime = new Date(record.checkInTime);
                const checkOutTime = record.checkOutTime ? new Date(record.checkOutTime) : null;
                
                if (isNaN(checkInTime.getTime())) return acc;
                if (checkOutTime && isNaN(checkOutTime.getTime())) return acc;

                acc.push({
                  ...record,
                  checkInTime,
                  checkOutTime,
                });
              } catch (err) {
                // Ignore malformed record
              }
              return acc;
            }, []);
            
            setAttendanceHistory(hydratedData);
          }
        }
      } catch (error) {
        console.error('Failed to load attendance history', error);
      } finally {
        setIsAttendanceLoading(false);
      }
    };

    loadAttendance();
  }, []);

  // Persistence
  useEffect(() => {
    if (isAttendanceLoading) return;

    const saveAttendance = async () => {
      try {
        await AsyncStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(attendanceHistory));
      } catch (error) {
        console.error('Failed to save attendance history', error);
      }
    };

    saveAttendance();
  }, [attendanceHistory, isAttendanceLoading]);

  // Active timer
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const todayDateStr = useMemo(() => getTodayDateString(), [now.getDate()]); // Update if crossed midnight

  const todayRecord = useMemo(() => {
    return attendanceHistory.find(record => record.date === todayDateStr) || null;
  }, [attendanceHistory, todayDateStr]);

  const currentStatus: ShiftStatus = useMemo(() => {
    if (!todayRecord) return 'NOT_STARTED';
    if (!todayRecord.checkOutTime) return 'CHECKED_IN';
    return 'COMPLETED';
  }, [todayRecord]);

  const canCheckIn = currentStatus === 'NOT_STARTED';
  const canCheckOut = currentStatus === 'CHECKED_IN';

  const workingMinutes = useMemo(() => {
    if (!todayRecord) return 0;
    if (currentStatus === 'COMPLETED') return todayRecord.totalMinutes;
    if (currentStatus === 'CHECKED_IN') {
      return calculateWorkingMinutes(todayRecord.checkInTime, now);
    }
    return 0;
  }, [todayRecord, currentStatus, now]);

  const checkIn = useCallback((location: LocationData) => {
    if (!canCheckIn) return; 

    const newRecord: AttendanceRecord = {
      id: Date.now().toString(),
      date: getTodayDateString(),
      checkInTime: new Date(),
      checkOutTime: null,
      location,
      totalMinutes: 0,
      status: 'Present',
    };

    setAttendanceHistory(prev => [...prev, newRecord]);
  }, [canCheckIn]);

  const checkOut = useCallback(() => {
    if (!canCheckOut || !todayRecord) return; 

    const checkOutTime = new Date();
    const finalMinutes = calculateWorkingMinutes(todayRecord.checkInTime, checkOutTime);

    setAttendanceHistory(prev => prev.map(record => {
      if (record.date === todayDateStr) {
        return {
          ...record,
          checkOutTime,
          totalMinutes: finalMinutes,
        };
      }
      return record;
    }));
  }, [canCheckOut, todayRecord, todayDateStr]);

  const contextValue = useMemo(() => ({
    attendanceHistory,
    todayRecord,
    currentStatus,
    canCheckIn,
    canCheckOut,
    workingMinutes,
    isAttendanceLoading,
    checkIn,
    checkOut,
  }), [
    attendanceHistory,
    todayRecord,
    currentStatus,
    canCheckIn,
    canCheckOut,
    workingMinutes,
    isAttendanceLoading,
    checkIn,
    checkOut,
  ]);

  return (
    <AttendanceContext.Provider value={contextValue}>
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendance() {
  const context = useContext(AttendanceContext);
  if (context === undefined) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
}