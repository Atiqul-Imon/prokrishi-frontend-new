/**
 * Location Services Utility
 * Provides geolocation functionality for delivery and location-based features
 */

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface LocationError {
  code: number;
  message: string;
}

/**
 * Check if geolocation is available
 */
export function isGeolocationAvailable(): boolean {
  return typeof window !== 'undefined' && 'geolocation' in navigator;
}

/**
 * Get current user location
 */
export function getCurrentLocation(
  options?: PositionOptions
): Promise<LocationCoordinates> {
  return new Promise((resolve, reject) => {
    if (!isGeolocationAvailable()) {
      reject({
        code: 0,
        message: 'Geolocation is not supported by this browser',
      } as LocationError);
      return;
    }

    const defaultOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000, // Cache for 1 minute
      ...options,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        reject({
          code: error.code,
          message: error.message,
        } as LocationError);
      },
      defaultOptions
    );
  });
}

/**
 * Watch user location (continuous updates)
 */
export function watchLocation(
  callback: (location: LocationCoordinates) => void,
  errorCallback?: (error: LocationError) => void,
  options?: PositionOptions
): number | null {
  if (!isGeolocationAvailable()) {
    if (errorCallback) {
      errorCallback({
        code: 0,
        message: 'Geolocation is not supported by this browser',
      });
    }
    return null;
  }

  const defaultOptions: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 60000,
    ...options,
  };

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      callback({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      });
    },
    (error) => {
      if (errorCallback) {
        errorCallback({
          code: error.code,
          message: error.message,
        });
      }
    },
    defaultOptions
  );

  return watchId;
}

/**
 * Stop watching location
 */
export function clearLocationWatch(watchId: number): void {
  if (isGeolocationAvailable()) {
    navigator.geolocation.clearWatch(watchId);
  }
}









