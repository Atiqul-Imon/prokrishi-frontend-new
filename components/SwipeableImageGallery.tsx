"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SwipeableImageGalleryProps {
  images: string[];
  alt: string;
  className?: string;
}

export default function SwipeableImageGallery({
  images,
  alt,
  className = "",
}: SwipeableImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  // Minimum swipe distance (in pixels)
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    if (isZoomed) return; // Don't handle swipe when zoomed
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (isZoomed) return;
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || isZoomed) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
    if (isRightSwipe && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleImageClick = () => {
    if (window.innerWidth <= 768) {
      // Toggle zoom on mobile
      setIsZoomed(!isZoomed);
    }
  };

  // Reset zoom when image changes
  useEffect(() => {
    setIsZoomed(false);
  }, [currentIndex]);

  if (images.length === 0) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Main Image Container */}
      <div
        ref={imageRef}
        className="relative aspect-square w-full bg-gray-100 overflow-hidden rounded-lg touch-pan-y"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="flex transition-transform duration-300 ease-out h-full"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
        >
          {images.map((img, idx) => (
            <div
              key={idx}
              className="min-w-full h-full relative flex-shrink-0"
            >
              <Image
                src={img}
                alt={`${alt} ${idx + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className={`object-cover transition-transform duration-300 ${
                  isZoomed && idx === currentIndex
                    ? "scale-150 cursor-zoom-out"
                    : "cursor-zoom-in"
                }`}
                onClick={handleImageClick}
                draggable={false}
                priority={idx === 0}
                loading={idx === 0 ? "eager" : "lazy"}
              />
            </div>
          ))}
        </div>

        {/* Navigation Arrows - Desktop Only */}
        {images.length > 1 && (
          <>
            {currentIndex > 0 && (
              <button
                onClick={goToPrevious}
                className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full items-center justify-center shadow-lg transition-all z-10 touch-manipulation active:scale-95"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5 text-gray-900" />
              </button>
            )}
            {currentIndex < images.length - 1 && (
              <button
                onClick={goToNext}
                className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full items-center justify-center shadow-lg transition-all z-10 touch-manipulation active:scale-95"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5 text-gray-900" />
              </button>
            )}
          </>
        )}

        {/* Image Indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all touch-manipulation ${
                  idx === currentIndex
                    ? "w-6 bg-white"
                    : "w-2 bg-white/50 hover:bg-white/75"
                }`}
                aria-label={`Go to image ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Swipe Hint - Show on first load for mobile */}
        {images.length > 1 && currentIndex === 0 && (
          <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded-md md:hidden">
            Swipe to view more
          </div>
        )}
      </div>

      {/* Thumbnail Navigation */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mt-4 scrollbar-hide">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden transition-all touch-manipulation active:scale-95 ${
                currentIndex === idx
                  ? "ring-2 ring-emerald-600 ring-offset-2"
                  : "hover:ring-2 hover:ring-emerald-300 opacity-75 hover:opacity-100"
              }`}
              aria-label={`View image ${idx + 1}`}
            >
              <Image
                src={img}
                alt={`${alt} thumbnail ${idx + 1}`}
                fill
                sizes="80px"
                className="object-cover"
                draggable={false}
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

