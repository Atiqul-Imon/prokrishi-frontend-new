"use client";

import React from "react";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] aspect-[16/9] sm:aspect-[21/9] lg:aspect-[16/6] overflow-hidden">
      {/* Hero Image Background */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/hero-image.webp"
          alt="Prokrishi Hero"
          fill
          priority
          className="object-cover"
          quality={90}
        />
      </div>
    </section>
  );
}
