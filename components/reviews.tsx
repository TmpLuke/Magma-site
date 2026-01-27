"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
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
  const sectionRef = useRef<HTMLElement>(null);

  // Fallback reviews if none provided
  const defaultReviews = [
    {
      id: "1",
      username: "Alex_Gamer",
      avatar: "A",
      avatarImage: "/images/avatars/alex-gamer.png",
      rating: 5,
      text: "Best cheats I have ever used! The aimbot is smooth and the ESP is crystal clear. Customer support is top notch.",
      created_at: "2026-01-15T12:00:00Z",
    },
    {
      id: "2", 
      username: "ProPlayer99",
      avatar: "P",
      avatarImage: "/images/avatars/proplayer99.png",
      rating: 5,
      text: "Undetected for months now. Worth every penny. The features are exactly as described.",
      created_at: "2026-01-10T10:30:00Z",
    },
    {
      id: "3",
      username: "ShadowHunter",
      avatar: "S",
      avatarImage: "/images/avatars/shadowhunter.png",
      rating: 4,
      text: "Great product overall. Minor lag issues at first but support helped me fix it quickly.",
      created_at: "2026-01-08T15:45:00Z",
    },
    {
      id: "4",
      username: "GhostSniper",
      avatar: "G",
      rating: 5,
      text: "Been using Magma for 6 months now. Never had any issues. The updates are always on time and the features keep getting better.",
      created_at: "2026-01-05T09:20:00Z",
    },
    {
      id: "5",
      username: "NightOwl_X",
      avatar: "N",
      rating: 5,
      text: "Finally found a provider I can trust. Fast delivery, clean software, and amazing support. 10/10 would recommend!",
      created_at: "2026-01-02T18:15:00Z",
    },
    {
      id: "6",
      username: "EliteGamer",
      avatar: "E",
      rating: 5,
      text: "The ESP features are incredible. Can see everything on the map. Worth every dollar spent.",
      created_at: "2025-12-28T14:30:00Z",
    },
  ];

  const reviews = initialReviews.length > 0 ? initialReviews : defaultReviews;

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
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, reviews.length - 2));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.max(1, reviews.length - 2)) % Math.max(1, reviews.length - 2));
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  const displayReviews = reviews.slice(currentIndex, currentIndex + 3);

  return (
    <section ref={sectionRef} className="py-20 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className={`flex items-start justify-between mb-8 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h2
            className="text-3xl md:text-4xl font-bold text-white"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Reviews that
            <br />
            <span className="text-[#dc2626] relative inline-block">
              prove performance
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-[#dc2626] to-transparent rounded-full" />
            </span>
          </h2>

          {/* Navigation arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={prevSlide}
              className="w-12 h-12 rounded-full bg-[#dc2626]/20 hover:bg-[#dc2626]/30 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
            >
              <ChevronLeft className="w-6 h-6 text-[#dc2626]" />
            </button>
            <button
              onClick={nextSlide}
              className="w-12 h-12 rounded-full bg-[#dc2626] hover:bg-[#ef4444] flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#dc2626]/30 active:scale-95"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayReviews.map((review, index) => (
            <div
              key={review.id}
              className={`group bg-[#111111] border border-[#262626] rounded-xl p-6 relative transition-all duration-500 hover:border-[#dc2626]/50 hover:shadow-xl hover:shadow-[#dc2626]/10 hover:-translate-y-2 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Red accent line at top with animation */}
              <div
                className={`absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r from-[#dc2626] to-[#dc2626]/50 rounded-full transition-all duration-500 ${
                  hoveredIndex === index ? "left-4 right-4 shadow-[0_0_10px_rgba(220,38,38,0.5)]" : ""
                }`}
              />

              {/* Quote marks */}
              <div className="text-[#dc2626] text-4xl font-serif mb-4 transition-transform duration-300 group-hover:scale-110">
                &ldquo;
              </div>

              {/* Review text */}
              <p className="text-white/70 text-sm leading-relaxed mb-6 min-h-[100px] transition-colors duration-300 group-hover:text-white/80 line-clamp-4">
                {review.text}
              </p>

              {/* Quote marks end */}
              <div className="text-[#dc2626] text-4xl font-serif text-right mb-4 transition-transform duration-300 group-hover:scale-110">
                &rdquo;
              </div>

              {/* Author info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#dc2626] flex items-center justify-center text-white font-bold transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-[#dc2626]/30 overflow-hidden">
                    {review.avatarImage ? (
                      <Image
                        src={review.avatarImage || "/placeholder.svg"}
                        alt={review.username}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      review.avatar
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium transition-colors duration-300 group-hover:text-[#dc2626]">
                      {review.username}
                    </p>
                    <p className="text-white/50 text-sm">{formatDate(review.created_at)}</p>
                  </div>
                </div>

                {/* Rating with animation */}
                <div className="flex items-center gap-1">
                  <span className="text-white font-bold transition-all duration-300 group-hover:scale-110">
                    {review.rating}
                  </span>
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 transition-all duration-300 group-hover:scale-125 group-hover:drop-shadow-[0_0_4px_rgba(250,204,21,0.5)]" />
                </div>
              </div>

              {/* Corner glow on hover */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#dc2626]/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
