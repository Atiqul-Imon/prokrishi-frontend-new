/**
 * Enhanced Haptic Feedback Utility
 * Provides different vibration patterns for various user interactions
 */

export enum HapticType {
  LIGHT = 'light',
  MEDIUM = 'medium',
  HEAVY = 'heavy',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  SELECTION = 'selection',
  IMPACT = 'impact',
}

interface HapticPattern {
  duration: number | number[];
  intensity?: 'light' | 'medium' | 'heavy';
}

const HAPTIC_PATTERNS: Record<HapticType, HapticPattern> = {
  [HapticType.LIGHT]: { duration: 10, intensity: 'light' },
  [HapticType.MEDIUM]: { duration: 20, intensity: 'medium' },
  [HapticType.HEAVY]: { duration: 30, intensity: 'heavy' },
  [HapticType.SUCCESS]: { duration: [10, 50, 20], intensity: 'medium' },
  [HapticType.WARNING]: { duration: [20, 30, 20], intensity: 'medium' },
  [HapticType.ERROR]: { duration: [30, 50, 30, 50, 30], intensity: 'heavy' },
  [HapticType.SELECTION]: { duration: 5, intensity: 'light' },
  [HapticType.IMPACT]: { duration: 40, intensity: 'heavy' },
};

/**
 * Trigger haptic feedback with a specific pattern
 */
export function triggerHaptic(type: HapticType = HapticType.LIGHT): void {
  if (typeof window === 'undefined' || !('vibrate' in navigator)) {
    return;
  }

  const pattern = HAPTIC_PATTERNS[type];
  
  try {
    if (Array.isArray(pattern.duration)) {
      navigator.vibrate(pattern.duration);
    } else {
      navigator.vibrate(pattern.duration);
    }
  } catch (error) {
    // Silently fail if vibration is not supported or blocked
    console.debug('Haptic feedback not available:', error);
  }
}

/**
 * Check if haptic feedback is available
 */
export function isHapticAvailable(): boolean {
  return typeof window !== 'undefined' && 'vibrate' in navigator;
}









