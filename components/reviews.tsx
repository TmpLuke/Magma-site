"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import Image from "next/image";

interface Review {
  id: string;
  username: string;
  avatar: string;
  avatarImage?: string;
  rating: number;
  text: string;
  created_at: string;
}

interface ReviewsProps {
  reviews: Review[];
}

export function Reviews({ reviews: initialReviews }: ReviewsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const reviews = initialReviews;

  // Show empty state if no reviews
  if (reviews.length === 0) {
    return (
      <section ref={sectionRef} className="py-20 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Customer Reviews
            </h2>
            <div className="py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#dc2626]/10 mb-4 animate-pulse">
                <Star className="w-8 h-8 text-[#dc2626]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Reviews Yet</h3>
              <p className="text-white/50 max-w-md mx-auto">
                Be the first to leave a review after purchasing a product.
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

  const nextSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, reviews.length - 2));
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + Math.max(1, reviews.length - 2)) % Math.max(1, reviews.length - 2));
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  const displayReviews = reviews.slice(currentIndex, currentIndex + 3);

  return (
    <section ref={sectionRef} className="py-20 bg-[#0a0a0a] relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#dc2626]/5 blur-[120px] rounded-full" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div
          className={`flex items-start justify-between mb-12 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div>
            <h2
              className="text-3xl md:text-5xl font-bold text-white mb-3"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Reviews that
              <br />
              <span className="text-[#dc2626] relative inline-block group">
                prove performance
                {/* Animated underline */}
                <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-[#dc2626] via-[#ef4444] to-transparent rounded-full" />
                {/* Glow */}
                <span className="absolute -bottom-2 left-0 w-3/4 h-1 bg-gradient-to-r from-[#dc2626] to-transparent rounded-full blur-md opacity-60" />
              </span>
            </h2>
            <p className="text-white/50 mt-4 max-w-md">
              Real feedback from satisfied customers worldwide
            </p>
          </div>

          {/* Navigation arrows */}
          <div className="flex items-center gap-3">
            <button
              onClick={prevSlide}
              disabled={isTransitioning}
              className="group relative w-12 h-12 rounded-full bg-[#dc2626]/10 hover:bg-[#dc2626]/20 border border-[#dc2626]/20 hover:border-[#dc2626]/40 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 rounded-full bg-[#dc2626]/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <ChevronLeft className="relative z-10 w-6 h-6 text-[#dc2626] transition-transform duration-300 group-hover:-translate-x-0.5" />
            </button>
            <button
              onClick={nextSlide}
              disabled={isTransitioning}
              className="group relative w-12 h-12 rounded-full bg-[#dc2626] hover:bg-[#ef4444] flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <div className="absolute -inset-1 bg-[#dc2626] blur-lg opacity-50 group-hover:opacity-70 transition-opacity duration-300" />
              <ChevronRight className="relative z-10 w-6 h-6 text-white transition-transform duration-300 group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayReviews.map((review, index) => {
            const isHovered = hoveredIndex === index;
            
            return (
              <div
                key={review.id}
                className={`group relative bg-[#111111] border-2 rounded-2xl p-6 transition-all duration-700 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                } ${
                  isHovered 
                    ? "border-[#dc2626]/70 -translate-y-2 shadow-xl shadow-[#dc2626]/20" 
                    : "border-[#262626]"
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Top accent line */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#dc2626] via-[#ef4444] to-[#dc2626]/50 rounded-t-2xl transition-all duration-500 ${
                    isHovered ? "opacity-100 shadow-[0_0_10px_rgba(220,38,38,0.5)]" : "opacity-0"
                  }`}
                />

                {/* Quote icon with animation */}
                <div className={`mb-4 transition-all duration-500 ${
                  isHovered ? "scale-110 rotate-6" : "scale-100 rotate-0"
                }`}>
                  <Quote className="w-10 h-10 text-[#dc2626]/40" />
                </div>

                {/* Review text */}
                <p className="text-white/70 text-sm leading-relaxed mb-6 min-h-[100px] transition-colors duration-300 group-hover:text-white/85 line-clamp-4">
                  {review.text}
                </p>

                {/* Divider */}
                <div className={`h-px bg-gradient-to-r from-transparent via-[#dc2626]/30 to-transparent mb-4 transition-all duration-500 ${
                  isHovered ? "via-[#dc2626]/60" : ""
                }`} />

                {/* Author info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`relative w-10 h-10 rounded-full bg-[#dc2626] flex items-center justify-center text-white font-bold transition-all duration-500 overflow-hidden ${
                      isHovered ? "scale-110 shadow-lg shadow-[#dc2626]/40" : ""
                    }`}>
                      {/* Ring effect */}
                      <div className={`absolute inset-0 rounded-full border-2 border-[#dc2626] transition-all duration-500 ${
                        isHovered ? "scale-150 opacity-0" : "scale-100 opacity-100"
                      }`} />
                      
                      {review.avatarImage ? (
                        <Image
                          src={review.avatarImage || "/placeholder.svg"}
                          alt={review.username}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="relative z-10">{review.avatar}</span>
                      )}
                    </div>
                    <div>
                      <p className={`text-white font-medium transition-all duration-300 ${
                        isHovered ? "text-[#dc2626]" : ""
                      }`}>
                        {review.username}
                      </p>
                      <p className="text-white/50 text-sm">{formatDate(review.created_at)}</p>
                    </div>
                  </div>

                  {/* Rating with enhanced animation */}
                  <div className="flex items-center gap-1.5">
                    <span className={`text-white font-bold transition-all duration-300 ${
                      isHovered ? "scale-110 text-[#dc2626]" : ""
                    }`}>
                      {review.rating}
                    </span>
                    <div className="relative">
                      {/* Pulsing ring */}
                      <div className={`absolute inset-0 transition-all duration-500 ${
                        isHovered ? "scale-150 opacity-0" : "scale-100 opacity-100"
                      }`}>
                        <Star className="w-4 h-4 text-yellow-400/30 fill-yellow-400/30" />
                      </div>
                      
                      <Star className={`relative w-4 h-4 text-yellow-400 fill-yellow-400 transition-all duration-500 ${
                        isHovered ? "scale-125 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]" : ""
                      }`} />
                    </div>
                  </div>
                </div>

                {/* Corner glow */}
                <div className={`absolute -bottom-10 -right-10 w-32 h-32 bg-[#dc2626]/20 blur-3xl rounded-full transition-opacity duration-500 ${
                  isHovered ? "opacity-100" : "opacity-0"
                }`} />

                {/* Background shimmer */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden rounded-2xl">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination dots */}
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: Math.max(1, reviews.length - 2) }).map((_, i) => (
            <button
              key={i}
              onClick={() => {
                if (!isTransitioning) {
                  setIsTransitioning(true);
                  setCurrentIndex(i);
                  setTimeout(() => setIsTransitioning(false), 500);
                }
              }}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === currentIndex 
                  ? "w-8 bg-[#dc2626] shadow-lg shadow-[#dc2626]/50" 
                  : "w-1.5 bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}