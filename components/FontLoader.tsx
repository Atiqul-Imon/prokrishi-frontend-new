"use client";

import { useEffect } from "react";

export default function FontLoader() {
  useEffect(() => {
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

