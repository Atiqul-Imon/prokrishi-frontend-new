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

  // If already an ImageKit URL, add transformations if needed
  if (isImageKitUrl(sourceUrl)) {
    if (!transformations || Object.keys(transformations).length === 0) {
      return sourceUrl;
    }
    
    const transformationString = buildTransformationString(transformations);
    if (!transformationString) {
      return sourceUrl;
    }
    
    // If it's already ImageKit, we need to add transformations
    // Check if URL already has transformations
    if (sourceUrl.includes('/tr:')) {
      // Replace existing transformations
      // Format: https://ik.imagekit.io/6omjsz85o/tr:old-transformations/path
      const match = sourceUrl.match(/\/tr:([^/?]+)(.*)$/);
      if (match) {
        return sourceUrl.replace(`/tr:${match[1]}`, `/tr:${transformationString}`);
      }
    } else {
      // Add transformations to URL that doesn't have them
      // ImageKit URL format: https://ik.imagekit.io/{imagekit_id}/{path}
      // We need: https://ik.imagekit.io/{imagekit_id}/tr:{transformations}/{path}
      try {
        const urlObj = new URL(sourceUrl);
        // Extract the pathname (e.g., /6omjsz85o/prokrishi/categories/image.webp)
        const pathname = urlObj.pathname;
        
        // Find where the ImageKit ID ends and the actual image path begins
        // Path format: /{imagekit_id}/{image_path}
        // We need to insert /tr:{transformations} after the imagekit_id
        const pathParts = pathname.split('/').filter(p => p);
        
        if (pathParts.length >= 2) {
          // pathParts[0] is the ImageKit ID (e.g., "6omjsz85o")
          // pathParts[1+] is the image path (e.g., "prokrishi/categories/image.webp")
          const imagekitId = pathParts[0];
          const imagePath = '/' + pathParts.slice(1).join('/');
          const query = urlObj.search;
          
          // Build: https://ik.imagekit.io/{imagekit_id}/tr:{transformations}{image_path}?{query}
          return `${urlObj.origin}/${imagekitId}/tr:${transformationString}${imagePath}${query}`;
        } else {
          // Fallback: if we can't parse, just insert after origin
          return `${urlObj.origin}/tr:${transformationString}${pathname}${urlObj.search}`;
        }
      } catch (error) {
        // If URL parsing fails, return original
        console.warn('Failed to parse ImageKit URL:', sourceUrl, error);
        return sourceUrl;
      }
    }
  }

  // If ImageKit is not configured, return original URL
  if (!IMAGEKIT_URL_ENDPOINT) {
    return sourceUrl;
  }

  // Build ImageKit URL
  const transformationString = buildTransformationString(transformations);
  
  const baseUrl = IMAGEKIT_URL_ENDPOINT.endsWith('/') 
    ? IMAGEKIT_URL_ENDPOINT.slice(0, -1) 
    : IMAGEKIT_URL_ENDPOINT;
  
  // Handle external URLs (from backend/other sources)
  // ImageKit requires external URLs to be passed as ?url= parameter
  // Format: https://ik.imagekit.io/your_id/tr:w-300,h-200?url=https://external.com/image.jpg
  if (sourceUrl.startsWith('http://') || sourceUrl.startsWith('https://')) {
    // External URL - use ImageKit's URL transformation
    // Encode the external URL properly
    const encodedUrl = encodeURIComponent(sourceUrl);
    
    if (transformationString) {
      return `${baseUrl}/tr:${transformationString}?url=${encodedUrl}`;
    }
    return `${baseUrl}?url=${encodedUrl}`;
  }
  
  // Handle relative URLs or ImageKit-stored images
  // For images stored in ImageKit, use path-based transformation
  let imagePath = sourceUrl;
  if (sourceUrl.startsWith('/')) {
    imagePath = sourceUrl;
  } else {
    // If it's not a full URL and not starting with /, assume it's a path
    imagePath = '/' + sourceUrl;
  }
  
  // Build final ImageKit URL
  // Format: https://ik.imagekit.io/your_imagekit_id/tr:w-300,h-200/path/to/image.jpg
  if (transformationString) {
    return `${baseUrl}/tr:${transformationString}${imagePath}`;
  }
  
  return `${baseUrl}${imagePath}`;
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

        // Quality (default 75 for faster loading)
        const quality = transformations.quality ?? 75;
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
  // Optimized for speed: Lower quality = smaller file size = faster loading
  const sizes = {
    thumbnail: { width: 150, height: 150, quality: 70 }, // Reduced from 75
    small: { width: 300, height: 300, quality: 75 }, // Reduced from 80
    medium: { width: 600, height: 600, quality: 80 }, // Reduced from 85
    large: { width: 1200, height: 1200, quality: 85 }, // Reduced from 90
  };

  return getImageKitUrl(src, {
    ...sizes[size],
    format: 'auto', // WebP/AVIF for best compression
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
  // Optimized for speed: Lower quality = smaller file size = faster loading
  const sizes = {
    small: { width: 64, height: 64, quality: 70 }, // Reduced from 80
    medium: { width: 96, height: 96, quality: 75 }, // Reduced from 85
    large: { width: 128, height: 128, quality: 80 }, // Reduced from 90
  };

  return getImageKitUrl(src, {
    ...sizes[size],
    format: 'auto', // WebP/AVIF for best compression
    crop: 'maintain_ratio',
    focus: 'center',
  });
}

