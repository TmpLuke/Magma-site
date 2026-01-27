"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { guideCategories, type Guide } from "@/lib/guides-data";
import { Gamepad2, Shield, Download, ChevronRight } from "lucide-react";

export default function GuidesPage() {
  const [selectedGuide, setSelectedGuide] = useState<Guide>(
    guideCategories[0].guides[3] // Default to Fortnite
  );

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Header />

      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="w-full lg:w-72 flex-shrink-0">
              <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-4 sticky top-24">
                {guideCategories.map((category, catIndex) => (
                  <div key={catIndex} className="mb-6 last:mb-0">
                    <div className="flex items-center gap-2 text-[#dc2626] text-sm font-semibold mb-3">
                      {category.icon === "gamepad" ? (
                        <Gamepad2 className="w-4 h-4" />
                      ) : (
                        <Shield className="w-4 h-4" />
                      )}
                      {category.name}
                    </div>
                    <nav className="space-y-1">
                      {category.guides.map((guide) => (
                        <button
                          key={guide.id}
                          onClick={() => setSelectedGuide(guide)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                            selectedGuide.id === guide.id
                              ? "bg-[#dc2626] text-white font-medium"
                              : "text-white/70 hover:bg-[#1a1a1a] hover:text-white"
                          }`}
                        >
                          {guide.game}
                        </button>
                      ))}
                    </nav>
                  </div>
                ))}
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Guide Header */}
              <div className="bg-gradient-to-r from-[#111111] to-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6 mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  {selectedGuide.title}
                </h1>
                <p className="text-white/60">{selectedGuide.subtitle}</p>
              </div>

              {/* Prerequisites Banner */}
              <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#dc2626]/20 flex items-center justify-center">
                    <Download className="w-4 h-4 text-[#dc2626]" />
                  </div>
                  <div>
                    <h2 className="text-[#dc2626] font-semibold">
                      Prerequisites Installation
                    </h2>
                    <p className="text-white/60 text-sm">
                      Complete these steps in order before proceeding to cheat
                      setup
                    </p>
                  </div>
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-6">
                {selectedGuide.steps.map((step, index) => (
                  <div
                    key={index}
                    className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-6 transition-all duration-300 hover:border-[#dc2626]/30"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-10 h-10 rounded-full bg-[#dc2626] flex items-center justify-center text-white font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg">
                          {step.title}
                        </h3>
                        <p className="text-white/60 text-sm">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    <div className="ml-14">
                      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-4 mb-4">
                        <ol className="space-y-2">
                          {step.instructions.map((instruction, instIndex) => (
                            <li
                              key={instIndex}
                              className="flex items-start gap-2 text-white/80 text-sm"
                            >
                              <span className="text-white/50">
                                {instIndex + 1}.
                              </span>
                              {instruction}
                            </li>
                          ))}
                        </ol>
                      </div>

                      {step.downloadUrl && (
                        <a
                          href={step.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-[#dc2626] hover:bg-[#ef4444] text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 hover:shadow-lg hover:shadow-[#dc2626]/25"
                        >
                          <Download className="w-4 h-4" />
                          {step.downloadLabel}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Need Help */}
              <div className="mt-8 bg-gradient-to-r from-[#dc2626]/10 to-transparent border border-[#dc2626]/20 rounded-xl p-6">
                <h3 className="text-white font-bold mb-2">Need Help?</h3>
                <p className="text-white/60 text-sm mb-4">
                  If you encounter any issues during setup, our support team is
                  here to help.
                </p>
                <a
                  href="https://discord.gg/magmacheats"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#dc2626] hover:text-[#ef4444] text-sm font-medium transition-colors"
                >
                  Join our Discord for support
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
