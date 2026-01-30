"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { ArrowUpRight } from "lucide-react";

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

const socialLinks = [
  {
    name: "Discord",
    href: "https://discord.gg/magmacheats",
    path: "M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z",
  },
  {
    name: "YouTube",
    href: "#",
    path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  },
  {
    name: "GitHub",
    href: "#",
    path: "M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z",
  },
];

export function Footer() {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
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
      className="bg-[#0a0a0a] border-t-2 border-[#1a1a1a] pt-12 sm:pt-16 pb-8 relative overflow-hidden"
    >
      {/* Background accents */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#dc2626]/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#dc2626]/3 blur-[100px] rounded-full" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-12">
          {/* Brand column */}
          <div
            className={`lg:col-span-1 text-center md:text-left transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            {/* Logo with enhanced hover */}
            <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute -inset-3 bg-[#dc2626]/20 blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-full" />
                
                <Image
                  src="/images/magma-logo.png"
                  alt="Magma Cheats"
                  width={140}
                  height={40}
                  className="relative transition-all duration-300 group-hover:scale-105"
                  style={{
                    filter: 'drop-shadow(0 0 0px rgba(220, 38, 38, 0))',
                    transition: 'filter 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.filter = 'drop-shadow(0 0 12px rgba(220, 38, 38, 0.6))';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.filter = 'drop-shadow(0 0 0px rgba(220, 38, 38, 0))';
                  }}
                />
              </div>
            </Link>

            <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-sm mx-auto md:mx-0">
              At Magma Cheats, we specialize in developing elite cheats and
              hacks for a variety of online PC games. We prioritize customer
              satisfaction, offering round-the-clock support so you never miss a
              beat.
            </p>

            {/* Social links with enhanced effects */}
            <div className="flex items-center justify-center md:justify-start gap-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative w-11 h-11 rounded-xl bg-[#1a1a1a] hover:bg-[#dc2626] flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 overflow-hidden"
                  style={{
                    transitionDelay: `${index * 50}ms`,
                  }}
                >
                  {/* Shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  
                  {/* Glow */}
                  <div className="absolute -inset-1 bg-[#dc2626] blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
                  
                  <svg
                    className="relative z-10 w-5 h-5 text-white transition-all duration-300 group-hover:scale-110"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d={social.path} />
                  </svg>
                </a>
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
            <h3 className="text-white/40 text-sm font-semibold tracking-wider mb-6 uppercase">
              Undetected Cheats
            </h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
              {undetectedCheats.map((cheat, index) => (
                <Link
                  key={index}
                  href="#"
                  onMouseEnter={() => setHoveredLink(cheat)}
                  onMouseLeave={() => setHoveredLink(null)}
                  className="group relative text-white/70 hover:text-[#dc2626] text-sm py-2 transition-all duration-300 inline-flex items-center gap-2"
                  style={{ transitionDelay: `${index * 30}ms` }}
                >
                  {/* Animated dot */}
                  <span className={`w-1 h-1 rounded-full bg-[#dc2626] transition-all duration-300 ${
                    hoveredLink === cheat ? "scale-150 shadow-[0_0_6px_rgba(220,38,38,0.8)]" : "scale-0"
                  }`} />
                  
                  <span className="relative">
                    {cheat}
                    {/* Underline */}
                    <span className="absolute -bottom-0.5 left-0 right-0 h-px bg-[#dc2626] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  </span>
                  
                  {/* Arrow icon */}
                  <ArrowUpRight className={`w-3 h-3 transition-all duration-300 ${
                    hoveredLink === cheat ? "opacity-100 translate-x-0.5 -translate-y-0.5" : "opacity-0"
                  }`} />
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
            <h3 className="text-white/40 text-sm font-semibold tracking-wider mb-6 uppercase">
              Other Links
            </h3>
            <div className="space-y-2">
              {otherLinks.map((link, index) => (
                <Link
                  key={index}
                  href="#"
                  onMouseEnter={() => setHoveredLink(link)}
                  onMouseLeave={() => setHoveredLink(null)}
                  className="group relative block text-white/70 hover:text-[#dc2626] text-sm py-2 transition-all duration-300 inline-flex items-center gap-2"
                  style={{ transitionDelay: `${index * 30}ms` }}
                >
                  {/* Animated dot */}
                  <span className={`w-1 h-1 rounded-full bg-[#dc2626] transition-all duration-300 ${
                    hoveredLink === link ? "scale-150 shadow-[0_0_6px_rgba(220,38,38,0.8)]" : "scale-0"
                  }`} />
                  
                  <span className="relative">
                    {link}
                    {/* Underline */}
                    <span className="absolute -bottom-0.5 left-0 right-0 h-px bg-[#dc2626] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  </span>
                  
                  {/* Arrow icon */}
                  <ArrowUpRight className={`w-3 h-3 transition-all duration-300 ${
                    hoveredLink === link ? "opacity-100 translate-x-0.5 -translate-y-0.5" : "opacity-0"
                  }`} />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Divider with gradient */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-[#1a1a1a]" />
          </div>
          <div className="relative flex justify-center">
            <div className="w-20 h-1 bg-gradient-to-r from-transparent via-[#dc2626]/50 to-transparent blur-sm" />
          </div>
        </div>

        {/* Copyright section with enhanced styling */}
        <div
          className={`flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-1000 delay-500 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <p className="text-white/40 text-sm text-center sm:text-left">
            &copy; 2025 Magma Cheats. All rights reserved.
          </p>
          
          {/* Additional links */}
          <div className="flex items-center gap-6 text-xs text-white/30">
            <Link href="#" className="hover:text-[#dc2626] transition-colors duration-300">
              Privacy
            </Link>
            <span>•</span>
            <Link href="#" className="hover:text-[#dc2626] transition-colors duration-300">
              Terms
            </Link>
            <span>•</span>
            <Link href="#" className="hover:text-[#dc2626] transition-colors duration-300">
              Cookies
            </Link>
          </div>
        </div>

        {/* Scroll to top button */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className={`group fixed bottom-8 right-8 w-12 h-12 rounded-full bg-[#dc2626] hover:bg-[#ef4444] flex items-center justify-center shadow-xl shadow-[#dc2626]/30 transition-all duration-300 hover:scale-110 active:scale-95 overflow-hidden ${
            isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {/* Shimmer */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          
          {/* Glow */}
          <div className="absolute -inset-1 bg-[#dc2626] blur-lg opacity-50 group-hover:opacity-70 transition-opacity duration-300" />
          
          <svg
            className="relative z-10 w-5 h-5 text-white transition-transform duration-300 group-hover:-translate-y-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </button>
      </div>
    </footer>
  );
}