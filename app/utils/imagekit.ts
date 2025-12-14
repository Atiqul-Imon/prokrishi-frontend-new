/**
 * ImageKit CDN Utility
 * Handles image URL transformation and optimization using ImageKit CDN
 */

// ImageKit configuration
const IMAGEKIT_URL_ENDPOINT = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || '';
const IMAGEKIT_PUBLIC_KEY = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || '';
const IMAGEKIT_TRANSFORMATION_POSITION = 'path'; // 'path' or 'query'

/**
 * Check if a URL is already an ImageKit URL
 */
export function isImageKitUrl(url: string): boolean {
  if (!url) return false;
  return url.includes('ik.imagekit.io') || url.includes('imagekit.io');
}

/**
 * Check if a URL is a valid image URL (not a placeholder or empty)
 */
export function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  if (url.trim() === '') return false;
  if (url.startsWith('data:')) return true; // Data URLs are valid
  if (url.startsWith('http://') || url.startsWith('https://')) return true;
  if (url.startsWith('/')) return true; // Relative URLs are valid
  return false;
}

/**
 * Get ImageKit transformation URL
 * @param src - Original image URL
 * @param transformations - ImageKit transformation parameters
 * @returns Transformed ImageKit URL
 */
export function getImageKitUrl(
  src: string | null | undefined,
  transformations?: {
    width?: number;
    height?: number;
    quality?: number; // 1-100, default 80
    format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
    crop?: 'maintain_ratio' | 'at_max' | 'at_least' | 'force';
    focus?: 'auto' | 'center' | 'top' | 'left' | 'bottom' | 'right' | 'top_left' | 'top_right' | 'bottom_left' | 'bottom_right';
    blur?: number; // 1-100
    brightness?: number; // -100 to 100
    contrast?: number; // -100 to 100
    saturation?: number; // -100 to 100
    [key: string]: string | number | undefined;
  }
): string {
  // Return empty string or placeholder if no valid source
  if (!isValidImageUrl(src)) {
    return '';
  }

  const sourceUrl = src as string;

  // If already an ImageKit URL, return as is (or add transformations if needed)
  if (isImageKitUrl(sourceUrl)) {
    if (!transformations || Object.keys(transformations).length === 0) {
      return sourceUrl;
    }
    // If it's already ImageKit, we can append transformations
    return appendImageKitTransformations(sourceUrl, transformations);
  }

  // If ImageKit is not configured, return original URL
  if (!IMAGEKIT_URL_ENDPOINT) {
    return sourceUrl;
  }

  // Build ImageKit URL
  const transformationString = buildTransformationString(transformations);
  
  // If source is a relative URL, make it absolute
  let imagePath = sourceUrl;
  if (sourceUrl.startsWith('/')) {
    // For relative URLs, we need the full path
    imagePath = sourceUrl;
  } else if (sourceUrl.startsWith('http://') || sourceUrl.startsWith('https://')) {
    // For absolute URLs, extract the path or use as external source
    try {
      const url = new URL(sourceUrl);
      imagePath = url.pathname + url.search;
    } catch {
      // If URL parsing fails, use as external source
      imagePath = sourceUrl;
    }
  }

  // Build final ImageKit URL
  // Format: https://ik.imagekit.io/your_imagekit_id/tr:w-300,h-200/path/to/image.jpg
  const baseUrl = IMAGEKIT_URL_ENDPOINT.endsWith('/') 
    ? IMAGEKIT_URL_ENDPOINT.slice(0, -1) 
    : IMAGEKIT_URL_ENDPOINT;
  
  if (transformationString) {
    return `${baseUrl}/tr:${transformationString}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  }
  
  return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
}

/**
 * Build transformation string from parameters
 */
function buildTransformationString(transformations?: Record<string, string | number | undefined>): string {
  if (!transformations || Object.keys(transformations).length === 0) {
    return '';
  }

  const params: string[] = [];

  // Width and height
  if (transformations.width) {
    params.push(`w-${transformations.width}`);
  }
  if (transformations.height) {
    params.push(`h-${transformations.height}`);
  }

  // Quality (default 80 for web)
  const quality = transformations.quality ?? 80;
  if (quality !== 100) {
    params.push(`q-${quality}`);
  }

  // Format
  if (transformations.format && transformations.format !== 'auto') {
    params.push(`f-${transformations.format}`);
  } else if (transformations.format === 'auto') {
    params.push('f-auto'); // Auto format (WebP/AVIF based on browser support)
  }

  // Crop mode
  if (transformations.crop) {
    params.push(`c-${transformations.crop}`);
  }

  // Focus point
  if (transformations.focus && transformations.focus !== 'auto') {
    params.push(`fo-${transformations.focus}`);
  }

  // Image adjustments
  if (transformations.blur) {
    params.push(`bl-${transformations.blur}`);
  }
  if (transformations.brightness !== undefined) {
    params.push(`b-${transformations.brightness}`);
  }
  if (transformations.contrast !== undefined) {
    params.push(`e-contrast-${transformations.contrast}`);
  }
  if (transformations.saturation !== undefined) {
    params.push(`e-saturation-${transformations.saturation}`);
  }

  return params.join(',');
}

/**
 * Append transformations to existing ImageKit URL
 */
function appendImageKitTransformations(
  url: string,
  transformations: Record<string, string | number | undefined>
): string {
  const transformationString = buildTransformationString(transformations);
  if (!transformationString) return url;

  // Check if URL already has transformations
  if (url.includes('/tr:')) {
    // Extract existing transformations and path
    const match = url.match(/\/tr:([^/]+)(\/.+)$/);
    if (match) {
      const existingTransformations = match[1];
      const path = match[2];
      // Merge transformations (new ones take precedence)
      return url.replace(`/tr:${existingTransformations}`, `/tr:${transformationString}`);
    }
  }

  // Insert transformations before the path
  const urlObj = new URL(url);
  const path = urlObj.pathname;
  const baseUrl = urlObj.origin;
  
  return `${baseUrl}/tr:${transformationString}${path}`;
}

/**
 * Get responsive image srcSet for ImageKit
 */
export function getImageKitSrcSet(
  src: string | null | undefined,
  sizes: number[],
  transformations?: Omit<Parameters<typeof getImageKitUrl>[1], 'width'>
): string {
  if (!isValidImageUrl(src)) return '';

  return sizes
    .map((width) => {
      const url = getImageKitUrl(src, { ...transformations, width });
      return `${url} ${width}w`;
    })
    .join(', ');
}

/**
 * Get optimized image URL for product thumbnails
 */
export function getProductImageUrl(
  src: string | null | undefined,
  size: 'thumbnail' | 'small' | 'medium' | 'large' = 'medium'
): string {
  const sizes = {
    thumbnail: { width: 150, height: 150, quality: 75 },
    small: { width: 300, height: 300, quality: 80 },
    medium: { width: 600, height: 600, quality: 85 },
    large: { width: 1200, height: 1200, quality: 90 },
  };

  return getImageKitUrl(src, {
    ...sizes[size],
    format: 'auto',
    crop: 'maintain_ratio',
    focus: 'auto',
  });
}

/**
 * Get optimized image URL for category icons
 */
export function getCategoryImageUrl(
  src: string | null | undefined,
  size: 'small' | 'medium' | 'large' = 'medium'
): string {
  const sizes = {
    small: { width: 64, height: 64, quality: 80 },
    medium: { width: 96, height: 96, quality: 85 },
    large: { width: 128, height: 128, quality: 90 },
  };

  return getImageKitUrl(src, {
    ...sizes[size],
    format: 'auto',
    crop: 'maintain_ratio',
    focus: 'center',
  });
}

