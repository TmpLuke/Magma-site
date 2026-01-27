"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { mockProducts } from "@/lib/admin-mock-data";
import Link from "next/link";
import Image from "next/image";

type StatusType = "undetected" | "use_at_own_risk" | "updating" | "detected" | "testing";

interface CheatItem {
  id: string;
  name: string;
  game: string;
  slug: string;
  status: StatusType;
  windows: string;
  undetectedSince?: string;
  image: string;
}

// Status configurations
const statusConfig = {
  undetected: {
    label: "UNDETECTED (WORKING)",
    color: "text-green-400",
    bg: "bg-green-500/20",
    border: "border-green-500/30",
    dotColor: "bg-green-400",
  },
  use_at_own_risk: {
    label: "USE AT OWN RISK (WORKING)",
    color: "text-yellow-400",
    bg: "bg-yellow-500/20",
    border: "border-yellow-500/30",
    dotColor: "bg-yellow-400",
  },
  updating: {
    label: "UPDATING (NOT WORKING)",
    color: "text-orange-400",
    bg: "bg-orange-500/20",
    border: "border-orange-500/30",
    dotColor: "bg-orange-400",
  },
  detected: {
    label: "DETECTED (NOT WORKING)",
    color: "text-red-400",
    bg: "bg-red-500/20",
    border: "border-red-500/30",
    dotColor: "bg-red-400",
  },
  testing: {
    label: "TESTING (WORKING)",
    color: "text-purple-400",
    bg: "bg-purple-500/20",
    border: "border-purple-500/30",
    dotColor: "bg-purple-400",
  },
};

// Game categories for filtering
const gameCategories = [
  "ALL",
  "RUST",
  "FORTNITE",
  "APEX LEGENDS",
  "HWID SPOOFERS",
  "MARVEL RIVALS",
  "RAINBOW SIX SIEGE",
  "ESCAPE FROM TARKOV",
  "DELTA FORCE",
  "PUBG",
  "DAYZ",
];

// Transform mock products to cheat items with varied statuses
const cheatItems: CheatItem[] = mockProducts.map((product, index) => {
  const statuses: StatusType[] = ["undetected", "undetected", "undetected", "use_at_own_risk", "updating", "testing"];
  return {
    id: product.id,
    name: product.name,
    game: product.game,
    slug: product.slug,
    status: statuses[index % statuses.length],
    windows: "Windows 10 & 11",
    undetectedSince: "Jan 2026",
    image: product.image,
  };
});

export default function StatusPage() {
  const [activeFilter, setActiveFilter] = useState("ALL");

  const filteredCheats = activeFilter === "ALL" 
    ? cheatItems 
    : cheatItems.filter(item => 
        item.game.toUpperCase().includes(activeFilter) || 
        (activeFilter === "HWID SPOOFERS" && item.game === "Universal")
      );

  // Group cheats by game
  const groupedCheats = filteredCheats.reduce((acc, cheat) => {
    const game = cheat.game;
    if (!acc[game]) {
      acc[game] = [];
    }
    acc[game].push(cheat);
    return acc;
  }, {} as Record<string, CheatItem[]>);

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
          <p className="text-white/60 max-w-2xl mx-auto">
            Stay informed on the status of our cheats and hacks, with real-time updates to keep you in the loop.
          </p>
        </div>
      </section>

      {/* Status Content */}
      <section className="pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Status Legend */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            <span className="text-white font-semibold mr-2">Status</span>
            {Object.entries(statusConfig).map(([key, config]) => (
              <div
                key={key}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bg} border ${config.border}`}
              >
                <span className={`w-2 h-2 rounded-full ${config.dotColor}`} />
                <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20">
              <span className="w-2 h-2 rounded-full bg-white" />
              <span className="text-xs font-medium text-white">0 HOURS</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#dc2626]/20 border border-[#dc2626]/30">
              <span className="w-2 h-2 rounded-full bg-[#dc2626]" />
              <span className="text-xs font-medium text-[#dc2626]">100+ HOURS</span>
            </div>
          </div>

          {/* Game Filter Tabs */}
          <div className="mb-8 overflow-x-auto pb-2">
            <div className="flex items-center gap-2 min-w-max">
              {gameCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveFilter(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                    activeFilter === category
                      ? "bg-[#dc2626] text-white"
                      : "bg-[#1a1a1a] text-white/60 hover:text-white hover:bg-[#262626]"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            {/* Active tab underline */}
            <div className="h-0.5 bg-[#dc2626] mt-2 rounded-full" />
          </div>

          {/* Cheats List by Game */}
          <div className="space-y-8">
            {Object.entries(groupedCheats).map(([game, cheats]) => (
              <div key={game}>
                <h2 className="text-white font-bold text-lg mb-4 uppercase tracking-wider">{game}</h2>
                <div className="space-y-3">
                  {cheats.map((cheat) => {
                    const config = statusConfig[cheat.status];
                    return (
                      <div
                        key={cheat.id}
                        className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#dc2626]/30 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-[#1a1a1a] overflow-hidden relative flex-shrink-0">
                            <Image
                              src={cheat.image || "/placeholder.svg"}
                              alt={cheat.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="text-white font-semibold">{cheat.name}</h3>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                          <div className="text-right">
                            <p className="text-white/40 text-xs uppercase">Undetected Since:</p>
                            <p className="text-white text-sm">{cheat.windows}</p>
                          </div>

                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bg} border ${config.border}`}>
                            <span className={`w-2 h-2 rounded-full ${config.dotColor}`} />
                            <span className={`text-xs font-medium ${config.color} whitespace-nowrap`}>{config.label}</span>
                          </div>

                          <Link
                            href={`/store/${cheat.slug}`}
                            className="px-5 py-2 bg-[#dc2626] hover:bg-[#ef4444] text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
                          >
                            Purchase Now
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* No results */}
          {Object.keys(groupedCheats).length === 0 && (
            <div className="text-center py-12">
              <p className="text-white/50">No cheats found for this category.</p>
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
        </div>
      </section>

      <Footer />
    </main>
  );
}
