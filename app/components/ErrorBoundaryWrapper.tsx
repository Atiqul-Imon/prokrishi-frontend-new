"use client";

import { ErrorBoundary } from "./ErrorBoundary";
import type { ReactNode } from "react";

interface ErrorBoundaryWrapperProps {
  children: ReactNode;
}

/**
 * Client component wrapper for ErrorBoundary
 * Use this in server components where ErrorBoundary is needed
 */
export function ErrorBoundaryWrapper({ children }: ErrorBoundaryWrapperProps) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}









