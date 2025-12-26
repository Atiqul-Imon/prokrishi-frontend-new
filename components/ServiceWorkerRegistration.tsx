"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    // Delay service worker registration to not block first load
    // Register after page is interactive
    const registerServiceWorker = () => {
      if (
        typeof window !== "undefined" &&
        "serviceWorker" in navigator &&
        process.env.NODE_ENV === "production"
      ) {
        // Register service worker
        navigator.serviceWorker
          .register("/sw.js", {
            scope: "/",
          })
          .then((registration) => {
            // Only log in development to avoid console noise
            if (process.env.NODE_ENV === "development") {
              console.log("Service Worker registered:", registration.scope);
            }

            // Check for updates every hour
            setInterval(() => {
              registration.update();
            }, 60 * 60 * 1000);

          // Handle updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (
                  newWorker.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  // New service worker available
                  console.log("New service worker available");
                  // Optionally show a notification to the user
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });

        // Handle service worker controller change
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          window.location.reload();
        });
      }
    };

    // Register after page is interactive (not blocking first load)
    if (document.readyState === "complete") {
      // Page already loaded, register immediately
      registerServiceWorker();
    } else {
      // Wait for page to be interactive before registering
      window.addEventListener("load", registerServiceWorker, { once: true });
    }
  }, []);

  return null;
}










