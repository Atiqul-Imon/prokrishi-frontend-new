"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { shareProduct, sharePage, isShareAvailable } from "@/app/utils/share";
import { triggerHaptic, HapticType } from "@/app/utils/haptics";

interface ShareButtonProps {
  productName?: string;
  productUrl?: string;
  title?: string;
  text?: string;
  className?: string;
  variant?: "icon" | "button";
}

export default function ShareButton({
  productName,
  productUrl,
  title,
  text,
  className = "",
  variant = "icon",
}: ShareButtonProps) {
  const [shared, setShared] = useState(false);

  const handleShare = async () => {
    triggerHaptic(HapticType.MEDIUM);

    let success = false;

    if (productName && productUrl) {
      success = await shareProduct(productName, productUrl);
    } else if (title) {
      success = await sharePage(title, text);
    }

    if (success) {
      triggerHaptic(HapticType.SUCCESS);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } else {
      triggerHaptic(HapticType.WARNING);
    }
  };

  if (!isShareAvailable() && !productUrl) {
    // Don't show if share is not available and no URL to copy
    return null;
  }

  if (variant === "button") {
    return (
      <button
        onClick={handleShare}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all touch-manipulation active:scale-95 min-h-[44px] ${
          shared
            ? "bg-green-100 text-green-700"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        } ${className}`}
        aria-label="Share"
      >
        {shared ? (
          <>
            <Check className="w-4 h-4" />
            <span>Shared!</span>
          </>
        ) : (
          <>
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleShare}
      className={`p-2 rounded-lg transition-all touch-manipulation active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center ${
        shared
          ? "bg-green-100 text-green-700"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      } ${className}`}
      aria-label="Share"
    >
      {shared ? (
        <Check className="w-5 h-5" />
      ) : (
        <Share2 className="w-5 h-5" />
      )}
    </button>
  );
}

