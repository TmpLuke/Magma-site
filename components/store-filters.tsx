"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

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

  const filteredProducts = useMemo(() => {
    if (!selectedGame) return products;
    return products.filter((product) => product.game === selectedGame);
  }, [products, selectedGame]);

  const games = useMemo(() => {
    const gameSet = new Set(products.map((p) => p.game));
    return Array.from(gameSet);
  }, [products]);

  return (
    <>
      {/* Game Filter Pills - Horizontal scroll on mobile */}
      <div className="relative mb-6 sm:mb-8">
        {/* Mobile: Full-width scrollable container */}
        <div className="md:hidden">
          <div className="flex gap-2.5 overflow-x-auto pb-3 px-1 scrollbar-hide">
            <button
              onClick={() => setSelectedGame(null)}
              className={`px-5 py-3 rounded-full text-sm font-semibold transition-all duration-200 whitespace-nowrap flex-shrink-0 active:scale-95 ${
                !selectedGame
                  ? "bg-[#dc2626] text-white shadow-lg shadow-[#dc2626]/40"
                  : "bg-[#1a1a1a] text-white/80 border border-[#333] active:bg-[#262626]"
              }`}
            >
              ALL
            </button>
            {games.map((game) => (
              <button
                key={game}
                onClick={() => setSelectedGame(game)}
                className={`px-5 py-3 rounded-full text-sm font-semibold transition-all duration-200 whitespace-nowrap flex-shrink-0 active:scale-95 ${
                  selectedGame === game
                    ? "bg-[#dc2626] text-white shadow-lg shadow-[#dc2626]/40"
                    : "bg-[#1a1a1a] text-white/80 border border-[#333] active:bg-[#262626]"
                }`}
              >
                {game === "Universal" ? "SPOOFER" : game.toUpperCase()}
              </button>
            ))}
          </div>
          {/* Swipe hint text */}
          <p className="text-center text-white/40 text-xs mt-1">Swipe to see more</p>
        </div>

        {/* Desktop: Centered wrapped pills */}
        <div className="hidden md:flex flex-wrap justify-center gap-2">
          <button
            onClick={() => setSelectedGame(null)}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap ${
              !selectedGame
                ? "bg-[#dc2626] text-white shadow-lg shadow-[#dc2626]/30"
                : "bg-[#111] text-white/70 hover:bg-[#1a1a1a] border border-[#dc2626]/30"
            }`}
          >
            All Games
          </button>
          {games.map((game) => (
            <button
              key={game}
              onClick={() => setSelectedGame(game)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                selectedGame === game
                  ? "bg-[#dc2626] text-white shadow-lg shadow-[#dc2626]/30"
                  : "bg-[#111] text-white/70 hover:bg-[#1a1a1a] border border-[#dc2626]/30"
              }`}
            >
              {game === "Universal" ? "HWID Spoofers" : game}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          {filteredProducts.map((product) => (
            <Link
              key={product.id}
              href={`/store/${gameToSlug(product.game)}`}
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
              
              {/* Game Logo/Name at bottom - Mobile shows price */}
              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/80 to-transparent">
                <h3 className="text-[#dc2626] font-bold text-xs sm:text-lg text-center tracking-wider uppercase drop-shadow-lg"
                    style={{ textShadow: "0 0 20px rgba(220,38,38,0.5)" }}>
                  {product.game === "Universal" ? "HWID SPOOFER" : product.game.toUpperCase()}
                </h3>
                {/* Price visible on mobile */}
                <p className="text-white/90 text-xs text-center mt-1 sm:hidden font-semibold">
                  From ${product.pricing[0]?.price?.toFixed(2) || "0.00"}
                </p>
              </div>

              {/* Status indicator with label on mobile */}
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

              {/* Hover overlay with price - Desktop only */}
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
        <div className="text-center py-20">
          <p className="text-white/50 text-lg">No products found.</p>
        </div>
      )}
    </>
  );
}
