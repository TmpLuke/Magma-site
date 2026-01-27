"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";

const undetectedCheats = [
  "Arc Raiders",
  "Rainbow Six Siege",
  "Battlefield 6",
  "Black Ops & WZ",
  "Rust",
  "PUBG",
  "Fortnite",
  "Apex Legends",
  "EFT",
  "Marvel Rivals",
];

const otherLinks = [
  "Customer Support",
  "Terms of Service",
  "Refund Policy",
  "Privacy Policy",
];

export function Footer() {
  const [isVisible, setIsVisible] = useState(false);
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <footer
      ref={footerRef}
      className="bg-[#0a0a0a] border-t border-[#1a1a1a] pt-12 sm:pt-16 pb-8"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-12">
          {/* Brand column */}
          <div
            className={`lg:col-span-1 text-center md:text-left transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            {/* Logo */}
            <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
              <div className="relative transition-transform duration-300 group-hover:scale-110">
                <Image
                  src="/images/magma-logo.png"
                  alt="Magma Cheats"
                  width={140}
                  height={40}
                  className="transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(220,38,38,0.5)]"
                />
              </div>
            </Link>

            <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-sm mx-auto md:mx-0">
              At Magma Cheats, we specialize in developing elite cheats and
              hacks for a variety of online PC games. We prioritize customer
              satisfaction, offering round-the-clock support so you never miss a
              beat. Ready to dominate the game without limits? Get started with
              Magma Cheats today!
            </p>

            {/* Social links */}
            <div className="flex items-center justify-center md:justify-start gap-3">
              {[
                {
                  name: "Discord",
                  path: "M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z",
                },
                {
                  name: "YouTube",
                  path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
                },
                {
                  name: "GitHub",
                  path: "M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z",
                },
              ].map((social, index) => (
                <Link
                  key={index}
                  href="#"
                  className="w-12 h-12 sm:w-10 sm:h-10 rounded-full bg-[#1a1a1a] hover:bg-[#dc2626] flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 hover:shadow-lg hover:shadow-[#dc2626]/30 group"
                >
                  <svg
                    className="w-5 h-5 text-white group-hover:text-white transition-colors duration-300"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d={social.path} />
                  </svg>
                </Link>
              ))}
            </div>
          </div>

          {/* Undetected Cheats column */}
          <div
            className={`lg:col-span-2 transition-all duration-1000 delay-200 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h3 className="text-white/50 text-sm tracking-wider mb-4">
              Undetected Cheats
            </h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-1">
              {undetectedCheats.map((cheat, index) => (
                <Link
                  key={index}
                  href="#"
                  className="text-white hover:text-[#dc2626] text-sm transition-all duration-300 hover:translate-x-1 py-2"
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  {cheat}
                </Link>
              ))}
            </div>
          </div>

          {/* Other Links column */}
          <div
            className={`transition-all duration-1000 delay-400 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h3 className="text-white/50 text-sm tracking-wider mb-4">
              Other Links
            </h3>
            <div className="space-y-1">
              {otherLinks.map((link, index) => (
                <Link
                  key={index}
                  href="#"
                  className="block text-white hover:text-[#dc2626] text-sm transition-all duration-300 hover:translate-x-1 py-2"
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  {link}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div
          className={`border-t border-[#1a1a1a] pt-8 transition-all duration-1000 delay-500 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <p className="text-white/40 text-sm text-center">
            &copy; 2025 Magma Cheats. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
