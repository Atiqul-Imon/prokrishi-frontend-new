"use client";

import { XCircle } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function PaymentFail() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8">
      <Card padding="lg" className="max-w-md w-full">
        <div className="text-center">
          <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            Payment Failed
          </h2>

          <p className="text-gray-600 mb-8">
            Your payment was not successful. Please try again or contact support if the problem persists.
          </p>

          <div className="space-y-3">
            <Link href="/checkout" className="block">
              <Button variant="primary" className="w-full">
                Try Again
              </Button>
            </Link>

            <Link href="/" className="block">
              <Button variant="outline" className="w-full">
                Continue Shopping
              </Button>
            </Link>

            <Link href="/account" className="block">
              <Button variant="ghost" className="w-full">
                View Orders
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}

