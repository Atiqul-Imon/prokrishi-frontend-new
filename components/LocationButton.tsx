"use client";

import { useState } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { getCurrentLocation, isGeolocationAvailable } from "@/app/utils/location";
import { triggerHaptic, HapticType } from "@/app/utils/haptics";

interface LocationButtonProps {
  onLocationReceived?: (location: { latitude: number; longitude: number }) => void;
  onError?: (error: string) => void;
  className?: string;
}

export default function LocationButton({
  onLocationReceived,
  onError,
  className = "",
}: LocationButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleGetLocation = async () => {
    if (!isGeolocationAvailable()) {
      const errorMsg = "Location services are not available on this device";
      if (onError) {
        onError(errorMsg);
      }
      return;
    }

    setLoading(true);
    triggerHaptic(HapticType.MEDIUM);

    try {
      const location = await getCurrentLocation({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      });

      triggerHaptic(HapticType.SUCCESS);

      if (onLocationReceived) {
        onLocationReceived({
          latitude: location.latitude,
          longitude: location.longitude,
        });
      }

      // Note: In a real app, you would reverse geocode the coordinates
      // to get the address. For now, we just return the coordinates.
    } catch (error: any) {
      triggerHaptic(HapticType.ERROR);
      
      let errorMessage = "Failed to get location";
      if (error.code === 1) {
        errorMessage = "Location permission denied";
      } else if (error.code === 2) {
        errorMessage = "Location unavailable";
      } else if (error.code === 3) {
        errorMessage = "Location request timeout";
      }

      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleGetLocation}
      disabled={loading || !isGeolocationAvailable()}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all touch-manipulation active:scale-95 min-h-[44px] ${
        loading || !isGeolocationAvailable()
          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
          : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
      } ${className}`}
      aria-label="Get current location"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Getting location...</span>
        </>
      ) : (
        <>
          <MapPin className="w-4 h-4" />
          <span>Use my location</span>
        </>
      )}
    </button>
  );
}

