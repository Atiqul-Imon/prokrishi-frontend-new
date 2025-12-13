"use client";

import { useEffect } from "react";

export default function FontLoader() {
  useEffect(() => {
    // Preconnect to Google Fonts for faster loading
    const preconnect = document.createElement("link");
    preconnect.rel = "preconnect";
    preconnect.href = "https://fonts.googleapis.com";
    document.head.appendChild(preconnect);

    const preconnect2 = document.createElement("link");
    preconnect2.rel = "preconnect";
    preconnect2.href = "https://fonts.gstatic.com";
    preconnect2.crossOrigin = "anonymous";
    document.head.appendChild(preconnect2);

    // Preload font stylesheet
    const preload = document.createElement("link");
    preload.rel = "preload";
    preload.href = "https://fonts.googleapis.com/css2?family=Kalpurush:wght@400;700&display=swap";
    preload.as = "style";
    document.head.appendChild(preload);

    // Check if the font link already exists
    const existingLink = document.querySelector(
      'link[href*="Kalpurush"]'
    );
    
    if (!existingLink) {
      const link = document.createElement("link");
      link.href =
        "https://fonts.googleapis.com/css2?family=Kalpurush:wght@400;700&display=swap";
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
  }, []);

  return null;
}

