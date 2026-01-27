"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { Shield } from "lucide-react";
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
}

export function ProductCard({ product }: ProductCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

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

  return (
    <section ref={sectionRef} className="py-20 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className={`text-center mb-12 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <p className="text-white/50 text-sm tracking-wider mb-2">
            FEATURED PRODUCT
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Premium{" "}
            <span className="text-[#dc2626] relative inline-block">
              Game Cheats
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-[#dc2626] to-transparent rounded-full" />
            </span>
          </h2>
        </div>

        {/* Product Card */}
        <div className="flex justify-center">
          <Link
            href={`/store/${product.slug}`}
            className={`group relative w-full max-w-sm cursor-pointer transition-all duration-700 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
            style={{ transitionDelay: "200ms" }}
          >
            {/* Card */}
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-b from-[#1a0808] to-[#0a0a0a] border border-[#dc2626]/30 transition-all duration-500 group-hover:border-[#dc2626] group-hover:shadow-2xl group-hover:shadow-[#dc2626]/20 group-hover:scale-[1.02]">
              {/* Background X pattern */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] opacity-20">
                  <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#dc2626] to-transparent transform -rotate-45" />
                  <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#dc2626] to-transparent transform rotate-45" />
                </div>
              </div>

              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#dc2626]/20 to-transparent opacity-50 group-hover:opacity-80 transition-opacity duration-500" />

              {/* Product Image */}
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <div className="relative w-full h-full transition-transform duration-500 group-hover:scale-105">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-contain object-center"
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                </div>
              </div>

              {/* Bottom gradient */}
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent" />

              {/* Product Info */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
                <h3 className="text-2xl font-bold text-white mb-1 transition-colors duration-300 group-hover:text-[#dc2626]">
                  {product.game}
                </h3>
                <p className="text-white/60 text-sm mb-4">{product.name} Cheats</p>
                <span className="block w-full bg-[#dc2626] hover:bg-[#ef4444] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-[#dc2626]/30">
                  View Product
                </span>
              </div>

              {/* Status badge */}
              <div className={`absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                product.status === "active" 
                  ? "bg-green-500/20 text-green-400" 
                  : "bg-yellow-500/20 text-yellow-400"
              }`}>
                <Shield className="w-3 h-3" />
                {product.status === "active" ? "Undetected" : "Maintenance"}
              </div>

              {/* Red accent line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#dc2626] to-[#dc2626]/50 transition-all duration-500 group-hover:h-1.5 group-hover:shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
