"use client";

import { useEffect } from "react";

export default function ResourcePrefetcher() {
  useEffect(() => {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3501";
    
    // DNS prefetch for API
    const dnsPrefetch = document.createElement("link");
    dnsPrefetch.rel = "dns-prefetch";
    dnsPrefetch.href = apiBaseUrl;
    document.head.appendChild(dnsPrefetch);

    // Preconnect for faster API requests
    const preconnect = document.createElement("link");
    preconnect.rel = "preconnect";
    preconnect.href = apiBaseUrl;
    document.head.appendChild(preconnect);
  }, []);

  return null;
}







