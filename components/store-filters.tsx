"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, ChevronLeft, ChevronRight, Gamepad2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  game: string;
  description: string;
  image: string;
  status: string;
  pricing: { duration: string; price: number; stock: number }[];
  features: { aimbot: string[]; esp: string[]; misc: string[] };
  requirements: { cpu: string; windows: string; cheatType: string; controller: boolean };
}

// Convert game name to slug
function gameToSlug(game: string): string {
  return game.toLowerCase().replace(/[:\s]+/g, "-").replace(/--+/g, "-");
}

export function StoreFilters({ products }: { products: Product[] }) {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const filteredProducts = useMemo(() => {
    if (!selectedGame) return products;
    return products.filter((product) => product.game === selectedGame);
  }, [products, selectedGame]);

  const games = useMemo(() => {
    const gameSet = new Set(products.map((p) => p.game));
    return Array.from(gameSet);
  }, [products]);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      return () => container.removeEventListener('scroll', checkScroll);
    }
  }, [games]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
      {/* Enhanced Game Filter Slider */}
      <div className="relative mb-8">
        {/* Desktop View - Beautiful Horizontal Slider with Navigation */}
        <div className="hidden md:block">
          <div className="relative group">
            {/* Left Scroll Button */}
            {canScrollLeft && (
              <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-gradient-to-r from-[#dc2626] to-[#ef4444] rounded-full flex items-center justify-center shadow-lg shadow-[#dc2626]/50 hover:scale-110 transition-transform duration-200 opacity-0 group-hover:opacity-100"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
            )}

            {/* Slider Container */}
            <div 
              ref={scrollContainerRef}
              className="flex gap-3 overflow-x-auto scroll-smooth pb-2 px-1 scrollbar-hide"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {/* ALL Button */}
              <button
                onClick={() => setSelectedGame(null)}
                className={`relative flex-shrink-0 px-8 py-4 rounded-2xl text-sm font-bold transition-all duration-300 overflow-hidden group/btn ${
                  !selectedGame
                    ? "bg-gradient-to-r from-[#dc2626] to-[#ef4444] text-white shadow-xl shadow-[#dc2626]/40 scale-105"
                    : "bg-[#111111] text-white/70 hover:bg-[#1a1a1a] border-2 border-[#dc2626]/30 hover:border-[#dc2626]/60 hover:scale-105"
                }`}
              >
                {!selectedGame && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                )}
                <div className="relative flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4" />
                  <span>ALL GAMES</span>
                </div>
                {!selectedGame && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/50 rounded-full" />
                )}
              </button>

              {/* Game Buttons */}
              {games.map((game) => (
                <button
                  key={game}
                  onClick={() => setSelectedGame(game)}
                  className={`relative flex-shrink-0 px-8 py-4 rounded-2xl text-sm font-bold transition-all duration-300 overflow-hidden group/btn ${
                    selectedGame === game
                      ? "bg-gradient-to-r from-[#dc2626] to-[#ef4444] text-white shadow-xl shadow-[#dc2626]/40 scale-105"
                      : "bg-[#111111] text-white/70 hover:bg-[#1a1a1a] border-2 border-[#dc2626]/30 hover:border-[#dc2626]/60 hover:scale-105"
                  }`}
                >
                  {selectedGame === game && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                  )}
                  <span className="relative">{game === "Universal" ? "HWID SPOOFERS" : game.toUpperCase()}</span>
                  {selectedGame === game && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/50 rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Right Scroll Button */}
            {canScrollRight && (
              <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-gradient-to-r from-[#dc2626] to-[#ef4444] rounded-full flex items-center justify-center shadow-lg shadow-[#dc2626]/50 hover:scale-110 transition-transform duration-200 opacity-0 group-hover:opacity-100"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            )}
          </div>

          {/* Product Count Indicator */}
          <div className="text-center mt-4">
            <p className="text-white/50 text-sm flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#dc2626] animate-pulse" />
              Showing <span className="text-white font-semibold">{filteredProducts.length}</span> {filteredProducts.length === 1 ? 'product' : 'products'}
            </p>
          </div>
        </div>

        {/* Mobile View - Compact Swipeable Slider */}
        <div className="md:hidden">
          <div className="relative">
            {/* Gradient Fade Edges */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
            
            <div className="flex gap-3 overflow-x-auto pb-4 px-2 scrollbar-hide scroll-smooth">
              <button
                onClick={() => setSelectedGame(null)}
                className={`flex-shrink-0 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 ${
                  !selectedGame
                    ? "bg-gradient-to-r from-[#dc2626] to-[#ef4444] text-white shadow-lg shadow-[#dc2626]/40"
                    : "bg-[#1a1a1a] text-white/80 border-2 border-[#333] active:bg-[#262626]"
                }`}
              >
                ALL
              </button>
              {games.map((game) => (
                <button
                  key={game}
                  onClick={() => setSelectedGame(game)}
                  className={`flex-shrink-0 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 ${
                    selectedGame === game
                      ? "bg-gradient-to-r from-[#dc2626] to-[#ef4444] text-white shadow-lg shadow-[#dc2626]/40"
                      : "bg-[#1a1a1a] text-white/80 border-2 border-[#333] active:bg-[#262626]"
                  }`}
                >
                  {game === "Universal" ? "SPOOFER" : game.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          
          {/* Swipe Indicator */}
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="flex gap-1">
              <div className="w-1 h-1 rounded-full bg-[#dc2626] animate-pulse" />
              <div className="w-1 h-1 rounded-full bg-[#dc2626]/50 animate-pulse delay-75" />
              <div className="w-1 h-1 rounded-full bg-[#dc2626]/30 animate-pulse delay-150" />
            </div>
            <p className="text-white/40 text-xs">Swipe to browse</p>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          {filteredProducts.map((product) => (
            <Link
              key={product.id}
              href={`/store/${gameToSlug(product.game)}/${product.slug}`}
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-[#dc2626]/40 hover:border-[#dc2626] transition-all duration-300 hover:shadow-xl hover:shadow-[#dc2626]/30 active:scale-[0.98] sm:hover:-translate-y-1 bg-gradient-to-br from-[#1a0808] to-[#0a0a0a]"
            >
              {/* Red gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#dc2626]/20 via-[#0a0a0a] to-[#0a0a0a]" />
              
              {/* Product Image */}
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105 grayscale-[30%] contrast-[1.1]"
              />
              
              {/* Red overlay effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0505] via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-br from-[#dc2626]/10 via-transparent to-[#dc2626]/5" />
              
              {/* Bottom glow bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#dc2626] to-transparent" />
              
              {/* Game Logo/Name at bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/80 to-transparent">
                <h3 className="text-[#dc2626] font-bold text-xs sm:text-lg text-center tracking-wider uppercase drop-shadow-lg"
                    style={{ textShadow: "0 0 20px rgba(220,38,38,0.5)" }}>
                  {product.game === "Universal" ? "HWID SPOOFER" : product.game.toUpperCase()}
                </h3>
                <p className="text-white/90 text-xs text-center mt-1 sm:hidden font-semibold">
                  From ${product.pricing[0]?.price?.toFixed(2) || "0.00"}
                </p>
              </div>

              {/* Status indicator */}
              <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex items-center gap-1.5">
                <span className="text-[10px] font-medium text-white/80 sm:hidden">
                  {product.status === "active" ? "LIVE" : "UPDATE"}
                </span>
                <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${
                  product.status === "active" 
                    ? "bg-green-500 shadow-lg shadow-green-500/50" 
                    : product.status === "maintenance"
                    ? "bg-yellow-400 shadow-lg shadow-yellow-400/50"
                    : "bg-red-400 shadow-lg shadow-red-400/50"
                }`} />
              </div>

              {/* Hover overlay - Desktop only */}
              <div className="absolute inset-0 bg-[#0a0a0a]/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:flex flex-col items-center justify-center p-4">
                <h4 className="text-white font-bold text-lg mb-1">{product.name}</h4>
                <p className="text-white/60 text-sm mb-1">{product.game}</p>
                <p className="text-[#dc2626] text-xl font-bold mb-4">From ${product.pricing[0]?.price?.toFixed(2) || "0.00"}</p>
                <span className="px-5 py-2.5 bg-[#dc2626] hover:bg-[#ef4444] text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors">
                  View Details
                  <ExternalLink className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-[#111111] border border-[#1a1a1a] rounded-2xl">
          <Gamepad2 className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/50 text-lg mb-2">No products found</p>
          <p className="text-white/30 text-sm">Try selecting a different game</p>
        </div>
      )}

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
}
