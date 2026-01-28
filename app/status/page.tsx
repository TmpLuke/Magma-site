"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Wrench, 
  Activity,
  Shield,
  Zap,
  TrendingUp,
  Clock,
  Server,
  ArrowRight,
  Sparkles,
  Radio,
} from "lucide-react";
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
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [autoRefreshCountdown, setAutoRefreshCountdown] = useState(30);

  useEffect(() => {
    loadProducts();
    
    // Auto-refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      loadProducts();
      setLastRefresh(new Date());
      setAutoRefreshCountdown(30);
    }, 30000);

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setAutoRefreshCountdown(prev => prev > 0 ? prev - 1 : 30);
    }, 1000);

    return () => {
      clearInterval(refreshInterval);
      clearInterval(countdownInterval);
    };
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

  const handleManualRefresh = () => {
    setLoading(true);
    loadProducts();
    setLastRefresh(new Date());
    setAutoRefreshCountdown(30);
  };

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

  // Calculate statistics
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.status === "active").length;
  const maintenanceProducts = products.filter(p => p.status === "maintenance").length;
  const inactiveProducts = products.filter(p => p.status === "inactive").length;
  const uptimePercentage = totalProducts > 0 ? Math.round((activeProducts / totalProducts) * 100) : 0;

  return (
    <main className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#dc2626]/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <Header />

      {/* Enhanced Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Badge */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#dc2626]/10 border border-[#dc2626]/20 rounded-full mb-6">
              <Radio className="w-4 h-4 text-[#dc2626] animate-pulse" />
              <span className="text-[#dc2626] text-sm font-semibold">Live Status Monitor</span>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight">
              <span className="block mb-2">Status Updates</span>
              <span className="text-white">For our </span>
              <span className="relative inline-block">
                <span className="text-[#dc2626]">Cheats</span>
                <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-[#dc2626] to-transparent" />
              </span>
            </h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto mb-8">
              Stay informed on the status of our cheats and hacks, with real-time updates to keep you in the loop.
            </p>

            {/* Auto-refresh indicator */}
            <div className="flex items-center justify-center gap-6 flex-wrap">
              <Button
                onClick={handleManualRefresh}
                disabled={loading}
                className="bg-gradient-to-r from-[#dc2626] to-[#ef4444] hover:from-[#ef4444] hover:to-[#dc2626] text-white border-0 shadow-lg shadow-[#dc2626]/20 hover:shadow-xl hover:shadow-[#dc2626]/30 hover:-translate-y-0.5 transition-all"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh Status
              </Button>

              <div className="flex items-center gap-2 px-4 py-2 bg-[#111111] border border-[#1a1a1a] rounded-lg">
                <Clock className="w-4 h-4 text-[#dc2626]" />
                <span className="text-white/80 text-sm">
                  Next refresh: <span className="font-bold text-[#dc2626]">{autoRefreshCountdown}s</span>
                </span>
              </div>
            </div>
          </div>

          {/* Enhanced Statistics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {/* Total Products */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#dc2626]/20 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
              <div className="relative bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 hover:border-[#dc2626]/30 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#dc2626]/10 flex items-center justify-center">
                    <Server className="w-6 h-6 text-[#dc2626]" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-[#dc2626]/50" />
                </div>
                <p className="text-4xl font-bold text-white mb-1">{totalProducts}</p>
                <p className="text-white/60 text-sm">Total Products</p>
              </div>
            </div>

            {/* Active Products */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500/20 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
              <div className="relative bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 hover:border-green-500/30 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-green-400 rounded-full blur animate-pulse" />
                    <div className="relative w-3 h-3 bg-green-400 rounded-full" />
                  </div>
                </div>
                <p className="text-4xl font-bold text-green-400 mb-1">{activeProducts}</p>
                <p className="text-white/60 text-sm">Working</p>
              </div>
            </div>

            {/* Maintenance Products */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500/20 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
              <div className="relative bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 hover:border-yellow-500/30 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                    <Wrench className="w-6 h-6 text-yellow-400" />
                  </div>
                  <Activity className="w-5 h-5 text-yellow-400/50 animate-pulse" />
                </div>
                <p className="text-4xl font-bold text-yellow-400 mb-1">{maintenanceProducts}</p>
                <p className="text-white/60 text-sm">Updating</p>
              </div>
            </div>

            {/* Uptime Percentage */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
              <div className="relative bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 hover:border-blue-500/30 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-blue-400" />
                  </div>
                  <Sparkles className="w-5 h-5 text-blue-400/50" />
                </div>
                <p className="text-4xl font-bold text-blue-400 mb-1">{uptimePercentage}%</p>
                <p className="text-white/60 text-sm">Uptime Rate</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Status Content */}
      <section className="pb-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Enhanced Status Legend */}
          <div className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 mb-8">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#dc2626]" />
                <span className="text-white font-semibold">Status Legend:</span>
              </div>
              
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 border-2 border-green-500/30 group hover:bg-green-500/20 transition-all">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-400 rounded-full blur animate-pulse" />
                  <div className="relative w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <span className="text-sm font-semibold text-green-400">UNDETECTED (WORKING)</span>
              </div>
              
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/10 border-2 border-yellow-500/30 group hover:bg-yellow-500/20 transition-all">
                <div className="relative">
                  <div className="absolute inset-0 bg-yellow-400 rounded-full blur animate-pulse" />
                  <div className="relative w-2.5 h-2.5 rounded-full bg-yellow-400" />
                </div>
                <span className="text-sm font-semibold text-yellow-400">UPDATING (NOT WORKING)</span>
              </div>
              
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border-2 border-red-500/30 group hover:bg-red-500/20 transition-all">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-400 rounded-full blur animate-pulse" />
                  <div className="relative w-2.5 h-2.5 rounded-full bg-red-400" />
                </div>
                <span className="text-sm font-semibold text-red-400">DETECTED (NOT WORKING)</span>
              </div>
            </div>
          </div>

          {/* Products List by Game */}
          {loading && products.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 bg-[#111111] border border-[#1a1a1a] rounded-2xl">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#1a1a1a]" />
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#dc2626] absolute top-0 left-0" />
              </div>
              <p className="text-white/60 mt-4">Loading status updates...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedProducts).map(([game, gameProducts]) => (
                <div key={game} className="animate-fade-in">
                  {/* Game Header */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className="h-8 w-1 bg-gradient-to-b from-[#dc2626] to-transparent rounded-full" />
                    <h2 className="text-white font-bold text-2xl uppercase tracking-wider">{game}</h2>
                    <div className="flex-1 h-px bg-gradient-to-r from-[#1a1a1a] to-transparent" />
                    <div className="px-3 py-1 bg-[#111111] border border-[#1a1a1a] rounded-lg">
                      <span className="text-white/60 text-sm font-medium">
                        {gameProducts.length} {gameProducts.length === 1 ? 'product' : 'products'}
                      </span>
                    </div>
                  </div>

                  {/* Products Grid */}
                  <div className="space-y-4">
                    {gameProducts.map((product, index) => (
                      <div
                        key={product.id}
                        className="group relative"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#dc2626]/20 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
                        <div className="relative bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 hover:border-[#dc2626]/30 transition-all">
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                            {/* Product Info */}
                            <div className="flex items-center gap-5 flex-1">
                              {/* Product Image */}
                              <div className="relative w-16 h-16 rounded-xl bg-[#0a0a0a] overflow-hidden border-2 border-[#1a1a1a] group-hover:border-[#dc2626]/30 transition-all flex-shrink-0">
                                {product.image ? (
                                  <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Server className="w-6 h-6 text-white/20" />
                                  </div>
                                )}
                              </div>

                              {/* Product Details */}
                              <div className="flex-1 min-w-0">
                                <h3 className="text-white font-bold text-lg mb-1 group-hover:text-[#dc2626] transition-colors truncate">
                                  {product.name}
                                </h3>
                                <div className="flex items-center gap-2 text-white/50 text-sm">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>
                                    Updated {new Date(product.updated_at).toLocaleDateString('en-US', { 
                                      month: 'short', 
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Status & Actions */}
                            <div className="flex flex-wrap items-center gap-4 lg:gap-6">
                              {/* Status Badge */}
                              <div className={`relative flex items-center gap-3 px-5 py-3 rounded-xl border-2 ${getStatusColor(product.status)} min-w-[220px] overflow-hidden group/status`}>
                                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 -translate-x-full group-hover/status:translate-x-full transition-transform duration-700" />
                                <div className="relative flex items-center gap-2">
                                  <div className="relative">
                                    <div className={`absolute inset-0 ${getStatusDotColor(product.status)} rounded-full blur animate-pulse`} />
                                    <div className={`relative w-3 h-3 rounded-full ${getStatusDotColor(product.status)}`} />
                                  </div>
                                  {getStatusIcon(product.status)}
                                </div>
                                <span className="text-sm font-bold whitespace-nowrap flex-1">{getStatusText(product.status)}</span>
                              </div>

                              {/* Purchase Button */}
                              <Link
                                href={`/store/${product.game.toLowerCase().replace(/\s+/g, "-")}/${product.slug}`}
                                className="relative px-6 py-3 bg-gradient-to-r from-[#dc2626] to-[#ef4444] hover:from-[#ef4444] hover:to-[#dc2626] text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-[#dc2626]/20 hover:shadow-xl hover:shadow-[#dc2626]/30 hover:-translate-y-0.5 flex items-center gap-2 whitespace-nowrap overflow-hidden group/btn"
                              >
                                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                                <span className="relative">Purchase Now</span>
                                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform relative" />
                              </Link>
                            </div>
                          </div>
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
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#dc2626]/20 to-transparent rounded-2xl blur opacity-50" />
              <div className="relative text-center py-20 bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a] rounded-2xl">
                <div className="w-20 h-20 bg-[#dc2626]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-10 h-10 text-[#dc2626]" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">No Products Yet</h3>
                <p className="text-white/50 max-w-md mx-auto">Add products in the admin panel to see them here</p>
              </div>
            </div>
          )}

          {/* Enhanced Discord Notice */}
          <div className="mt-16 relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#dc2626]/30 via-[#dc2626]/10 to-transparent rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative bg-gradient-to-br from-[#111111] to-[#0a0a0a] border-2 border-[#dc2626]/30 rounded-2xl p-10 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#dc2626]/5 rounded-full blur-3xl" />
              <div className="relative text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#dc2626]/10 border border-[#dc2626]/30 rounded-full mb-6">
                  <Radio className="w-4 h-4 text-[#dc2626] animate-pulse" />
                  <span className="text-[#dc2626] text-sm font-semibold">Stay Connected</span>
                </div>
                
                <h3 className="text-white font-bold text-3xl mb-3">Get Instant Status Updates</h3>
                <p className="text-white/60 text-lg mb-8 max-w-2xl mx-auto">
                  Join our Discord server for real-time status updates and instant notifications when products come back online.
                </p>
                
                <a
                  href="https://discord.gg/magmacheats"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative inline-flex items-center gap-3 bg-gradient-to-r from-[#dc2626] to-[#ef4444] hover:from-[#ef4444] hover:to-[#dc2626] text-white px-10 py-4 rounded-xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#dc2626]/40 overflow-hidden group/discord"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover/discord:translate-x-full transition-transform duration-700" />
                  <Radio className="w-5 h-5 relative" />
                  <span className="relative">Join Discord Server</span>
                  <ArrowRight className="w-5 h-5 group-hover/discord:translate-x-1 transition-transform relative" />
                </a>
              </div>
            </div>
          </div>

          {/* Enhanced Last Updated */}
          <div className="mt-8 flex items-center justify-center gap-6 flex-wrap">
            <div className="flex items-center gap-2 px-4 py-2 bg-[#111111] border border-[#1a1a1a] rounded-lg">
              <div className="relative">
                <div className="absolute inset-0 bg-[#dc2626] rounded-full blur animate-pulse" />
                <div className="relative w-2 h-2 bg-[#dc2626] rounded-full" />
              </div>
              <span className="text-sm text-white/60">
                Last refresh: <span className="text-white font-medium">{lastRefresh.toLocaleTimeString()}</span>
              </span>
            </div>
            
            <div className="flex items-center gap-2 px-4 py-2 bg-[#111111] border border-[#1a1a1a] rounded-lg">
              <RefreshCw className="w-3.5 h-3.5 text-[#dc2626]" />
              <span className="text-sm text-white/60">Auto-refreshes every 30 seconds</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .delay-500 {
          animation-delay: 500ms;
        }

        .delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </main>
  );
}