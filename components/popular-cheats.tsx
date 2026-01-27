"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
function gameToSlug(game: string): string {
  return game.toLowerCase().replace(/[:\s]+/g, "-").replace(/--+/g, "-");
}

export function PopularCheats({ products }: PopularCheatsProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Take up to 12 products for carousel
  const displayProducts = products.slice(0, 12);

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

  // Auto-rotate carousel
  useEffect(() => {
    if (!isAutoPlaying || displayProducts.length === 0) return;

    const interval = setInterval(() => {
      handleTransition(() => {
        setCurrentIndex((prev) => (prev + 1) % displayProducts.length);
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, displayProducts.length]);

  const handleTransition = (callback: () => void) => {
    setIsTransitioning(true);
    setTimeout(() => {
      callback();
      setTimeout(() => setIsTransitioning(false), 50);
    }, 150);
  };

  const goToSlide = useCallback((index: number) => {
    if (index === currentIndex) return;
    handleTransition(() => setCurrentIndex(index));
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 6000);
  }, [currentIndex]);

  const goToPrevious = useCallback(() => {
    handleTransition(() => {
      setCurrentIndex((prev) => (prev - 1 + displayProducts.length) % displayProducts.length);
    });
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 6000);
  }, [displayProducts.length]);

  const goToNext = useCallback(() => {
    handleTransition(() => {
      setCurrentIndex((prev) => (prev + 1) % displayProducts.length);
    });
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 6000);
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

  // Calculate transform and styles based on position
  const getCardStyles = (position: number) => {
    const baseTransition = "all 700ms cubic-bezier(0.4, 0, 0.2, 1)";
    
    switch (position) {
      case 0: // Center card
        return {
          transform: `translateX(0) scale(1) rotateY(0deg)`,
          opacity: 1,
          zIndex: 30,
          filter: "brightness(1)",
          transition: baseTransition,
        };
      case -1: // Left card
        return {
          transform: `translateX(-60%) scale(0.85) rotateY(8deg)`,
          opacity: 0.7,
          zIndex: 20,
          filter: "brightness(0.7)",
          transition: baseTransition,
        };
      case 1: // Right card
        return {
          transform: `translateX(60%) scale(0.85) rotateY(-8deg)`,
          opacity: 0.7,
          zIndex: 20,
          filter: "brightness(0.7)",
          transition: baseTransition,
        };
      case -2: // Far left (entering/exiting)
        return {
          transform: `translateX(-120%) scale(0.7) rotateY(15deg)`,
          opacity: 0.3,
          zIndex: 10,
          filter: "brightness(0.5)",
          transition: baseTransition,
        };
      case 2: // Far right (entering/exiting)
        return {
          transform: `translateX(120%) scale(0.7) rotateY(-15deg)`,
          opacity: 0.3,
          zIndex: 10,
          filter: "brightness(0.5)",
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
    <section ref={sectionRef} className="py-16 sm:py-24 bg-[#0a0a0a] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className={`text-center mb-10 sm:mb-16 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4">
            Your Cheats.
          </h2>
          <p className="text-white/50 text-base sm:text-lg">
            Beautifully simple. Unbelievably powerful.
          </p>
        </div>

        {/* Carousel Container */}
        <div
          className={`relative transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
          style={{ transitionDelay: "200ms", perspective: "1500px" }}
        >
          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            className="absolute left-2 sm:left-4 lg:left-8 top-1/2 -translate-y-1/2 z-40 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/50 backdrop-blur-sm border border-[#dc2626]/50 hover:bg-[#dc2626] hover:border-[#dc2626] flex items-center justify-center text-white transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#dc2626]/50 active:scale-95 group"
            aria-label="Previous"
          >
            <ChevronLeft className="w-6 h-6 transition-transform duration-300 group-hover:-translate-x-0.5" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-2 sm:right-4 lg:right-8 top-1/2 -translate-y-1/2 z-40 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/50 backdrop-blur-sm border border-[#dc2626]/50 hover:bg-[#dc2626] hover:border-[#dc2626] flex items-center justify-center text-white transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#dc2626]/50 active:scale-95 group"
            aria-label="Next"
          >
            <ChevronRight className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-0.5" />
          </button>

          {/* 3D Carousel Track */}
          <div
            className="relative h-[450px] sm:h-[500px] lg:h-[550px] flex items-center justify-center"
            style={{ transformStyle: "preserve-3d" }}
          >
            {visibleProducts.map((product) => {
              const styles = getCardStyles(product.position);
              const isCenter = product.position === 0;

              return (
                <Link
                  key={`${product.id}-${product.position}`}
                  href={`/store/${gameToSlug(product.game)}`}
                  className={`absolute w-[260px] sm:w-[300px] lg:w-[340px] ${
                    isTransitioning ? "pointer-events-none" : ""
                  }`}
                  style={styles}
                >
                  <div
                    className={`relative aspect-[3/4] rounded-2xl overflow-hidden transition-all duration-700 ${
                      isCenter
                        ? "shadow-2xl shadow-[#dc2626]/40 ring-2 ring-[#dc2626]"
                        : "shadow-xl shadow-black/50"
                    }`}
                  >
                    {/* Product Image */}
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.game}
                      fill
                      className={`object-cover transition-all duration-700 ${
                        isCenter ? "scale-100" : "scale-105"
                      }`}
                      priority={isCenter}
                    />

                    {/* Animated gradient overlay */}
                    <div 
                      className={`absolute inset-0 transition-all duration-700 ${
                        isCenter 
                          ? "bg-gradient-to-t from-black via-black/30 to-transparent" 
                          : "bg-gradient-to-t from-black/90 via-black/50 to-black/20"
                      }`}
                    />

                    {/* Red glow effect for center */}
                    {isCenter && (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-br from-[#dc2626]/10 via-transparent to-[#dc2626]/10 animate-pulse" />
                        <div className="absolute -inset-1 bg-gradient-to-r from-[#dc2626]/0 via-[#dc2626]/20 to-[#dc2626]/0 blur-xl opacity-60" />
                      </>
                    )}

                    {/* Status indicator with glow */}
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full transition-all duration-500 ${
                          product.status === "active"
                            ? "bg-green-400 shadow-lg shadow-green-400/60 animate-pulse"
                            : "bg-yellow-400 shadow-lg shadow-yellow-400/60"
                        }`}
                      />
                    </div>

                    {/* Content Overlay */}
                    <div className={`absolute bottom-0 left-0 right-0 p-5 sm:p-6 transition-all duration-500 ${
                      isCenter ? "translate-y-0 opacity-100" : "translate-y-2 opacity-80"
                    }`}>
                      {/* Game Title */}
                      <h3
                        className={`font-black uppercase tracking-tight mb-4 transition-all duration-500 ${
                          isCenter 
                            ? "text-3xl sm:text-4xl text-white" 
                            : "text-2xl sm:text-3xl text-white/80"
                        }`}
                        style={{ 
                          textShadow: isCenter 
                            ? "0 0 30px rgba(220,38,38,0.5), 2px 2px 10px rgba(0,0,0,0.8)" 
                            : "2px 2px 8px rgba(0,0,0,0.8)" 
                        }}
                      >
                        {product.game}
                      </h3>

                      {/* Buy Now Button */}
                      <button
                        className={`w-full py-3.5 sm:py-4 rounded-xl font-bold text-sm sm:text-base uppercase tracking-wider transition-all duration-500 ${
                          isCenter
                            ? "bg-[#dc2626] hover:bg-[#ef4444] text-white shadow-lg shadow-[#dc2626]/50 hover:shadow-xl hover:shadow-[#dc2626]/60 hover:scale-[1.02] active:scale-[0.98]"
                            : "bg-white/10 backdrop-blur-sm text-white/60 border border-white/20"
                        }`}
                      >
                        {isCenter ? "Buy Now" : "View"}
                      </button>
                    </div>

                    {/* Corner accents for center card */}
                    {isCenter && (
                      <>
                        <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-[#dc2626]/60 rounded-tl-2xl" />
                        <div className="absolute top-0 right-0 w-16 h-16 border-r-2 border-t-2 border-[#dc2626]/60 rounded-tr-2xl" />
                        <div className="absolute bottom-0 left-0 w-16 h-16 border-l-2 border-b-2 border-[#dc2626]/60 rounded-bl-2xl" />
                        <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-[#dc2626]/60 rounded-br-2xl" />
                      </>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Enhanced Dot Indicators */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 mt-6">
            {displayProducts.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`relative transition-all duration-500 rounded-full overflow-hidden ${
                  index === currentIndex
                    ? "w-10 sm:w-12 h-2.5 bg-[#dc2626] shadow-lg shadow-[#dc2626]/50"
                    : "w-2.5 h-2.5 bg-white/20 hover:bg-white/40 hover:scale-125"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              >
                {index === currentIndex && (
                  <span className="absolute inset-0 bg-gradient-to-r from-[#dc2626] via-[#ff4444] to-[#dc2626] animate-shimmer" />
                )}
              </button>
            ))}
          </div>

          {/* Animated Progress bar */}
          <div className="mt-6 max-w-sm mx-auto">
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#dc2626] via-[#ff4444] to-[#dc2626] rounded-full transition-all duration-700 ease-out relative"
                style={{
                  width: `${((currentIndex + 1) / displayProducts.length) * 100}%`,
                }}
              >
                <span className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-r from-transparent to-white/40 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
