"use client";

import React from "react";
import { AlertCircle, X } from "lucide-react";

interface ErrorAlertProps {
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export function ErrorAlert({ message, onDismiss, className = "" }: ErrorAlertProps) {
  if (!message) return null;

  return (
    <div className={`bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 ${className}`}>
      <AlertCircle className="text-red-600 mt-0.5 flex-shrink-0" size={20} strokeWidth={2} />
      <div className="flex-1">
        <p className="text-sm font-medium text-red-900">Error</p>
        <p className="text-sm text-red-800 mt-1">{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-600 hover:text-red-800 transition-colors flex-shrink-0"
          aria-label="Dismiss error"
        >
          <X size={18} strokeWidth={2} />
        </button>
      )}
    </div>
  );
}







