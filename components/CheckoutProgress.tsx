"use client";

import React from "react";
import { Check, MapPin, User, Eye } from "lucide-react";

interface CheckoutProgressProps {
  currentStep: number;
  steps: string[];
}

const stepIcons = [MapPin, User, Eye];

export default function CheckoutProgress({
  currentStep,
  steps,
}: CheckoutProgressProps) {
  return (
    <div className="mb-8 md:mb-10">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isUpcoming = stepNumber > currentStep;
          const Icon = stepIcons[index] || MapPin;

          return (
            <React.Fragment key={step}>
              {/* Step Circle */}
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`relative w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center font-bold text-sm md:text-base transition-all duration-300 shadow-md ${
                    isCompleted
                      ? "bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-emerald-200"
                      : isCurrent
                      ? "bg-gradient-to-br from-emerald-600 to-emerald-700 text-white ring-4 ring-emerald-200 ring-offset-2 shadow-lg scale-110"
                      : "bg-gradient-to-br from-gray-200 to-gray-300 text-gray-500"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-6 h-6 md:w-7 md:h-7" />
                  ) : isCurrent ? (
                    <Icon className="w-6 h-6 md:w-7 md:h-7" />
                  ) : (
                    <Icon className="w-5 h-5 md:w-6 md:h-6 opacity-60" />
                  )}
                </div>
                <span
                  className={`mt-3 text-xs md:text-sm font-semibold text-center hidden sm:block transition-colors duration-200 ${
                    isCurrent
                      ? "text-emerald-700 font-bold"
                      : isCompleted
                      ? "text-emerald-600"
                      : "text-gray-500"
                  }`}
                >
                  {step}
                </span>
                <span
                  className={`mt-3 text-xs font-semibold text-center sm:hidden transition-colors duration-200 ${
                    isCurrent
                      ? "text-emerald-700 font-bold"
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
                <div className="flex-1 mx-3 md:mx-4 relative">
                  <div className="h-1 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ease-out ${
                        isCompleted
                          ? "bg-gradient-to-r from-emerald-600 to-emerald-700 w-full"
                          : "bg-gray-200 w-0"
                      }`}
                      style={{
                        width: isCompleted ? "100%" : "0%",
                        transitionDelay: isCompleted ? `${index * 100}ms` : "0ms",
                      }}
                    />
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}




