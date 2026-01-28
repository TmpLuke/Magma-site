"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { Shield, Star, Zap, TrendingUp, Eye, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  slug: string;
  game: string;
  image: string;
  status: string;
  pricing: { duration: string; price: number; stock: number }[];
}

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Track mouse position for parallax effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
    const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
    setMousePosition({ x, y });
  };

  const lowestPrice = product.pricing.length > 0 
    ? Math.min(...product.pricing.map(p => p.price))
    : 0;

  return (
    <div
      ref={cardRef}
      className={`transition-all duration-700 ${
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-10"
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        href={`/store/${product.slug}`}
        className="group block relative"
      >
        {/* Glow effect on hover */}
        <div className={`absolute -inset-1 bg-gradient-to-r from-[#dc2626] via-[#ef4444] to-[#dc2626] rounded-2xl blur-xl opacity-0 group-hover:opacity-60 transition-all duration-700 ${
          isHovered ? "animate-pulse" : ""
        }`} />

        {/* Main Card */}
        <div 
          className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a] group-hover:border-[#dc2626]/50 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-[#dc2626]/30"
          style={{
            transform: isHovered 
              ? `perspective(1000px) rotateX(${mousePosition.y * 5}deg) rotateY(${mousePosition.x * 5}deg) scale(1.02)`
              : "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)",
            transition: "transform 0.3s ease-out"
          }}
        >
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#dc2626]/10 via-transparent to-[#dc2626]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Animated mesh pattern */}
          <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(to right, #dc2626 1px, transparent 1px),
                linear-gradient(to bottom, #dc2626 1px, transparent 1px)
              `,
              backgroundSize: "20px 20px"
            }} />
          </div>

          {/* Floating particles effect */}
          {isHovered && (
            <>
              <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-[#dc2626] rounded-full animate-float opacity-60" style={{ animationDelay: "0s" }} />
              <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-[#ef4444] rounded-full animate-float opacity-60" style={{ animationDelay: "0.5s" }} />
              <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-[#dc2626] rounded-full animate-float opacity-60" style={{ animationDelay: "1s" }} />
            </>
          )}

          {/* Product Image with parallax */}
          <div 
            className="absolute inset-0 flex items-center justify-center p-8 transition-transform duration-300"
            style={{
              transform: isHovered 
                ? `translate(${mousePosition.x * 10}px, ${mousePosition.y * 10}px) scale(1.1)`
                : "translate(0, 0) scale(1)"
            }}
          >
            <div className="relative w-full h-full">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-contain object-center drop-shadow-2xl"
                sizes="(max-width: 768px) 100vw, 400px"
              />
            </div>
          </div>

          {/* Top badges */}
          <div className="absolute top-4 left-4 right-4 flex items-start justify-between z-10">
            {/* Status badge */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md border transition-all duration-300 ${
              product.status === "active" 
                ? "bg-green-500/20 text-green-400 border-green-500/30 group-hover:bg-green-500/30" 
                : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30 group-hover:bg-yellow-500/30"
            }`}>
              <div className="relative">
                <Shield className="w-3.5 h-3.5" />
                {product.status === "active" && (
                  <div className="absolute inset-0 animate-ping">
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
              {product.status === "active" ? "Undetected" : "Updating"}
            </div>

            {/* Featured badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#dc2626]/20 text-[#dc2626] border border-[#dc2626]/30 backdrop-blur-md group-hover:bg-[#dc2626]/30 transition-all duration-300">
              <Sparkles className="w-3.5 h-3.5" />
              Featured
            </div>
          </div>

          {/* Bottom gradient overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent" />

          {/* Product Info */}
          <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
            {/* Stats row */}
            <div className="flex items-center justify-center gap-3 mb-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                <span className="text-white text-xs font-semibold">4.9</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                <Eye className="w-3 h-3 text-blue-400" />
                <span className="text-white text-xs font-semibold">2.5K</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                <TrendingUp className="w-3 h-3 text-green-400" />
                <span className="text-white text-xs font-semibold">Hot</span>
              </div>
            </div>

            {/* Game title */}
            <h3 className="text-2xl md:text-3xl font-black text-white mb-2 text-center transition-all duration-300 group-hover:text-[#dc2626] uppercase tracking-tight"
              style={{
                textShadow: "0 0 20px rgba(220,38,38,0.3), 2px 2px 8px rgba(0,0,0,0.8)"
              }}
            >
              {product.game}
            </h3>

            {/* Product name */}
            <p className="text-white/60 text-sm text-center mb-4 group-hover:text-white/80 transition-colors">
              {product.name} Cheats
            </p>

            {/* Price tag */}
            {lowestPrice > 0 && (
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-white/50 text-sm">Starting at</span>
                <span className="text-[#dc2626] text-xl font-bold">
                  ${lowestPrice.toFixed(2)}
                </span>
              </div>
            )}

            {/* CTA Button */}
            <div className="relative overflow-hidden rounded-xl">
              <div className="absolute inset-0 bg-gradient-to-r from-[#dc2626] to-[#ef4444] opacity-100 group-hover:opacity-0 transition-opacity duration-300" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#ef4444] to-[#dc2626] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <button className="relative w-full py-3.5 text-white font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 group-hover:gap-3">
                <Zap className="w-5 h-5 group-hover:animate-pulse" />
                <span>View Product</span>
                <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all duration-300 -ml-5 group-hover:ml-0" />
              </button>
            </div>

            {/* Feature pills */}
            <div className="flex items-center justify-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
              <span className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm text-white/80 text-xs font-medium border border-white/20">
                Instant Delivery
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm text-white/80 text-xs font-medium border border-white/20">
                24/7 Support
              </span>
            </div>
          </div>

          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-[#dc2626]/50 rounded-tl-2xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
          <div className="absolute top-0 right-0 w-16 h-16 border-r-2 border-t-2 border-[#dc2626]/50 rounded-tr-2xl opacity-0 group-hover:opacity-100 transition-all duration-500" style={{ transitionDelay: "100ms" }} />
          <div className="absolute bottom-0 left-0 w-16 h-16 border-l-2 border-b-2 border-[#dc2626]/50 rounded-bl-2xl opacity-0 group-hover:opacity-100 transition-all duration-500" style={{ transitionDelay: "200ms" }} />
          <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-[#dc2626]/50 rounded-br-2xl opacity-0 group-hover:opacity-100 transition-all duration-500" style={{ transitionDelay: "300ms" }} />

          {/* Bottom accent line */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#dc2626] to-transparent transition-all duration-500 group-hover:h-1.5 group-hover:shadow-[0_0_15px_rgba(220,38,38,0.8)]" />
        </div>
      </Link>
    </div>
  );
}
