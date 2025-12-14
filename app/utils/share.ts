/**
 * Web Share API Utility
 * Provides native sharing functionality for mobile devices
 */

export interface ShareData {
  title?: string;
  text?: string;
  url?: string;
  files?: File[];
}

/**
 * Check if Web Share API is available
 */
export function isShareAvailable(): boolean {
  return typeof window !== 'undefined' && 'share' in navigator;
}

/**
 * Share content using Web Share API
 */
export async function shareContent(data: ShareData): Promise<boolean> {
  if (!isShareAvailable()) {
    // Fallback: copy to clipboard
    if (data.url) {
      try {
        await navigator.clipboard.writeText(data.url);
        return true;
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        return false;
      }
    }
    return false;
  }

  try {
    await navigator.share(data);
    return true;
  } catch (error: any) {
    // User cancelled or error occurred
    if (error.name === 'AbortError') {
      // User cancelled - not an error
      return false;
    }
    console.error('Share failed:', error);
    return false;
  }
}

/**
 * Share a product
 */
export async function shareProduct(
  productName: string,
  productUrl: string,
  productImage?: string
): Promise<boolean> {
  const shareData: ShareData = {
    title: `Check out ${productName} on Prokrishi`,
    text: `I found this great product: ${productName}`,
    url: productUrl,
  };

  return shareContent(shareData);
}

/**
 * Share the current page
 */
export async function sharePage(
  title: string,
  text?: string
): Promise<boolean> {
  const shareData: ShareData = {
    title,
    text: text || title,
    url: window.location.href,
  };

  return shareContent(shareData);
}




