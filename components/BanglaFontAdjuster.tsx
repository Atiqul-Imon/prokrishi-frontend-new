"use client";

import { useEffect } from "react";

/**
 * Component that adjusts font size for elements containing Bangla text
 * to make them visually match English font size
 */
export default function BanglaFontAdjuster() {
  useEffect(() => {
    // Function to detect and adjust Bangla text
    const adjustBanglaText = () => {
      // Bangla Unicode range: U+0980-09FF
      const banglaRegex = /[\u0980-\u09FF]/;
      
      // Find all text nodes
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null
      );
      
      const processedElements = new Set<HTMLElement>();
      
      let node;
      while ((node = walker.nextNode())) {
        if (node.textContent && banglaRegex.test(node.textContent)) {
          // Found Bangla text, adjust parent element
          let parent = node.parentElement;
          while (parent && parent !== document.body) {
            // Skip if already processed or if it's a script/style tag
            if (
              processedElements.has(parent) ||
              parent.tagName === "SCRIPT" ||
              parent.tagName === "STYLE"
            ) {
              break;
            }
            
            // Check if element contains significant Bangla text
            const textContent = parent.textContent || "";
            const banglaChars = (textContent.match(/[\u0980-\u09FF]/g) || []).length;
            const totalChars = textContent.length;
            
            // If more than 30% Bangla characters, apply adjustment
            // Using 1em to match English size (no size increase)
            if (banglaChars > 0 && banglaChars / totalChars > 0.3) {
              if (!parent.classList.contains("bangla-adjusted")) {
                parent.classList.add("bangla-adjusted");
                processedElements.add(parent);
              }
            }
            
            parent = parent.parentElement;
          }
        }
      }
    };

    // Run adjustment after DOM is ready
    const timer = setTimeout(adjustBanglaText, 100);

    // Also run on DOM mutations (for dynamic content)
    const observer = new MutationObserver(() => {
      setTimeout(adjustBanglaText, 50);
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  return null;
}

