"use client";

import { ArrowRight } from "lucide-react";
import { useEffect, useState, useRef } from "react";

const faqs = [
  {
    question: "Which Product Should I Buy?",
    answer: `Each cheat is built specifically for its respective game, offering different features and compatibility levels. Before purchasing, make sure the product status shows "Undetected (Working)", confirm that it supports your Windows version, and look for products labeled as the "Safest Option" for the best protection against detection.

If you're still unsure which product to choose, feel free to contact our support team — we'll help you pick the safest and most compatible option for your setup.`,
  },
  {
    question: "What's the difference between cheats?",
    answer: `The difference comes down to the game supported, included features, and customization. Some cheats include advanced visuals or extra aimbot features, while others are optimized for maximum stealth. Full comparisons are available on each product's page.`,
  },
  {
    question: "Will this get me banned?",
    answer: `Our software is carefully developed to stay undetected using the latest bypass methods. We recommend to use cheats labeled as "Safest Option" and avoid suspicious gameplay to reduce detection risk.`,
  },
  {
    question: "Which Product Should I Buy?",
    answer: `Each cheat is built specifically for its respective game, offering different features and compatibility levels. Before purchasing, make sure the product status shows "Undetected (Working)", confirm that it supports your Windows version, and look for products labeled as the "Safest Option" for the best protection against detection.

If you're still unsure which product to choose, feel free to contact our support team — we'll help you pick the safest and most compatible option for your setup.`,
  },
  {
    question: "Which Product Should I Buy?",
    answer: `Each cheat is built specifically for its respective game, offering different features and compatibility levels. Before purchasing, make sure the product status shows "Undetected (Working)", confirm that it supports your Windows version, and look for products labeled as the "Safest Option" for the best protection against detection.

If you're still unsure which product to choose, feel free to contact our support team — we'll help you pick the safest and most compatible option for your setup.`,
  },
];

export function FAQ() {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left column - Title */}
          <div
            className={`lg:col-span-1 transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-10"
            }`}
          >
            <h2
              className="text-3xl md:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Frequently Asked
              <br />
              <span className="text-[#dc2626] relative inline-block">
                Questions
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-[#dc2626] to-transparent rounded-full" />
              </span>
            </h2>
            <p className="text-white/60 mb-8">
              Browse common questions and get clear answers without digging
              through support.
            </p>
            <button className="group inline-flex items-center gap-2 border border-white/20 hover:border-[#dc2626] text-white hover:text-[#dc2626] px-6 py-3 rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-[#dc2626]/10 active:scale-95">
              View all questions
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>

          {/* Right column - FAQ items */}
          <div className="lg:col-span-2 space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`relative bg-gradient-to-r from-[#111111] to-[#0a1010] border border-[#262626] rounded-xl p-6 transition-all duration-500 hover:border-[#dc2626]/50 hover:shadow-lg hover:shadow-[#dc2626]/5 cursor-pointer ${
                  isVisible
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-10"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Glow effect on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-r from-[#dc2626]/5 to-transparent rounded-xl transition-opacity duration-500 ${
                    hoveredIndex === index ? "opacity-100" : "opacity-0"
                  }`}
                />

                <div className="relative flex items-start gap-4">
                  <div
                    className={`w-8 h-8 rounded-full bg-[#dc2626] flex items-center justify-center text-white font-bold text-sm flex-shrink-0 transition-all duration-300 ${
                      hoveredIndex === index ? "scale-110 shadow-lg shadow-[#dc2626]/30" : ""
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <h3
                      className={`text-white font-bold text-lg mb-3 transition-colors duration-300 ${
                        hoveredIndex === index ? "text-[#dc2626]" : ""
                      }`}
                    >
                      {faq.question}
                    </h3>
                    <p className="text-white/60 text-sm leading-relaxed whitespace-pre-line">
                      {faq.answer.split("contact our support team").map((part, i, arr) =>
                        i < arr.length - 1 ? (
                          <span key={i}>
                            {part}
                            <a
                              href="https://discord.gg/magmacheats"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-white underline hover:text-[#dc2626] transition-colors duration-300"
                            >
                              contact our support team
                            </a>
                          </span>
                        ) : (
                          part
                        )
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
