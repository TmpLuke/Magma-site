"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Zap, Shield, Star, Sparkles, TrendingUp, Eye, Crown } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  game: string;
  image: string;
  status: string;
}

interface PopularCheatsProps {
  products: Product[];
}

// Convert game name to slug
function gameToSlug(game: string | undefined): string {
  if (!game) return "";
  return game.toLowerCase().replace(/[:\s]+/g, "-").replace(/--+/g, "-");
}

export function PopularCheats({ products }: PopularCheatsProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const sectionRef = useRef<HTMLElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Take up to 12 products for carousel
  const displayProducts = products.slice(0, 12);

  // Show enhanced empty state if no products
  if (displayProducts.length === 0) {
    return (
      <section ref={sectionRef} className="py-16 sm:py-24 bg-[#0a0a0a] relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#dc2626]/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-10 sm:mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#dc2626]/10 border border-[#dc2626]/20 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-[#dc2626] animate-pulse" />
              <span className="text-[#dc2626] text-sm font-semibold">Coming Soon</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-white mb-4 tracking-tight">
              Your Cheats<span className="text-[#dc2626]">.</span>
            </h2>
            <p className="text-white/60 text-base sm:text-lg max-w-2xl mx-auto">
              Beautifully simple. Unbelievably powerful.
            </p>
          </div>
          
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#dc2626]/20 to-transparent rounded-2xl blur-xl opacity-50" />
            <div className="relative text-center py-20 bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a] rounded-2xl">
              <div className="w-20 h-20 bg-[#dc2626]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="w-10 h-10 text-[#dc2626]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">No Products Yet</h3>
              <p className="text-white/50 max-w-md mx-auto">
                Products will appear here once they are added through the admin panel.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Track mouse movement for parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!carouselRef.current) return;
      const rect = carouselRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
      setMousePosition({ x, y });
    };

    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener("mousemove", handleMouseMove);
      return () => carousel.removeEventListener("mousemove", handleMouseMove);
    }
  }, []);

  // Auto-rotate carousel - Ultra smooth
  useEffect(() => {
    if (!isAutoPlaying || displayProducts.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayProducts.length);
    }, 4000); // Smooth 4 second intervals

    return () => clearInterval(interval);
  }, [isAutoPlaying, displayProducts.length]);

  const handleTransition = (callback: () => void) => {
    callback();
  };

  const goToSlide = useCallback((index: number) => {
    if (index === currentIndex) return;
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  }, [currentIndex]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + displayProducts.length) % displayProducts.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  }, [displayProducts.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % displayProducts.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  }, [displayProducts.length]);

  // Get visible products for carousel with position info
  const getVisibleProducts = () => {
    const items = [];
    for (let i = -2; i <= 2; i++) {
      const index = (currentIndex + i + displayProducts.length) % displayProducts.length;
      items.push({ ...displayProducts[index], position: i, originalIndex: index });
    }
    return items;
  };

  const visibleProducts = getVisibleProducts();

  // Enhanced card styles with parallax - Ultra smooth
  const getCardStyles = (position: number) => {
    const baseTransition = "all 1200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)";
    const parallaxX = mousePosition.x * 5 * (position === 0 ? 1 : 0.3);
    const parallaxY = mousePosition.y * 5 * (position === 0 ? 1 : 0.3);
    
    switch (position) {
      case 0: // Center card
        return {
          transform: `translateX(calc(0% + ${parallaxX}px)) translateY(${parallaxY}px) scale(1.05) rotateY(0deg)`,
          opacity: 1,
          zIndex: 30,
          filter: "brightness(1.1) saturate(1.2)",
          transition: baseTransition,
        };
      case -1: // Left card
        return {
          transform: `translateX(calc(-65% + ${parallaxX}px)) translateY(${parallaxY}px) scale(0.88) rotateY(12deg)`,
          opacity: 0.75,
          zIndex: 20,
          filter: "brightness(0.7) saturate(0.8)",
          transition: baseTransition,
        };
      case 1: // Right card
        return {
          transform: `translateX(calc(65% + ${parallaxX}px)) translateY(${parallaxY}px) scale(0.88) rotateY(-12deg)`,
          opacity: 0.75,
          zIndex: 20,
          filter: "brightness(0.7) saturate(0.8)",
          transition: baseTransition,
        };
      case -2: // Far left
        return {
          transform: `translateX(calc(-130% + ${parallaxX}px)) translateY(${parallaxY}px) scale(0.75) rotateY(20deg)`,
          opacity: 0.4,
          zIndex: 10,
          filter: "brightness(0.5) saturate(0.6)",
          transition: baseTransition,
        };
      case 2: // Far right
        return {
          transform: `translateX(calc(130% + ${parallaxX}px)) translateY(${parallaxY}px) scale(0.75) rotateY(-20deg)`,
          opacity: 0.4,
          zIndex: 10,
          filter: "brightness(0.5) saturate(0.6)",
          transition: baseTransition,
        };
      default:
        return {
          transform: `translateX(${position * 100}%) scale(0.5)`,
          opacity: 0,
          zIndex: 0,
          filter: "brightness(0.3)",
          transition: baseTransition,
        };
    }
  };

  return (
    <section ref={sectionRef} className="py-16 sm:py-24 bg-[#0a0a0a] overflow-hidden relative">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#dc2626]/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Enhanced Header */}
        <div
          className={`text-center mb-10 sm:mb-16 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-white mb-4 tracking-tight">
            Your Cheats<span className="text-[#dc2626]">.</span>
          </h2>
          <p className="text-white/60 text-base sm:text-lg max-w-2xl mx-auto">
            Beautifully simple. Unbelievably powerful.
          </p>
        </div>

        {/* Enhanced Carousel Container */}
        <div
          ref={carouselRef}
          className={`relative transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
          style={{ transitionDelay: "200ms", perspective: "2000px" }}
        >
          {/* Enhanced Navigation Arrows */}
          <button
            onClick={goToPrevious}
            className="absolute left-2 sm:left-4 lg:left-8 top-1/2 -translate-y-1/2 z-40 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#111111] to-[#0a0a0a] backdrop-blur-xl border-2 border-[#dc2626]/30 hover:border-[#dc2626] flex items-center justify-center text-white transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-[#dc2626]/50 active:scale-95 group overflow-hidden"
            aria-label="Previous"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-[#dc2626]/0 via-[#dc2626]/20 to-[#dc2626]/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <ChevronLeft className="w-7 h-7 relative transition-transform duration-300 group-hover:-translate-x-1" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-2 sm:right-4 lg:right-8 top-1/2 -translate-y-1/2 z-40 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#111111] to-[#0a0a0a] backdrop-blur-xl border-2 border-[#dc2626]/30 hover:border-[#dc2626] flex items-center justify-center text-white transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-[#dc2626]/50 active:scale-95 group overflow-hidden"
            aria-label="Next"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-[#dc2626]/0 via-[#dc2626]/20 to-[#dc2626]/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <ChevronRight className="w-7 h-7 relative transition-transform duration-300 group-hover:translate-x-1" />
          </button>

          {/* 3D Carousel Track */}
          <div
            className="relative h-[500px] sm:h-[550px] lg:h-[600px] flex items-center justify-center"
            style={{ transformStyle: "preserve-3d" }}
          >
            {visibleProducts.map((product) => {
              const styles = getCardStyles(product.position);
              const isCenter = product.position === 0;

              return (
                <Link
                  key={`${product.id}-${product.position}`}
                  href={`/store/${gameToSlug(product.game)}`}
                  className="absolute w-[280px] sm:w-[320px] lg:w-[380px] group/card"
                  style={styles}
                >
                  <div
                    className={`relative aspect-[3/4] rounded-2xl overflow-hidden transition-all duration-800 ${
                      isCenter
                        ? "shadow-2xl shadow-[#dc2626]/50 ring-2 ring-[#dc2626]/50"
                        : "shadow-xl shadow-black/60"
                    }`}
                  >
                    {/* Product Image with zoom effect */}
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.game}
                      fill
                      className={`object-cover transition-all duration-800 ${
                        isCenter ? "scale-100 group-hover/card:scale-110" : "scale-110"
                      }`}
                      priority={isCenter}
                    />

                    {/* Enhanced gradient overlays */}
                    <div 
                      className={`absolute inset-0 transition-all duration-800 ${
                        isCenter 
                          ? "bg-gradient-to-t from-black via-black/40 to-transparent" 
                          : "bg-gradient-to-t from-black/95 via-black/60 to-black/30"
                      }`}
                    />

                    {/* Animated border glow for center */}
                    {isCenter && (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-br from-[#dc2626]/20 via-transparent to-[#dc2626]/20 animate-pulse" />
                        <div className="absolute -inset-2 bg-gradient-to-r from-[#dc2626]/0 via-[#dc2626]/30 to-[#dc2626]/0 blur-2xl opacity-60 animate-pulse" />
                        
                        {/* Particle effect */}
                        <div className="absolute inset-0 overflow-hidden">
                          <div className="absolute top-0 left-1/4 w-1 h-1 bg-white rounded-full animate-particle-1" />
                          <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-white rounded-full animate-particle-2" />
                          <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-white rounded-full animate-particle-3" />
                        </div>
                      </>
                    )}

                    {/* Enhanced Status indicator */}
                    <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/10">
                        <div
                          className={`relative w-2 h-2 rounded-full transition-all duration-500 ${
                            product.status === "active"
                              ? "bg-green-400"
                              : "bg-yellow-400"
                          }`}
                        >
                          <div className={`absolute inset-0 rounded-full animate-ping ${
                            product.status === "active" ? "bg-green-400" : "bg-yellow-400"
                          }`} />
                        </div>
                        <span className="text-white text-xs font-semibold uppercase tracking-wide">
                          {product.status === "active" ? "Active" : "Updating"}
                        </span>
                      </div>
                    </div>

                    {/* Enhanced Content Overlay */}
                    <div className={`absolute bottom-0 left-0 right-0 p-6 sm:p-8 transition-all duration-500 ${
                      isCenter ? "translate-y-0 opacity-100" : "translate-y-3 opacity-80"
                    }`}>
                      {/* Product Badge */}
                      {isCenter && (
                        <div className="flex items-center gap-2 mb-4 animate-fade-in">
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#dc2626]/20 border border-[#dc2626]/30 backdrop-blur-sm">
                            <Zap className="w-3 h-3 text-[#dc2626]" />
                            <span className="text-[#dc2626] text-xs font-bold uppercase">Featured</span>
                          </div>
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            <span className="text-white text-xs font-semibold">4.9</span>
                          </div>
                        </div>
                      )}

                      {/* Game Title */}
                      <h3
                        className={`font-black uppercase tracking-tight mb-5 transition-all duration-500 leading-none ${
                          isCenter 
                            ? "text-4xl sm:text-5xl text-white group-hover/card:text-[#dc2626]" 
                            : "text-3xl sm:text-4xl text-white/80"
                        }`}
                        style={{ 
                          textShadow: isCenter 
                            ? "0 0 40px rgba(220,38,38,0.6), 3px 3px 12px rgba(0,0,0,0.9)" 
                            : "2px 2px 10px rgba(0,0,0,0.9)" 
                        }}
                      >
                        {product.game}
                      </h3>

                      {/* Enhanced Buy Now Button */}
                      <button
                        className={`relative w-full py-4 sm:py-5 rounded-xl font-bold text-sm sm:text-base uppercase tracking-wider transition-all duration-500 overflow-hidden group/btn ${
                          isCenter
                            ? "bg-gradient-to-r from-[#dc2626] to-[#ef4444] hover:from-[#ef4444] hover:to-[#dc2626] text-white shadow-2xl shadow-[#dc2626]/60 hover:shadow-[#dc2626]/80 hover:scale-105 active:scale-95"
                            : "bg-white/5 backdrop-blur-sm text-white/50 border border-white/10"
                        }`}
                      >
                        <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                        <span className="relative flex items-center justify-center gap-2">
                          {isCenter ? (
                            <>
                              <Zap className="w-5 h-5" />
                              Buy Now
                            </>
                          ) : (
                            "View"
                          )}
                        </span>
                      </button>

                      {/* Feature pills (only for center) */}
                      {isCenter && (
                        <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
                          <span className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm text-white/80 text-xs font-medium border border-white/20">
                            Instant Delivery
                          </span>
                          <span className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm text-white/80 text-xs font-medium border border-white/20">
                            24/7 Support
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Enhanced Corner accents for center card */}
                    {isCenter && (
                      <>
                        <div className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-[#dc2626]/80 rounded-tl-2xl animate-pulse" />
                        <div className="absolute top-0 right-0 w-20 h-20 border-r-2 border-t-2 border-[#dc2626]/80 rounded-tr-2xl animate-pulse" style={{ animationDelay: "500ms" }} />
                        <div className="absolute bottom-0 left-0 w-20 h-20 border-l-2 border-b-2 border-[#dc2626]/80 rounded-bl-2xl animate-pulse" style={{ animationDelay: "1000ms" }} />
                        <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-[#dc2626]/80 rounded-br-2xl animate-pulse" style={{ animationDelay: "1500ms" }} />
                      </>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Enhanced Dot Indicators with Labels */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 mt-8 flex-wrap">
            {displayProducts.map((product, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`group/dot relative transition-all duration-500 ${
                  index === currentIndex
                    ? "w-12 sm:w-14"
                    : "w-8 sm:w-10"
                }`}
                aria-label={`Go to ${product.game}`}
              >
                <div className={`relative overflow-hidden rounded-full transition-all duration-500 ${
                  index === currentIndex
                    ? "h-3 bg-gradient-to-r from-[#dc2626] to-[#ef4444] shadow-lg shadow-[#dc2626]/50 ring-2 ring-[#dc2626]/30"
                    : "h-2.5 bg-white/20 group-hover/dot:bg-white/40 group-hover/dot:scale-125"
                }`}>
                  {index === currentIndex && (
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                  )}
                </div>
                
                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-black/90 backdrop-blur-sm rounded-lg text-white text-xs font-semibold whitespace-nowrap opacity-0 group-hover/dot:opacity-100 transition-opacity pointer-events-none">
                  {product.game}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-black/90" />
                </div>
              </button>
            ))}
          </div>

          {/* Enhanced Animated Progress bar */}
          <div className="mt-6 max-w-sm mx-auto">
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-[#dc2626] via-[#ff4444] to-[#dc2626] rounded-full transition-all duration-700 ease-out relative"
                style={{
                  width: `${((currentIndex + 1) / displayProducts.length) * 100}%`,
                }}
              >
                <span className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/50 animate-pulse" />
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 animate-shimmer" />
              </div>
            </div>
            
            {/* Progress counter */}
            <div className="flex items-center justify-center gap-2 mt-3 text-white/60 text-sm font-medium">
              <span className="text-[#dc2626] font-bold">{currentIndex + 1}</span>
              <span>/</span>
              <span>{displayProducts.length}</span>
            </div>
          </div>

          {/* Auto-play indicator */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="flex items-center gap-2 px-4 py-2 bg-[#111111] border border-[#1a1a1a] rounded-lg hover:border-[#dc2626]/30 transition-all group"
            >
              <div className={`relative w-2 h-2 rounded-full ${isAutoPlaying ? 'bg-green-400' : 'bg-white/40'}`}>
                {isAutoPlaying && <div className="absolute inset-0 bg-green-400 rounded-full animate-ping" />}
              </div>
              <span className="text-white/60 text-xs font-medium group-hover:text-white/80 transition-colors">
                {isAutoPlaying ? "Auto-playing" : "Paused"}
              </span>
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes particle-1 {
          0%, 100% {
            transform: translate(0, 0) scale(0);
            opacity: 0;
          }
          50% {
            transform: translate(100px, -100px) scale(1);
            opacity: 1;
          }
        }

        @keyframes particle-2 {
          0%, 100% {
            transform: translate(0, 0) scale(0);
            opacity: 0;
          }
          50% {
            transform: translate(-80px, 80px) scale(1);
            opacity: 1;
          }
        }

        @keyframes particle-3 {
          0%, 100% {
            transform: translate(0, 0) scale(0);
            opacity: 0;
          }
          50% {
            transform: translate(60px, 60px) scale(1);
            opacity: 1;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-shimmer {
          animation: shimmer 3s infinite;
        }

        .animate-particle-1 {
          animation: particle-1 4s infinite;
        }

        .animate-particle-2 {
          animation: particle-2 5s infinite;
          animation-delay: 1s;
        }

        .animate-particle-3 {
          animation: particle-3 6s infinite;
          animation-delay: 2s;
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .delay-500 {
          animation-delay: 500ms;
        }

        .delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </section>
  );
}