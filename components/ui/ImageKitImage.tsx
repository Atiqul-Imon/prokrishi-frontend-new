"use client";

import React from "react";
import Image from "next/image";
import { getImageKitUrl, getProductImageUrl, getCategoryImageUrl, isValidImageUrl } from "@/app/utils/imagekit";
import type { ImageProps } from "next/image";

interface ImageKitImageProps extends Omit<ImageProps, 'src'> {
  src: string | null | undefined;
  /**
   * Image type for automatic optimization
   */
  imageType?: 'product' | 'category' | 'custom';
  /**
   * Size preset for automatic sizing
   */
  size?: 'thumbnail' | 'small' | 'medium' | 'large';
  /**
   * Custom width for transformation
   */
  width?: number;
  /**
   * Custom height for transformation
   */
  height?: number;
  /**
   * Quality (1-100, default based on size)
   */
  quality?: number;
  /**
   * Format (auto, webp, avif, jpg, png)
   */
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  /**
   * Fallback image URL if src is invalid
   */
  fallback?: string;
  /**
   * Show placeholder if image fails to load
   */
  showPlaceholder?: boolean;
}

/**
 * ImageKit-optimized Next.js Image component
 * Automatically transforms image URLs through ImageKit CDN for optimization
 */
export default function ImageKitImage({
  src,
  imageType = 'custom',
  size = 'medium',
  width,
  height,
  quality,
  format = 'auto',
  fallback,
  showPlaceholder = true,
  alt = '',
  className = '',
  ...props
}: ImageKitImageProps) {
  // Get optimized URL based on image type
  let optimizedSrc = '';

  if (isValidImageUrl(src)) {
    if (imageType === 'product') {
      optimizedSrc = getProductImageUrl(src, size);
    } else if (imageType === 'custom') {
      optimizedSrc = getImageKitUrl(src, {
        width,
        height,
        quality,
        format,
        crop: 'maintain_ratio',
        focus: 'auto',
      });
    } else if (imageType === 'category') {
      // Category images don't support 'thumbnail', use 'small' instead
      const categorySize = size === 'thumbnail' ? 'small' : size === 'large' ? 'large' : 'medium';
      optimizedSrc = getCategoryImageUrl(src, categorySize);
    } else {
      optimizedSrc = src as string;
    }
  } else if (fallback && isValidImageUrl(fallback)) {
    optimizedSrc = fallback;
  }

  // If no valid image, show placeholder
  if (!optimizedSrc && showPlaceholder) {
    return (
      <div
        className={`bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${className}`}
        style={{ width: width || '100%', height: height || '100%' }}
        {...(props as any)}
      >
        <span className="text-gray-400 text-xs">No Image</span>
      </div>
    );
  }

  if (!optimizedSrc) {
    return null;
  }

  // Use Next.js Image component with ImageKit URL
  return (
    <Image
      src={optimizedSrc}
      alt={alt}
      className={className}
      width={width}
      height={height}
      quality={quality || (size === 'thumbnail' ? 75 : size === 'small' ? 80 : size === 'medium' ? 85 : 90)}
      {...props}
    />
  );
}

