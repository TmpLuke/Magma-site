"use client";

import { ArrowRight, Play, Sparkles } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";

// Generate consistent particle positions using deterministic values
const generateParticles = () => {
  const particles = [];
  for (let i = 0; i < 30; i++) {
    particles.push({
      left: (i * 5.3 + 3.7) % 100,
      top: (i * 7.1 + 2.3) % 100,
      delay: (i * 0.7) % 5,
      duration: 5 + (i * 0.9) % 10,
      size: 1 + ((i * 1.3) % 2), // Deterministic size between 1-3px
    });
  }
  return particles;
};

export function Hero() {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const particles = useMemo(() => generateParticles(), []);

  useEffect(() => {
    setIsVisible(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section className="relative min-h-screen pt-20 sm:pt-24 pb-12 sm:pb-16 overflow-hidden">
      {/* Dynamic background gradient that follows mouse */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a0a0a] via-[#0a0a0a] to-[#0a0a0a]" />

      {/* Animated glow effect with mouse tracking */}
      <div 
        className="absolute w-[1000px] h-[500px] bg-[#dc2626]/10 blur-[120px] rounded-full transition-all duration-1000 ease-out"
        style={{
          left: `${mousePosition.x}%`,
          top: `${mousePosition.y}%`,
          transform: 'translate(-50%, -50%)',
        }}
      />
      
      {/* Secondary ambient glow */}
      <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-[#dc2626]/5 blur-[100px] rounded-full animate-pulse" 
        style={{ animationDuration: '4s' }}
      />

      {/* Floating particles with varied sizes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle, i) => (
          <div
            key={i}
            className="absolute bg-[#dc2626]/40 rounded-full animate-float backdrop-blur-sm"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
              boxShadow: '0 0 10px rgba(220, 38, 38, 0.3)',
            }}
          />
        ))}
      </div>

      {/* Diagonal grid lines for depth */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(45deg, #dc2626 1px, transparent 1px), linear-gradient(-45deg, #dc2626 1px, transparent 1px)`,
          backgroundSize: '100px 100px',
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        {/* Main heading with staggered animation and enhanced styling */}
        <h1
          className={`text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-center text-white mt-4 sm:mt-8 mb-6 sm:mb-8 max-w-5xl leading-tight transition-all duration-1000 delay-200 px-2 ${
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
          style={{
            textShadow: '0 0 40px rgba(220, 38, 38, 0.2)',
          }}
        >
          A Powerful, Instant Solution{" "}
          <br className="hidden sm:block" />
          to{" "}
          <span className="text-[#dc2626] relative inline-block group">
            Play Without Limits
            {/* Animated underline */}
            <span className="absolute -bottom-2 sm:-bottom-3 left-0 w-full h-1 sm:h-1.5 bg-gradient-to-r from-[#dc2626] via-[#ef4444] to-transparent rounded-full transform origin-left transition-transform duration-700 group-hover:scale-x-110" />
            {/* Glow effect */}
            <span className="absolute -bottom-2 sm:-bottom-3 left-0 w-full h-1 sm:h-1.5 bg-gradient-to-r from-[#dc2626] via-[#ef4444] to-transparent rounded-full blur-sm opacity-50" />
          </span>
          .
        </h1>

        {/* Subtitle */}
        <p
          className={`text-white/60 text-center max-w-2xl mb-8 text-base sm:text-lg transition-all duration-1000 delay-300 ${
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          Experience undetected gaming advantages with our premium suite of tools. 
          Join the elite and dominate every match.
        </p>

        {/* Video section with CTA button */}
        <div
          className={`mt-8 w-full max-w-4xl transition-all duration-1000 delay-400 ${
            isVisible
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-20 scale-95"
          }`}
        >
          {/* CTA Button - enhanced with better animations */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <Link
              href="/store"
              className="group relative bg-[#dc2626] text-white font-semibold px-8 sm:px-10 py-4 sm:py-4 rounded-full flex items-center gap-3 text-base sm:text-lg transition-all duration-500 hover:scale-105 active:scale-95 overflow-hidden"
            >
              {/* Animated background shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              
              {/* Button content */}
              <span className="relative z-10">Explore Cheats</span>
              <ArrowRight className="relative z-10 w-5 h-5 transition-transform duration-300 group-hover:translate-x-2" />
              
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-[#dc2626] blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
            </Link>
          </div>

          {/* Enhanced video container */}
          <div className="relative group">
            {/* Multiple layered glows for depth */}
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-[#dc2626]/20 via-[#dc2626]/10 to-[#dc2626]/20 blur-2xl opacity-50 group-hover:opacity-100 transition-all duration-700" />
            <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-[#dc2626]/10 to-[#dc2626]/10 blur-lg opacity-50 group-hover:opacity-80 transition-all duration-700" />
            
            {/* Video container with enhanced border animation */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border-2 border-[#262626] group-hover:border-[#dc2626]/60 transition-all duration-700 transform group-hover:scale-[1.02]">
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-[#dc2626]/50 rounded-tl-2xl transition-all duration-500 group-hover:w-24 group-hover:h-24" />
              <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-[#dc2626]/50 rounded-br-2xl transition-all duration-500 group-hover:w-24 group-hover:h-24" />
              
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
              
              {/* Scan line effect */}
              <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-20 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#dc2626]/10 to-transparent animate-scan" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          25% {
            transform: translateY(-20px) translateX(10px);
          }
          50% {
            transform: translateY(-10px) translateX(-10px);
          }
          75% {
            transform: translateY(-30px) translateX(5px);
          }
        }

        @keyframes scan {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(100%);
          }
        }

        .animate-float {
          animation: float linear infinite;
        }

        .animate-scan {
          animation: scan 3s linear infinite;
        }
      `}</style>
    </section>
  );
}