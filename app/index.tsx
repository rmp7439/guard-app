import { Redirect } from 'expo-router';
import { useAuth } from '../features/auth/contexts/AuthContext';

export default function Index() {
  const { isAuthenticated } = useAuth();

  // Act as the entry point gatekeeper.
  // Redirects the user based on their authentication status immediately upon app load.
  if (isAuthenticated) {
    return <Redirect href="/(guard)/home" />;
  }

  return <Redirect href="/(auth)/login" />;
}