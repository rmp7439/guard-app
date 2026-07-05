import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../features/auth/contexts/AuthContext';
import { AttendanceProvider } from '../features/attendance/contexts/AttendanceContext';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <AuthProvider>
        <AttendanceProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(guard)" />
          </Stack>
        </AttendanceProvider>
      </AuthProvider>
    </>
  );
}