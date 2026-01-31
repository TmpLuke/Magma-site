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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
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
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#dc2626]/8 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#dc2626]/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-10 sm:mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#dc2626]/10 border border-[#dc2626]/20 rounded-full mb-6 backdrop-blur-sm">
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
            <div className="absolute -inset-1 bg-gradient-to-r from-[#dc2626]/20 to-transparent rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative text-center py-20 bg-gradient-to-br from-[#111111] to-[#0a0a0a] border-2 border-[#1a1a1a] hover:border-[#dc2626]/30 rounded-2xl transition-all duration-500">
              <div className="w-20 h-20 bg-[#dc2626]/10 rounded-full flex items-center justify-center mx-auto mb-6 transition-transform duration-500 group-hover:scale-110">
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

  // Auto-rotate carousel
  useEffect(() => {
    if (!isAutoPlaying || displayProducts.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayProducts.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, displayProducts.length]);

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

  // Get visible products for carousel
  const getVisibleProducts = () => {
    const items = [];
    for (let i = -2; i <= 2; i++) {
      const index = (currentIndex + i + displayProducts.length) % displayProducts.length;
      items.push({ ...displayProducts[index], position: i, originalIndex: index });
    }
    return items;
  };

  const visibleProducts = getVisibleProducts();

  // Enhanced card styles with parallax
  const getCardStyles = (position: number, isHovered: boolean) => {
    const baseTransition = "all 1200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)";
    const hoverScale = isHovered ? 1.1 : 1.05;
    const parallaxX = mousePosition.x * 8 * (position === 0 ? 1 : 0.3);
    const parallaxY = mousePosition.y * 8 * (position === 0 ? 1 : 0.3);
    
    switch (position) {
      case 0: // Center card
        return {
          transform: `translateX(calc(0% + ${parallaxX}px)) translateY(${parallaxY}px) scale(${hoverScale}) rotateY(0deg)`,
          opacity: 1,
          zIndex: 30,
          filter: `brightness(${isHovered ? 1.2 : 1.1}) saturate(${isHovered ? 1.3 : 1.2})`,
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
          transform: "translateX(0) scale(0)",
          opacity: 0,
          zIndex: 0,
          filter: "brightness(0.3)",
          transition: baseTransition,
        };
    }
  };

  return (
    <section
      ref={sectionRef}
      className="relative py-16 sm:py-24 bg-[#0a0a0a] overflow-hidden"
    >
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#dc2626]/8 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/3 right-1/3 w-[500px] h-[500px] bg-[#dc2626]/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: `linear-gradient(#dc2626 1px, transparent 1px), linear-gradient(90deg, #dc2626 1px, transparent 1px)`,
        backgroundSize: '50px 50px',
      }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className={`text-center mb-10 sm:mb-16 transition-all duration-1000 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#dc2626]/10 border border-[#dc2626]/20 rounded-full mb-6 backdrop-blur-sm">
            <TrendingUp className="w-4 h-4 text-[#dc2626] animate-pulse" />
            <span className="text-[#dc2626] text-sm font-semibold">Most Popular</span>
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
            Featured
            <br />
            <span className="text-[#dc2626] relative inline-block group">
              Products
              <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-[#dc2626] via-[#ef4444] to-transparent rounded-full" />
              <span className="absolute -bottom-2 left-0 w-3/4 h-1 bg-gradient-to-r from-[#dc2626] to-transparent rounded-full blur-md opacity-60" />
            </span>
          </h2>

          <p className="text-white/60 text-base sm:text-lg max-w-2xl mx-auto">
            Explore our most trusted and powerful gaming enhancements
          </p>
        </div>

        {/* Carousel Container */}
        <div
          ref={carouselRef}
          className={`relative h-[500px] sm:h-[600px] mb-12 transition-all duration-1000 delay-300 ${
            isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
          style={{ perspective: "2000px" }}
        >
          {/* Navigation Buttons with enhanced styling */}
          {displayProducts.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="group absolute left-0 sm:left-4 top-1/2 -translate-y-1/2 z-40 w-14 h-14 rounded-full bg-[#dc2626]/10 hover:bg-[#dc2626]/20 border-2 border-[#dc2626]/20 hover:border-[#dc2626]/40 backdrop-blur-xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
                aria-label="Previous product"
              >
                <div className="absolute inset-0 rounded-full bg-[#dc2626]/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <ChevronLeft className="relative z-10 w-7 h-7 text-[#dc2626] transition-transform duration-300 group-hover:-translate-x-0.5" />
              </button>

              <button
                onClick={goToNext}
                className="group absolute right-0 sm:right-4 top-1/2 -translate-y-1/2 z-40 w-14 h-14 rounded-full bg-[#dc2626] hover:bg-[#ef4444] backdrop-blur-xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 overflow-hidden"
                aria-label="Next product"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <div className="absolute -inset-1 bg-[#dc2626] blur-lg opacity-50 group-hover:opacity-70 transition-opacity duration-300" />
                <ChevronRight className="relative z-10 w-7 h-7 text-white transition-transform duration-300 group-hover:translate-x-0.5" />
              </button>
            </>
          )}

          {/* Product Cards */}
          <div className="relative w-full h-full flex items-center justify-center">
            {visibleProducts.map((product, idx) => {
              const isCenter = product.position === 0;
              const isHovered = hoveredCard === product.originalIndex;
              const cardStyles = getCardStyles(product.position, isHovered);

              return (
                <Link
                  key={`${product.id}-${product.position}`}
                  href={`/store/${gameToSlug(product.game)}/${product.slug}`}
                  className="absolute w-[280px] sm:w-[340px] md:w-[380px] h-[450px] sm:h-[520px]"
                  style={cardStyles}
                  onClick={(e) => {
                    if (!isCenter) {
                      e.preventDefault();
                      goToSlide(product.originalIndex);
                    }
                  }}
                  onMouseEnter={() => isCenter && setHoveredCard(product.originalIndex)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className={`group/card relative w-full h-full rounded-3xl overflow-hidden border-2 backdrop-blur-sm ${
                    isCenter 
                      ? "border-[#dc2626] shadow-[0_0_60px_rgba(220,38,38,0.4)]" 
                      : "border-white/10"
                  }`}>
                    {/* Multiple layered glows */}
                    {isCenter && (
                      <>
                        <div className={`absolute -inset-2 rounded-3xl bg-gradient-to-r from-[#dc2626]/30 via-[#dc2626]/20 to-[#dc2626]/30 blur-2xl transition-opacity duration-500 ${
                          isHovered ? "opacity-100" : "opacity-70"
                        }`} />
                        <div className={`absolute -inset-4 rounded-3xl bg-gradient-to-r from-[#dc2626]/20 to-[#dc2626]/20 blur-3xl transition-opacity duration-500 ${
                          isHovered ? "opacity-100" : "opacity-50"
                        }`} />
                      </>
                    )}

                    {/* Animated particles for center card */}
                    {isCenter && (
                      <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-[#dc2626]/60 rounded-full animate-particle-1" />
                        <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-[#dc2626]/40 rounded-full animate-particle-2" />
                        <div className="absolute bottom-1/3 left-1/2 w-2 h-2 bg-[#dc2626]/50 rounded-full animate-particle-3" />
                      </div>
                    )}

                    {/* Product Image with enhanced effects */}
                    <div className="relative w-full h-3/5 overflow-hidden">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.game}
                        fill
                        className={`object-cover transition-all duration-700 ${
                          isCenter && isHovered ? "scale-110" : "scale-100"
                        }`}
                      />
                      
                      {/* Image overlay gradient */}
                      <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent transition-opacity duration-500 ${
                        isCenter && isHovered ? "opacity-60" : "opacity-80"
                      }`} />

                      {/* Scan line effect */}
                      {isCenter && isHovered && (
                        <div className="absolute inset-0 opacity-30">
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#dc2626]/20 to-transparent animate-scan" />
                        </div>
                      )}

                      {/* Status badge */}
                      <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-green-500/90 backdrop-blur-sm flex items-center gap-1.5 shadow-lg">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        <span className="text-white text-xs font-bold uppercase tracking-wider">
                          {product.status}
                        </span>
                      </div>

                      {/* Crown badge for center */}
                      {isCenter && (
                        <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-[#dc2626] flex items-center justify-center shadow-lg shadow-[#dc2626]/50 animate-pulse">
                          <Crown className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="relative h-2/5 bg-gradient-to-b from-black to-[#0a0a0a] p-6 flex flex-col justify-between">
                      {/* Shimmer effect on hover */}
                      {isCenter && (
                        <div className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/card:translate-x-full transition-transform duration-1000" />
                        </div>
                      )}

                      <div className="relative">
                        <h3 className={`font-bold mb-2 transition-all duration-300 ${
                          isCenter 
                            ? "text-2xl text-white" 
                            : "text-xl text-white/80"
                        }`}>
                          {product.game}
                        </h3>
                        <p className={`transition-all duration-300 ${
                          isCenter 
                            ? "text-white/70 text-sm" 
                            : "text-white/50 text-xs"
                        }`}>
                          {product.name}
                        </p>
                      </div>

                      {/* CTA Button */}
                      <button
                        className={`group/btn relative w-full py-3.5 rounded-xl font-bold transition-all duration-500 overflow-hidden ${
                          isCenter
                            ? "bg-[#dc2626] hover:bg-[#ef4444] text-white shadow-lg shadow-[#dc2626]/30 hover:shadow-xl hover:shadow-[#dc2626]/40 hover:scale-105"
                            : "bg-white/5 backdrop-blur-sm text-white/50 border border-white/10 hover:border-white/20"
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

                      {/* Feature pills */}
                      {isCenter && (
                        <div className={`flex items-center justify-center gap-2 mt-3 flex-wrap transition-all duration-500 ${
                          isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                        }`}>
                          <span className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm text-white/80 text-xs font-medium border border-white/20">
                            Instant Delivery
                          </span>
                          <span className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm text-white/80 text-xs font-medium border border-white/20">
                            24/7 Support
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Corner accents for center card */}
                    {isCenter && (
                      <>
                        <div className={`absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-[#dc2626] rounded-tl-3xl transition-all duration-500 ${
                          isHovered ? "w-20 h-20 border-[#ef4444]" : ""
                        }`} />
                        <div className={`absolute top-0 right-0 w-16 h-16 border-r-2 border-t-2 border-[#dc2626] rounded-tr-3xl transition-all duration-500 ${
                          isHovered ? "w-20 h-20 border-[#ef4444]" : ""
                        }`} />
                        <div className={`absolute bottom-0 left-0 w-16 h-16 border-l-2 border-b-2 border-[#dc2626] rounded-bl-3xl transition-all duration-500 ${
                          isHovered ? "w-20 h-20 border-[#ef4444]" : ""
                        }`} />
                        <div className={`absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-[#dc2626] rounded-br-3xl transition-all duration-500 ${
                          isHovered ? "w-20 h-20 border-[#ef4444]" : ""
                        }`} />
                      </>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Dot Indicators */}
          {displayProducts.length > 1 && (
            <div className="flex items-center justify-center gap-2 sm:gap-3 mt-8 mb-6 flex-wrap px-4">
              {displayProducts.map((product, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`group/dot relative transition-all duration-500 ${
                    index === currentIndex ? "w-12 sm:w-14" : "w-8 sm:w-10"
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
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-black/90 backdrop-blur-sm rounded-lg text-white text-xs font-semibold whitespace-nowrap opacity-0 group-hover/dot:opacity-100 transition-opacity pointer-events-none border border-white/10">
                    {product.game}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-black/90" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Progress bar and counter */}
          {displayProducts.length > 1 && (
            <div className="max-w-sm mx-auto px-4 mb-6">
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
              
              <div className="flex items-center justify-center gap-2 mt-3 text-white/60 text-sm font-medium">
                <span className="text-[#dc2626] font-bold text-lg">{currentIndex + 1}</span>
                <span>/</span>
                <span>{displayProducts.length}</span>
              </div>
            </div>
          )}

          {/* Auto-play indicator */}
          {displayProducts.length > 1 && (
            <div className="flex items-center justify-center gap-2 pb-4">
              <button
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                className="flex items-center gap-2 px-4 py-2 bg-[#111111] border border-[#1a1a1a] hover:border-[#dc2626]/30 rounded-lg transition-all group overflow-hidden"
              >
                <div className="relative">
                  <div className={`w-2 h-2 rounded-full ${isAutoPlaying ? 'bg-green-400' : 'bg-white/40'}`}>
                    {isAutoPlaying && <div className="absolute inset-0 bg-green-400 rounded-full animate-ping" />}
                  </div>
                </div>
                <span className="text-white/60 text-xs font-medium group-hover:text-white/80 transition-colors">
                  {isAutoPlaying ? "Auto-playing" : "Paused"}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
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

        .animate-scan {
          animation: scan 3s linear infinite;
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
      `}</style>
    </section>
  );
}