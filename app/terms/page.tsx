"use client";

import { Shield, Package, Truck, CreditCard, RotateCcw, AlertTriangle, Lock, FileText } from "lucide-react";
import { Card } from "@/components/ui/Card";

const TermsPage = () => {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-amber-50 py-16 md:py-24">
        <div className="w-full mx-auto px-4 text-center xl:max-w-[90%] 2xl:max-w-[70%]">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            Terms and Conditions
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Prokrishi service terms and conditions
          </p>
        </div>
      </section>

      {/* Terms Content Section */}
      <section className="py-12 md:py-16">
        <div className="w-full mx-auto px-4 max-w-4xl xl:max-w-[90%] 2xl:max-w-[70%]">
          <div className="space-y-6">
            {/* Product Quality */}
            <Card padding="lg" variant="elevated" className="border-l-4 border-green-500">
              <div className="flex items-start gap-4">
                <Package className="h-8 w-8 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-3">
                    Product Quality
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    Prokrishi is committed to providing safe and chemical-free food products. Products may have slight variations in size, color, or taste due to natural characteristics.
                  </p>
                </div>
              </div>
            </Card>

            {/* Order & Delivery */}
            <Card padding="lg" variant="elevated" className="border-l-4 border-blue-500">
              <div className="flex items-start gap-4">
                <Truck className="h-8 w-8 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-3">
                    Order & Delivery
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    Orders will be delivered within the specified timeframe after confirmation. Delays may occur due to natural disasters or transportation issues.
                  </p>
                </div>
              </div>
            </Card>

            {/* Payment */}
            <Card padding="lg" variant="elevated" className="border-l-4 border-purple-500">
              <div className="flex items-start gap-4">
                <CreditCard className="h-8 w-8 text-purple-600 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-3">
                    Payment
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    Payment can be made via Cash on Delivery (COD) only. We accept cash payment upon delivery of your order.
                  </p>
                </div>
              </div>
            </Card>

            {/* Return & Refund */}
            <Card padding="lg" variant="elevated" className="border-l-4 border-orange-500">
              <div className="flex items-start gap-4">
                <RotateCcw className="h-8 w-8 text-orange-600 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-3">
                    Return & Refund
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    If products are damaged, expired, or incorrect, please notify us within 24 hours for replacement or refund.
                  </p>
                </div>
              </div>
            </Card>

            {/* Liability Limitation */}
            <Card padding="lg" variant="elevated" className="border-l-4 border-red-500">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-8 w-8 text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-3">
                    Liability Limitation
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    Prokrishi is not responsible for any damage or loss after product delivery due to storage or usage.
                  </p>
                </div>
              </div>
            </Card>

            {/* User Information & Privacy */}
            <Card padding="lg" variant="elevated" className="border-l-4 border-indigo-500">
              <div className="flex items-start gap-4">
                <Lock className="h-8 w-8 text-indigo-600 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-3">
                    User Information & Privacy
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    Customer personal information (address, phone number, payment details) will only be used for delivery and service improvement. It will not be shared with any third party.
                  </p>
                </div>
              </div>
            </Card>

            {/* Policy Changes */}
            <Card padding="lg" variant="elevated" className="border-l-4 border-gray-500">
              <div className="flex items-start gap-4">
                <FileText className="h-8 w-8 text-gray-600 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-3">
                    Policy Changes
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    Prokrishi reserves the right to change policies at any time. Updated policies will be effective immediately upon publication on the website.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-gradient-to-br from-green-50 to-amber-50 py-12 md:py-16">
        <div className="w-full mx-auto px-4 max-w-4xl text-center xl:max-w-[90%] 2xl:max-w-[70%]">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            Need Help or Have Questions?
          </h2>
          <p className="text-gray-600 mb-6">
            Contact us for assistance
          </p>
          <a
            href="/contact"
            className="inline-block bg-[var(--primary-green)] text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Contact Us
          </a>
        </div>
      </section>
    </div>
  );
};

export default TermsPage;

