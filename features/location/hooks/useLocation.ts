import { useState, useEffect, useCallback, useRef } from 'react';
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

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchLocation = useCallback(async () => {
    if (!isMounted.current) return;
    setIsLoading(true);
    setError(null);
    try {
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      if (isMounted.current) {
        setLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          accuracy: currentLocation.coords.accuracy,
          timestamp: currentLocation.timestamp,
        });
      }
    } catch (err) {
      if (isMounted.current) {
        setError('Unable to fetch location. Please check your GPS settings.');
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isMounted.current) return;
    setIsLoading(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (!isMounted.current) return;
      
      if (status === 'granted') {
        setPermissionGranted(true);
        await fetchLocation();
      } else {
        setPermissionGranted(false);
        setIsLoading(false);
      }
    } catch (err) {
      if (isMounted.current) {
        setError('Failed to request location permission.');
        setPermissionGranted(false);
        setIsLoading(false);
      }
    }
  }, [fetchLocation]);

  useEffect(() => {
    const initLocation = async () => {
      if (!isMounted.current) return;
      setIsLoading(true);
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (!isMounted.current) return;

        if (status === 'granted') {
          setPermissionGranted(true);
          await fetchLocation();
        } else {
          setPermissionGranted(false);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted.current) {
          setError('Failed to check location status.');
          setPermissionGranted(false);
          setIsLoading(false);
        }
      }
    };

    initLocation();
  }, [fetchLocation]);

  return {
    location,
    permissionGranted,
    isLoading,
    error,
    requestPermission,
    refreshLocation: fetchLocation,
  };
}