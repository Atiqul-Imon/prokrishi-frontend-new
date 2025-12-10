"use client";

import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function PaymentSuccess() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8">
      <Card padding="lg" className="max-w-md w-full">
        <div className="text-center">
          <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            Payment Successful!
          </h2>

          <p className="text-gray-600 mb-8">
            Your payment was successful! Your order has been confirmed and will be processed shortly.
          </p>

          <div className="space-y-3">
            <Link href="/" className="block">
              <Button variant="primary" className="w-full">
                Continue Shopping
              </Button>
            </Link>

            <Link href="/account" className="block">
              <Button variant="outline" className="w-full">
                View Orders
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}

