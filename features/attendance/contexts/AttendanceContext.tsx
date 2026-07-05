import React, { createContext, useState, useContext, ReactNode } from 'react';
import { LocationData } from '../../location/hooks/useLocation';

type AttendanceStatus = 'checked_out' | 'checked_in';

interface AttendanceState {
  status: AttendanceStatus;
  checkInTime: Date | null;
  checkOutTime: Date | null;
  checkInLocation: LocationData | null;
  checkIn: (location: LocationData) => void;
  checkOut: () => void;
}

const AttendanceContext = createContext<AttendanceState | undefined>(undefined);

export function AttendanceProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AttendanceStatus>('checked_out');
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<Date | null>(null);
  const [checkInLocation, setCheckInLocation] = useState<LocationData | null>(null);

  const checkIn = (location: LocationData) => {
    setStatus('checked_in');
    setCheckInTime(new Date());
    setCheckOutTime(null);
    setCheckInLocation(location);
  };

  const checkOut = () => {
    setStatus('checked_out');
    setCheckOutTime(new Date());
  };

  return (
    <AttendanceContext.Provider 
      value={{ 
        status, 
        checkInTime, 
        checkOutTime, 
        checkInLocation, 
        checkIn, 
        checkOut 
      }}
    >
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