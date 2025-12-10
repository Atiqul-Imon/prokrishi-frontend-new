"use client";

import React from "react";
import { Truck, Shield, Heart, Leaf, Target, Users } from "lucide-react";
import { Card } from "@/components/ui/Card";

export default function AboutPage() {
  const features = [
    {
      icon: Truck,
      title: "দোরগোড়ায় পৌঁছে দেওয়া",
      description: "হেলদি ও সেফ ফুড আপনার দোরগোড়ায় পৌঁছে দেওয়া",
      color: "green",
    },
    {
      icon: Shield,
      title: "নিরাপদ খাদ্য",
      description: "বিষমুক্ত ও কেমিক্যাল ফ্রি পণ্য সরাসরি উৎস থেকে",
      color: "amber",
    },
    {
      icon: Heart,
      title: "স্বাস্থ্য অগ্রাধিকার",
      description: "মানুষের স্বাস্থ্য আমাদের সর্বোচ্চ অগ্রাধিকার",
      color: "green",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[var(--primary-green)] via-green-600 to-[var(--primary-green)] text-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            আমাদের সম্পর্কে
          </h1>
          <p className="max-w-3xl mx-auto text-lg md:text-xl text-green-50 leading-relaxed">
            প্রোকৃষি একটি ই-কমার্স প্রতিষ্ঠান। আমরা মানুষের দোরগোড়ায় হেলদি ও সেফ ফুড পৌঁছে দিই।
          </p>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card padding="lg" variant="elevated" className="mb-8">
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 mb-6 leading-relaxed text-base md:text-lg">
                নদীর মাছ, হাওর-বাওর ও কাপ্তাই লেকের মাছ, সামুদ্রিক মাছ, লাল আটা, লাল চিনি, বিষমুক্ত সবজি ও মৌসুমী ফল সুন্দরবনের মধু, ঘি, শ্রীমঙ্গলের চা ও গ্রিন টি, কেমিক্যাল ফ্রি চাল ও খেজুরের গুড় পাটালি প্রোকৃষি সরাসরি উৎস থেকে সংগ্রহ করে। মানুষের স্বাস্থ্য আমাদের অগ্রাধিকার।
              </p>
              
              <p className="text-gray-700 mb-6 leading-relaxed text-base md:text-lg">
                আমরা শুধু পণ্য বিক্রি করি না — মানুষকে নিরাপদ ও সচেতন খাদ্যাভ্যাস গড়ে তুলতে উৎসাহিত করি, সচেতন করি। কারণ ভেজাল খাবারের কারণেই ক্যান্সার, হৃদরোগ, ডায়বেটিস, কিডনি ও লিভারের জটিল রোগসহ অসংক্রামক নানা রোগ মহামারির আকার ধারণ করেছে।
              </p>

              <div className="bg-gradient-to-r from-green-50 to-amber-50 border-l-4 border-[var(--primary-green)] p-6 my-8 rounded-r-xl shadow-sm">
                <p className="text-gray-800 font-semibold text-lg mb-2">
                  প্রোকৃষি বিশ্বাস করে,
                </p>
                <p className="text-gray-900 text-2xl md:text-3xl font-bold italic">
                  "সুস্থ মানুষই শক্তিশালী সমাজ গড়ে তোলে।"
                </p>
              </div>

              <p className="text-gray-700 mb-6 leading-relaxed text-base md:text-lg">
                তাই আমাদের এই উদ্যোগটিই হলো পুষ্টিকর ও নিরাপদ খাদ্য পৌঁছে দেওয়ার মাধ্যম হেলদি বাংলাদেশ গড়ে তোলা।
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              আমাদের সেবা
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              আমরা যা অফার করি
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const colorClasses = {
                green: "bg-green-100 text-[var(--primary-green)]",
                amber: "bg-amber-100 text-[var(--primary-amber)]",
              };
              
              return (
                <Card
                  key={index}
                  padding="lg"
                  variant="elevated"
                  className="text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`w-16 h-16 ${colorClasses[feature.color as keyof typeof colorClasses]} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-xl mb-3 text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card padding="lg" variant="elevated" className="bg-white/80 backdrop-blur-sm">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[var(--primary-green)] to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Target className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                আমাদের লক্ষ্য
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed max-w-2xl mx-auto">
                হেলদি বাংলাদেশ গড়ে তোলা — পুষ্টিকর ও নিরাপদ খাদ্য প্রতিটি মানুষের দোরগোড়ায় পৌঁছে দেওয়া।
              </p>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}

