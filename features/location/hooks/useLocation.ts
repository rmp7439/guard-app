import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  timestamp: number;
}

interface UseLocationResult {
  location: LocationData | null;
  permissionGranted: boolean | null;
  isLoading: boolean;
  error: string | null;
  requestPermission: () => Promise<void>;
  refreshLocation: () => Promise<void>;
}

export function useLocation(): UseLocationResult {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocation = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        accuracy: currentLocation.coords.accuracy,
        timestamp: currentLocation.timestamp,
      });
    } catch (err) {
      setError('Unable to fetch location. Please check your GPS settings.');
    } finally {
      setIsLoading(false);
    }
  };

  const requestPermission = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setPermissionGranted(true);
        // Automatically fetch location immediately upon granting permission
        await fetchLocation(); 
      } else {
        setPermissionGranted(false);
        setIsLoading(false);
      }
    } catch (err) {
      setError('Failed to request location permission.');
      setPermissionGranted(false);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const initLocation = async () => {
      setIsLoading(true);
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status === 'granted') {
          setPermissionGranted(true);
          await fetchLocation();
        } else {
          setPermissionGranted(false);
          setIsLoading(false);
        }
      } catch (err) {
        setError('Failed to check location status.');
        setPermissionGranted(false);
        setIsLoading(false);
      }
    };

    initLocation();
  }, []);

  return {
    location,
    permissionGranted,
    isLoading,
    error,
    requestPermission,
    refreshLocation: fetchLocation,
  };
}