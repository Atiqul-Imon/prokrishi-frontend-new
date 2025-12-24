"use client";

import { useEffect, useState } from "react";
import { getNetworkInfo, isSlowConnection, isDataSaverEnabled, onNetworkChange } from "@/app/utils/network";
import { analytics } from "@/app/utils/analytics";

/**
 * Network Optimizer Component
 * Optimizes experience based on network conditions
 */
export default function NetworkOptimizer() {
  const [networkInfo, setNetworkInfo] = useState(getNetworkInfo());
  const [isSlow, setIsSlow] = useState(isSlowConnection());
  const [saveData, setSaveData] = useState(isDataSaverEnabled());

  useEffect(() => {
    // Track initial network state
    if (networkInfo) {
      analytics.track('network_info', {
        effectiveType: networkInfo.effectiveType,
        downlink: networkInfo.downlink,
        rtt: networkInfo.rtt,
        saveData: networkInfo.saveData,
      });
    }

    // Monitor network changes
    const cleanup = onNetworkChange((info) => {
      setNetworkInfo(info);
      setIsSlow(isSlowConnection());
      setSaveData(isDataSaverEnabled());

      if (info) {
        analytics.track('network_change', {
          effectiveType: info.effectiveType,
          downlink: info.downlink,
          rtt: info.rtt,
        });
      }
    });

    // Apply optimizations for slow connections
    if (isSlow || saveData) {
      // Disable animations for slow connections
      document.documentElement.style.setProperty('--animation-duration', '0s');
      
      // Reduce image quality hints (if implemented)
      document.documentElement.setAttribute('data-slow-connection', 'true');
    }

    return () => {
      cleanup();
      document.documentElement.style.removeProperty('--animation-duration');
      document.documentElement.removeAttribute('data-slow-connection');
    };
  }, [isSlow, saveData, networkInfo]);

  // Apply data saver optimizations
  useEffect(() => {
    if (saveData) {
      // Disable non-essential features
      document.documentElement.setAttribute('data-save-data', 'true');
      
      // Reduce image loading
      const images = document.querySelectorAll('img[data-lazy]');
      images.forEach((img) => {
        (img as HTMLImageElement).loading = 'lazy';
      });
    } else {
      document.documentElement.removeAttribute('data-save-data');
    }
  }, [saveData]);

  return null;
}









