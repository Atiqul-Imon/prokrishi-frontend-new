"use client";

import React from "react";
import Link from "next/link";

/**
 * Skip links for keyboard navigation accessibility
 * Allows users to skip to main content, navigation, etc.
 */
export function SkipLinks() {
  return (
    <div className="sr-only focus-within:not-sr-only focus-within:absolute focus-within:z-50 focus-within:top-4 focus-within:left-4 focus-within:bg-white focus-within:p-4 focus-within:rounded-lg focus-within:shadow-lg">
      <nav aria-label="Skip links">
        <ul className="flex flex-col gap-2">
          <li>
            <Link
              href="#main-content"
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              Skip to main content
            </Link>
          </li>
          <li>
            <Link
              href="#main-navigation"
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              Skip to navigation
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

