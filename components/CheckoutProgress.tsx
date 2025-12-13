"use client";

import React from "react";
import { Check } from "lucide-react";

interface CheckoutProgressProps {
  currentStep: number;
  steps: string[];
}

export default function CheckoutProgress({
  currentStep,
  steps,
}: CheckoutProgressProps) {
  return (
    <div className="mb-6 md:mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isUpcoming = stepNumber > currentStep;

          return (
            <React.Fragment key={step}>
              {/* Step Circle */}
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-sm md:text-base transition-all duration-300 ${
                    isCompleted
                      ? "bg-emerald-600 text-white"
                      : isCurrent
                      ? "bg-emerald-600 text-white ring-4 ring-emerald-200"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 md:w-6 md:h-6" />
                  ) : (
                    stepNumber
                  )}
                </div>
                <span
                  className={`mt-2 text-xs md:text-sm font-medium text-center hidden sm:block ${
                    isCurrent
                      ? "text-emerald-700 font-semibold"
                      : isCompleted
                      ? "text-emerald-600"
                      : "text-gray-500"
                  }`}
                >
                  {step}
                </span>
                <span
                  className={`mt-2 text-xs font-medium text-center sm:hidden ${
                    isCurrent
                      ? "text-emerald-700 font-semibold"
                      : isCompleted
                      ? "text-emerald-600"
                      : "text-gray-500"
                  }`}
                >
                  {step.split(" ")[0]}
                </span>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 md:h-1 mx-2 transition-all duration-300 ${
                    isCompleted ? "bg-emerald-600" : "bg-gray-200"
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

