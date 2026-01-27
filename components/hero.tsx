"use client";

import { ArrowRight, Play } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

export function Hero() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative min-h-screen pt-20 sm:pt-24 pb-12 sm:pb-16 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a0a0a] via-[#0a0a0a] to-[#0a0a0a]" />

      {/* Animated glow effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#dc2626]/5 blur-[100px] rounded-full animate-pulse" />
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-[#dc2626]/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        {/* Main heading with staggered animation */}
        <h1
          className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center text-white mt-8 sm:mt-16 mb-6 sm:mb-8 max-w-4xl leading-tight transition-all duration-1000 px-2 ${
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          A Powerful, Instant Solution{" "}
          <br className="hidden sm:block" />
          to{" "}
          <span className="text-[#dc2626] relative inline-block">
            Play Without Limits
            <span className="absolute -bottom-1 sm:-bottom-2 left-0 w-full h-0.5 sm:h-1 bg-gradient-to-r from-[#dc2626] to-transparent rounded-full" />
          </span>
          .
        </h1>

        {/* Video section with CTA button on top */}
        <div
          className={`mt-8 w-full max-w-4xl transition-all duration-1000 delay-300 ${
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-20"
          }`}
        >
          {/* CTA Button - positioned above video */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <Link
              href="/store"
              className="group bg-[#dc2626] hover:bg-[#ef4444] text-white font-semibold px-6 sm:px-8 py-3.5 sm:py-3 rounded-full flex items-center gap-2 text-base sm:text-lg transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-[#dc2626]/30 active:scale-[0.98]"
            >
              Explore Cheats
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Reactive glow effect */}
          <div className="relative group">
            <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-[#dc2626]/20 via-[#dc2626]/10 to-[#dc2626]/20 blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#dc2626]/10 to-[#dc2626]/10 blur-md opacity-50 group-hover:opacity-80 transition-opacity duration-500" />
            
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-[#262626] group-hover:border-[#dc2626]/40 transition-all duration-500">
              {/* YouTube Embed */}
              <div className="relative aspect-video bg-black">
                <iframe
                  src="https://www.youtube.com/embed/n3qSwEew7Ec?rel=0&modestbranding=1"
                  title="I Used These $4.95 R6 Cheats... | Magma Cheats"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
