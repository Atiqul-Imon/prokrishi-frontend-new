"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Youtube, ArrowRight } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    shop: [
      { label: "All Products", href: "/products", id: "all-products" },
      { label: "Featured Products", href: "/products?featured=true", id: "featured-products" },
      { label: "Categories", href: "/products#categories", id: "categories" },
      { label: "New Arrivals", href: "/products?sort=newest", id: "new-arrivals" },
    ],
    company: [
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Careers", href: "/careers" },
      { label: "Blog", href: "/blog" },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Youtube, href: "#", label: "YouTube" },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="w-full mx-auto px-4 lg:px-6 py-12 lg:py-16 xl:max-w-[90%] 2xl:max-w-[70%]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4 group">
              <div className="relative h-12 md:h-14 w-auto">
                <Image
                  src="/logo/prokrishihublogo.png"
                  alt="ProKrishi Logo"
                  width={200}
                  height={56}
                  className="h-12 md:h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-md">
              Your trusted source for fresh, quality agricultural products. We bring the best from farm to your doorstep with care and commitment.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2.5 mb-6">
              <div className="flex items-center gap-2.5 text-gray-400 text-sm">
                <Phone className="w-4 h-4 text-[var(--primary-green)] flex-shrink-0" />
                <a href="tel:+8801748027775" className="hover:text-[var(--primary-green)] transition-colors">
                  +880 1748-027775
                </a>
              </div>
              <div className="flex items-center gap-2.5 text-gray-400 text-sm">
                <Mail className="w-4 h-4 text-[var(--primary-green)] flex-shrink-0" />
                <a href="mailto:prokrishi2025@gmail.com" className="hover:text-[var(--primary-green)] transition-colors">
                  prokrishi2025@gmail.com
                </a>
              </div>
              <div className="flex items-start gap-2.5 text-gray-400 text-sm">
                <MapPin className="w-4 h-4 text-[var(--primary-green)] flex-shrink-0 mt-0.5" />
                <span>Dhaka, Bangladesh</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-2.5">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-[var(--primary-green)] flex items-center justify-center transition-all duration-200 hover:scale-110"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">
              Shop
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.shop.map((link) => (
                <li key={link.id || link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-[var(--primary-green)] text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">
              Company
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link, index) => (
                <li key={`company-${index}-${link.href}`}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-[var(--primary-green)] text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="w-full mx-auto px-4 lg:px-6 py-5 xl:max-w-[90%] 2xl:max-w-[70%]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © {currentYear} ProKrishi. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span className="hidden sm:inline">Made with</span>
              <span className="text-red-500">♥</span>
              <span className="hidden sm:inline">in Bangladesh</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

