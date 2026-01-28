"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle, AlertCircle, Wrench } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  slug: string;
  game: string;
  status: string;
  image: string | null;
  updated_at: string;
}

export default function StatusPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadProducts, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadProducts() {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("products")
        .select("id, name, slug, game, status, image, updated_at")
        .order("name");

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "inactive":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "maintenance":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-5 h-5" />;
      case "inactive":
        return <AlertCircle className="w-5 h-5" />;
      case "maintenance":
        return <Wrench className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "UNDETECTED (WORKING)";
      case "inactive":
        return "DETECTED (NOT WORKING)";
      case "maintenance":
        return "UPDATING (NOT WORKING)";
      default:
        return status.toUpperCase();
    }
  };

  const getStatusDotColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-400";
      case "inactive":
        return "bg-red-400";
      case "maintenance":
        return "bg-yellow-400";
      default:
        return "bg-gray-400";
    }
  };

  // Group products by game
  const groupedProducts = products.reduce((acc, product) => {
    const game = product.game;
    if (!acc[game]) {
      acc[game] = [];
    }
    acc[game].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a0808] via-[#0a0a0a] to-[#0a0a0a]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#dc2626]/5 blur-[100px] rounded-full" />
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4" style={{ fontFamily: "Georgia, serif" }}>
            Status Updates
            <br />
            <span className="text-white">For our </span>
            <span className="text-[#dc2626]">Cheats</span>
          </h1>
          <p className="text-white/60 max-w-2xl mx-auto mb-6">
            Stay informed on the status of our cheats and hacks, with real-time updates to keep you in the loop.
          </p>
          <Button
            onClick={() => loadProducts()}
            variant="outline"
            size="sm"
            disabled={loading}
            className="bg-[#1a1a1a] border-[#262626] text-white hover:bg-[#262626]"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh Status
          </Button>
        </div>
      </section>

      {/* Status Content */}
      <section className="pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Status Legend */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            <span className="text-white font-semibold mr-2">Status Legend:</span>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/20 border border-green-500/30">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-xs font-medium text-green-400">UNDETECTED (WORKING)</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/20 border border-yellow-500/30">
              <span className="w-2 h-2 rounded-full bg-yellow-400" />
              <span className="text-xs font-medium text-yellow-400">UPDATING (NOT WORKING)</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/30">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-xs font-medium text-red-400">DETECTED (NOT WORKING)</span>
            </div>
          </div>

          {/* Products List by Game */}
          {loading && products.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#dc2626]" />
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedProducts).map(([game, gameProducts]) => (
                <div key={game}>
                  <h2 className="text-white font-bold text-lg mb-4 uppercase tracking-wider">{game}</h2>
                  <div className="space-y-3">
                    {gameProducts.map((product) => (
                      <div
                        key={product.id}
                        className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#dc2626]/30 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-[#1a1a1a] overflow-hidden relative flex-shrink-0">
                            {product.image ? (
                              <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-white/20 text-xs">No image</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="text-white font-semibold">{product.name}</h3>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${getStatusColor(product.status)}`}>
                            <span className={`w-2 h-2 rounded-full ${getStatusDotColor(product.status)}`} />
                            <span className="text-xs font-medium whitespace-nowrap">{getStatusText(product.status)}</span>
                          </div>

                          <Link
                            href={`/store/${product.game.toLowerCase().replace(/\s+/g, "-")}/${product.slug}`}
                            className="px-5 py-2 bg-[#dc2626] hover:bg-[#ef4444] text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
                          >
                            Purchase Now
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No products */}
          {products.length === 0 && !loading && (
            <div className="text-center py-16 bg-[#111111] border border-[#1a1a1a] rounded-xl">
              <AlertCircle className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Products Yet</h3>
              <p className="text-white/50">Add products in the admin panel to see them here</p>
            </div>
          )}

          {/* Discord Notice */}
          <div className="mt-16 bg-gradient-to-r from-[#dc2626]/10 to-transparent border border-[#dc2626]/20 rounded-xl p-8 text-center">
            <h3 className="text-white font-bold text-xl mb-2">Stay Updated</h3>
            <p className="text-white/60 text-sm mb-6 max-w-lg mx-auto">
              Join our Discord server for real-time status updates and instant notifications when products come back online.
            </p>
            <a
              href="https://discord.gg/magmacheats"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#dc2626] hover:bg-[#ef4444] text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105"
            >
              Join Discord
            </a>
          </div>

          {/* Last Updated */}
          <div className="mt-8 text-center text-sm text-white/30">
            Last page refresh: {new Date().toLocaleString()} • Auto-refreshes every 30 seconds
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
