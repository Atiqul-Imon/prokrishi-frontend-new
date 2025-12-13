"use client";

import React, { useState, useRef, useEffect } from "react";
import { RefreshCw } from "lucide-react";

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
  threshold?: number; // Distance in pixels to trigger refresh
  disabled?: boolean;
}

export default function PullToRefresh({
  onRefresh,
  children,
  threshold = 80,
  disabled = false,
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canPull = useRef(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Only allow pull when at the top of the scroll
      if (container.scrollTop === 0 && !disabled) {
        setStartY(e.touches[0].clientY);
        canPull.current = true;
      } else {
        canPull.current = false;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!canPull.current || startY === null || isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const distance = currentY - startY;

      // Only allow downward pull
      if (distance > 0 && container.scrollTop === 0) {
        // Add resistance after threshold
        const resistance = distance > threshold ? 0.3 : 1;
        setPullDistance(Math.min(distance, threshold * 2) * resistance);
      }
    };

    const handleTouchEnd = async () => {
      if (!canPull.current || startY === null) return;

      if (pullDistance >= threshold && !isRefreshing) {
        setIsRefreshing(true);
        try {
          await onRefresh();
        } catch (error) {
          console.error("Refresh error:", error);
        } finally {
          setIsRefreshing(false);
          setPullDistance(0);
        }
      } else {
        // Snap back
        setPullDistance(0);
      }

      setStartY(null);
      canPull.current = false;
    };

    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: true });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [startY, pullDistance, threshold, isRefreshing, onRefresh, disabled]);

  const pullProgress = Math.min(pullDistance / threshold, 1);
  const shouldShowIndicator = pullDistance > 10 || isRefreshing;

  return (
    <div
      ref={containerRef}
      className="relative overflow-auto"
      style={{
        transform: `translateY(${pullDistance}px)`,
        transition: pullDistance === 0 ? "transform 0.3s ease-out" : "none",
      }}
    >
      {/* Pull to Refresh Indicator */}
      {shouldShowIndicator && (
        <div className="absolute top-0 left-0 right-0 flex items-center justify-center py-4 z-10">
          <div
            className="flex flex-col items-center gap-2"
            style={{
              opacity: pullProgress,
            }}
          >
            <RefreshCw
              className={`w-6 h-6 text-[var(--primary-green)] ${
                isRefreshing ? "animate-spin" : ""
              }`}
              style={{
                transform: `rotate(${pullProgress * 180}deg)`,
              }}
            />
            <span className="text-sm text-gray-600 font-medium">
              {isRefreshing ? "Refreshing..." : "Pull to refresh"}
            </span>
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{ paddingTop: shouldShowIndicator ? "80px" : "0" }}>
        {children}
      </div>
    </div>
  );
}

