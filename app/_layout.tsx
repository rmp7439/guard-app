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
          {/* Added fade animation for seamless enterprise-grade transitions between major flows */}
          <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="(guard)" options={{ animation: 'fade' }} />
          </Stack>
        </AttendanceProvider>
      </AuthProvider>
    </>
  );
}