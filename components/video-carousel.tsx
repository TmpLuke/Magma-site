"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";

const videos = [
  {
    title: "How to use Battlefield 6 Cheats and NEVER get banned..",
    thumbnail: "battlefield-6",
    youtubeId: "n3qSwEew7Ec",
  },
  {
    title: "ChatGPT Made Me Arc Raiders CHEATS..",
    thumbnail: "arc-raiders",
    youtubeId: "Ba7A2Y2q5qM",
  },
  {
    title: "How to use Rust Cheats and NEVER get ...",
    thumbnail: "rust-cheats",
    youtubeId: "Agh0EjofPZY",
  },
];

export function VideoCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
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

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % videos.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length);
  };

  const handleVideoClick = (youtubeId: string | null) => {
    if (youtubeId) {
      setPlayingVideo(youtubeId);
    }
  };

  return (
    <section ref={sectionRef} className="py-20 bg-[#0a0a0a] relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#dc2626]/5 blur-[120px] rounded-full" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div
          className={`flex items-start justify-between mb-12 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-3">
              Insights that
              <br />
              <span className="text-[#dc2626] relative inline-block group">
                power performance
                {/* Animated underline */}
                <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-[#dc2626] via-[#ef4444] to-transparent rounded-full transform origin-left transition-all duration-500" />
                {/* Glow effect */}
                <span className="absolute -bottom-2 left-0 w-3/4 h-1 bg-gradient-to-r from-[#dc2626] to-transparent rounded-full blur-md opacity-60" />
              </span>
            </h2>
            <p className="text-white/50 mt-4 max-w-md">
              Watch real gameplay demonstrations and learn from expert tutorials
            </p>
          </div>

          {/* Navigation arrows with enhanced styling */}
          <div className="flex items-center gap-3">
            <button
              onClick={prevSlide}
              className="group relative w-12 h-12 rounded-full bg-[#dc2626]/10 hover:bg-[#dc2626]/20 border border-[#dc2626]/20 hover:border-[#dc2626]/40 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
            >
              {/* Glow */}
              <div className="absolute inset-0 rounded-full bg-[#dc2626]/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <ChevronLeft className="relative z-10 w-6 h-6 text-[#dc2626] transition-transform duration-300 group-hover:-translate-x-0.5" />
            </button>
            <button
              onClick={nextSlide}
              className="group relative w-12 h-12 rounded-full bg-[#dc2626] hover:bg-[#ef4444] flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 overflow-hidden"
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              {/* Glow */}
              <div className="absolute -inset-1 bg-[#dc2626] blur-lg opacity-50 group-hover:opacity-70 transition-opacity duration-300" />
              <ChevronRight className="relative z-10 w-6 h-6 text-white transition-transform duration-300 group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {videos.map((video, index) => {
            const isPlaying = playingVideo === video.youtubeId;
            const isHovered = hoveredCard === index;
            
            return (
              <div
                key={index}
                onClick={() => handleVideoClick(video.youtubeId)}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
                className={`group relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-[#1a1010] to-[#0a0a0a] border-2 cursor-pointer transition-all duration-700 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                } ${
                  isPlaying 
                    ? "shadow-[0_0_40px_rgba(220,38,38,0.5)] border-[#dc2626] scale-105" 
                    : isHovered 
                    ? "border-[#dc2626]/70 scale-[1.03] shadow-xl shadow-[#dc2626]/20" 
                    : "border-[#262626] hover:border-[#dc2626]/50"
                }`}
                style={{ transitionDelay: `${(index + 1) * 150}ms` }}
              >
                {/* Multi-layered glow effect */}
                <div className={`absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#dc2626]/20 via-[#dc2626]/10 to-[#dc2626]/20 blur-xl transition-opacity duration-700 ${
                  isPlaying ? "opacity-100" : isHovered ? "opacity-70" : "opacity-0"
                }`} />
                <div className={`absolute -inset-2 rounded-2xl bg-gradient-to-r from-[#dc2626]/10 to-[#dc2626]/10 blur-2xl transition-opacity duration-700 ${
                  isPlaying ? "opacity-100" : "opacity-0"
                }`} />
                
                {isPlaying && video.youtubeId ? (
                  /* YouTube Embed */
                  <div className="relative w-full h-full animate-fadeIn">
                    <iframe
                      className="absolute inset-0 w-full h-full z-10"
                      src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <>
                    {/* YouTube Thumbnail */}
                    {video.youtubeId && (
                      <img
                        src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                        alt={video.title}
                        className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
                          isHovered ? "scale-110" : "scale-100"
                        }`}
                        onError={(e) => {
                          // Fallback to standard quality if high quality fails
                          e.currentTarget.src = `https://img.youtube.com/vi/${video.youtubeId}/0.jpg`;
                        }}
                      />
                    )}
                    
                    {/* Gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br transition-all duration-500 ${
                      isHovered 
                        ? "from-[#dc2626]/30 via-[#dc2626]/10 to-transparent" 
                        : "from-[#dc2626]/10 to-transparent"
                    }`} />

                    {/* Play button with enhanced animation */}
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <div className={`relative transition-all duration-500 ${
                        isHovered ? "scale-110" : "scale-100"
                      }`}>
                        {/* Pulsing ring */}
                        <div className={`absolute inset-0 rounded-full bg-red-600/30 transition-all duration-700 ${
                          isHovered ? "scale-150 opacity-0" : "scale-100 opacity-100"
                        }`} />
                        
                        {/* Button */}
                        <button className="relative w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center transition-all duration-300 shadow-xl shadow-red-600/50 group-hover:shadow-2xl group-hover:shadow-red-600/60">
                          {/* Inner glow */}
                          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
                          <Play className="relative z-10 w-6 h-6 text-white fill-white ml-1" />
                        </button>
                      </div>
                    </div>

                    {/* Multi-directional shimmer effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent -translate-y-full group-hover:translate-y-full transition-transform duration-1200 delay-100" />
                    </div>

                    {/* Title overlay on hover */}
                    <div className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/50 to-transparent transition-all duration-500 ${
                      isHovered ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                    }`}>
                      <h3 className="text-white font-semibold text-sm line-clamp-2">
                        {video.title}
                      </h3>
                    </div>

                    {/* Corner accents */}
                    <div className={`absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-[#dc2626]/50 rounded-tl-lg transition-all duration-500 ${
                      isHovered ? "w-12 h-12 border-[#dc2626]" : ""
                    }`} />
                    <div className={`absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-[#dc2626]/50 rounded-br-lg transition-all duration-500 ${
                      isHovered ? "w-12 h-12 border-[#dc2626]" : ""
                    }`} />
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </section>
  );
}