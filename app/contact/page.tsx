"use client";

import React, { useState } from "react";
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setStatus({ type: null, message: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: null, message: "" });

    // Simulate form submission
    setTimeout(() => {
      setStatus({
        type: "success",
        message: "আপনার বার্তা সফলভাবে পাঠানো হয়েছে! আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।",
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
      setIsSubmitting(false);
    }, 1500);
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "আমাদের ঠিকানা",
      details: [
        "প্রোকৃষি হাব",
        "২৬১/এফ/১, পূর্ব নাখালপাড়া",
        "তেজগাঁও, ঢাকা ১২১৫",
      ],
      color: "green",
    },
    {
      icon: Phone,
      title: "ফোন",
      details: [
        <a
          key="phone"
          href="tel:+8801748027775"
          className="text-[var(--primary-green)] hover:text-green-700 font-semibold transition-colors"
        >
          +880 1748-027775
        </a>,
      ],
      color: "amber",
    },
    {
      icon: Mail,
      title: "ই-মেইল",
      details: [
        <a
          key="email"
          href="mailto:prokrishi2025@gmail.com"
          className="text-[var(--primary-green)] hover:text-green-700 font-semibold transition-colors"
        >
          prokrishi2025@gmail.com
        </a>,
      ],
      color: "green",
    },
    {
      icon: Clock,
      title: "সাপোর্ট সময়",
      details: ["সকাল ৯টা – রাত ৯টা"],
      color: "amber",
    },
  ];

  return (
    <div className="min-h-screen bg-white py-8 md:py-12">
      <div className="w-full mx-auto px-4 xl:max-w-[90%] 2xl:max-w-[70%]">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            যোগাযোগ করুন
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-600">
            আমরা এখানে সাহায্য করতে! আমাদের পণ্য সম্পর্কে আপনার কোন প্রশ্ন থাকলে বা অর্ডারে সহায়তার প্রয়োজন হলে, অনুগ্রহ করে আমাদের সাথে যোগাযোগ করুন।
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
          {/* Contact Information */}
          <div className="space-y-6">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              const colorClasses = {
                green: "bg-green-100 text-[var(--primary-green)]",
                amber: "bg-amber-100 text-[var(--primary-amber)]",
              };

              return (
                <Card
                  key={index}
                  padding="lg"
                  variant="elevated"
                  className="hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 ${colorClasses[info.color as keyof typeof colorClasses]} rounded-xl flex items-center justify-center flex-shrink-0 shadow-md`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {info.title}
                      </h3>
                      <div className="space-y-1">
                        {info.details.map((detail, idx) => (
                          <p key={idx} className="text-gray-600">
                            {detail}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Contact Form */}
          <Card padding="lg" variant="elevated" className="bg-white">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">আমাদের বার্তা পাঠান</h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  আপনার নাম <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="আপনার পুরো নাম"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  ই-মেইল ঠিকানা <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                  বিষয় <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="বার্তার বিষয়"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                  বার্তা <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="আপনার বার্তা এখানে লিখুন..."
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)] focus:bg-white text-sm transition-all resize-none"
                />
              </div>

              {status.type && (
                <div
                  className={`flex items-center gap-3 p-4 rounded-xl ${
                    status.type === "success"
                      ? "bg-green-50 text-green-800 border border-green-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  {status.type === "success" ? (
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  )}
                  <p className="text-sm font-medium">{status.message}</p>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isSubmitting}
              >
                {isSubmitting ? (
                  "পাঠানো হচ্ছে..."
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    বার্তা পাঠান
                  </>
                )}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

