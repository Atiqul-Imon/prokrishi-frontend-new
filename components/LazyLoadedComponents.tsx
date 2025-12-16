"use client";

import dynamic from "next/dynamic";

// Lazy load non-critical components for better initial bundle size
const PerformanceMonitor = dynamic(() => import("./PerformanceMonitor"), {
  ssr: false,
});

const KeyboardNavigation = dynamic(() => import("./KeyboardNavigation"), {
  ssr: false,
});

const NetworkOptimizer = dynamic(() => import("./NetworkOptimizer"), {
  ssr: false,
});

const MemoryMonitor = dynamic(() => import("./MemoryMonitor"), {
  ssr: false,
});

export default function LazyLoadedComponents() {
  return (
    <>
      <PerformanceMonitor />
      <KeyboardNavigation />
      <NetworkOptimizer />
      <MemoryMonitor />
    </>
  );
}

