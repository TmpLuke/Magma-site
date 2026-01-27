import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getProducts } from "@/lib/supabase/data";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Shield, ShoppingCart, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

// Map of game slugs to display names and gradient colors
const gameConfig: Record<string, { name: string; gradient: string; accentColor: string }> = {
  "apex-legends": { name: "Apex Legends", gradient: "from-red-600/40 via-orange-500/30 to-red-800/40", accentColor: "#dc2626" },
  "fortnite": { name: "Fortnite", gradient: "from-blue-500/40 via-purple-500/30 to-blue-700/40", accentColor: "#3b82f6" },
  "universal": { name: "HWID Spoofer", gradient: "from-emerald-500/40 via-teal-500/30 to-emerald-700/40", accentColor: "#10b981" },
  "marvel-rivals": { name: "Marvel Rivals", gradient: "from-red-500/40 via-yellow-500/30 to-red-700/40", accentColor: "#ef4444" },
  "delta-force": { name: "Delta Force", gradient: "from-green-600/40 via-emerald-500/30 to-green-800/40", accentColor: "#22c55e" },
  "pubg": { name: "PUBG", gradient: "from-orange-500/40 via-yellow-500/30 to-orange-700/40", accentColor: "#f97316" },
  "dayz": { name: "DayZ", gradient: "from-gray-600/40 via-green-600/30 to-gray-800/40", accentColor: "#4ade80" },
  "dune-awakening": { name: "Dune Awakening", gradient: "from-amber-600/40 via-orange-500/30 to-amber-800/40", accentColor: "#f59e0b" },
  "dead-by-daylight": { name: "Dead by Daylight", gradient: "from-red-700/40 via-red-600/30 to-red-900/40", accentColor: "#b91c1c" },
  "arc-raiders": { name: "ARC Raiders", gradient: "from-cyan-500/40 via-teal-400/30 to-cyan-700/40", accentColor: "#06b6d4" },
  "rainbow-six-siege": { name: "Rainbow Six Siege", gradient: "from-yellow-500/40 via-amber-500/30 to-yellow-700/40", accentColor: "#eab308" },
  "battlefield": { name: "Battlefield", gradient: "from-orange-600/40 via-red-500/30 to-orange-800/40", accentColor: "#ea580c" },
  "call-of-duty-bo7": { name: "Call of Duty: BO7", gradient: "from-green-500/40 via-emerald-400/30 to-green-700/40", accentColor: "#22c55e" },
  "call-of-duty-bo6": { name: "Call of Duty: BO6", gradient: "from-orange-500/40 via-red-500/30 to-orange-700/40", accentColor: "#f97316" },
  "rust": { name: "Rust", gradient: "from-orange-700/40 via-red-600/30 to-orange-900/40", accentColor: "#c2410c" },
  "escape-from-tarkov": { name: "Escape from Tarkov", gradient: "from-gray-700/40 via-gray-600/30 to-gray-900/40", accentColor: "#71717a" },
};

// Convert game name to slug
function gameToSlug(game: string): string {
  return game.toLowerCase().replace(/[:\s]+/g, "-").replace(/--+/g, "-");
}

// Card gradient colors for variety
const cardGradients = [
  "from-blue-500/30 via-blue-600/20 to-blue-700/30",
  "from-orange-500/30 via-orange-600/20 to-orange-700/30",
  "from-cyan-500/30 via-teal-600/20 to-cyan-700/30",
  "from-amber-500/30 via-yellow-600/20 to-amber-700/30",
  "from-pink-500/30 via-rose-600/20 to-pink-700/30",
  "from-emerald-500/30 via-green-600/20 to-emerald-700/30",
];

export default async function GameCheatSelectionPage({
  params,
}: {
  params: Promise<{ game: string }>;
}) {
  const { game: gameSlug } = await params;
  
  // Get all products
  const allProducts = await getProducts();
  
  // Find products that match this game
  const gameProducts = allProducts.filter((p) => {
    const productGameSlug = gameToSlug(p.game);
    return productGameSlug === gameSlug;
  });

  // If no products found, this might be a direct product slug - redirect to not found
  if (gameProducts.length === 0) {
    notFound();
  }

  // Get the game config or use default
  const config = gameConfig[gameSlug] || { 
    name: gameProducts[0]?.game || "Game", 
    gradient: "from-red-600/40 via-red-500/30 to-red-800/40",
    accentColor: "#dc2626"
  };

  // Get the first product's image for the banner background
  const bannerImage = gameProducts[0]?.image;

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Header />

      {/* Hero Banner */}
      <div className="relative pt-20">
        {/* Background with game image */}
        <div className="absolute inset-0 overflow-hidden">
          {bannerImage && (
            <Image
              src={bannerImage || "/placeholder.svg"}
              alt={config.name}
              fill
              className="object-cover opacity-30 blur-sm"
            />
          )}
          <div className={`absolute inset-0 bg-gradient-to-b ${config.gradient}`} />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/50 to-[#0a0a0a]" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3">
            {config.name} Hacks
          </h1>
          <p 
            className="text-xl md:text-2xl font-medium"
            style={{ color: config.accentColor }}
          >
            Select Your Cheat
          </p>
        </div>
      </div>

      {/* Cheats Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {gameProducts.map((product, index) => {
            const cardGradient = cardGradients[index % cardGradients.length];
            const lowestPrice = Math.min(...product.pricing.map(p => p.price));
            
            return (
              <div
                key={product.id}
                className="group relative rounded-xl overflow-hidden bg-[#111111] border border-[#1a1a1a] hover:border-[#333] transition-all duration-300"
              >
                {/* Product Image with gradient overlay */}
                <div className={`relative aspect-[4/3] overflow-hidden bg-gradient-to-br ${cardGradient}`}>
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent" />
                  
                  {/* Badge - if first product, mark as MOST POPULAR */}
                  {index === 0 && (
                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-[#111111]/90 backdrop-blur-sm rounded text-[10px] font-bold uppercase tracking-wider text-white">
                      Most Popular
                    </div>
                  )}
                  {index === 1 && gameProducts.length > 1 && (
                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-[#111111]/90 backdrop-blur-sm rounded text-[10px] font-bold uppercase tracking-wider text-green-400">
                      Safest
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  {/* Name and Price Row */}
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-bold text-lg truncate pr-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-white/50 text-xs">FROM</span>
                      <span 
                        className="font-bold text-sm px-2 py-0.5 rounded"
                        style={{ backgroundColor: `${config.accentColor}20`, color: config.accentColor }}
                      >
                        ${lowestPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="mb-4">
                    {product.status === "active" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                        <Shield className="w-3 h-3" />
                        UNDETECTED (WORKING)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-medium">
                        <Clock className="w-3 h-3" />
                        MAINTENANCE
                      </span>
                    )}
                  </div>

                  {/* Buy Now Button */}
                  <Link
                    href={`/store/${gameSlug}/${product.slug}`}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#1a1a1a] hover:bg-[#252525] border border-[#333] rounded-lg text-white font-medium transition-all duration-200 active:scale-[0.98]"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Buy Now
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Back to Store Link */}
        <div className="mt-12 text-center">
          <Link
            href="/store"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <span>&larr;</span>
            Back to All Games
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
