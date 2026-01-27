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
    youtubeId: null,
  },
  {
    title: "How to use Rust Cheats and NEVER get ...",
    thumbnail: "rust-cheats",
    youtubeId: null,
  },
];

export function VideoCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
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
    <section ref={sectionRef} className="py-20 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className={`flex items-start justify-between mb-8 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Insights that
            <br />
            <span className="text-[#dc2626] relative inline-block">
              power performance
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-[#dc2626] to-transparent rounded-full" />
            </span>
          </h2>

          {/* Navigation arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={prevSlide}
              className="w-12 h-12 rounded-full bg-[#dc2626]/20 hover:bg-[#dc2626]/30 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
            >
              <ChevronLeft className="w-6 h-6 text-[#dc2626]" />
            </button>
            <button
              onClick={nextSlide}
              className="w-12 h-12 rounded-full bg-[#dc2626] hover:bg-[#ef4444] flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#dc2626]/30 active:scale-95"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {videos.map((video, index) => {
            const isPlaying = playingVideo === video.youtubeId;
            
            return (
              <div
                key={index}
                onClick={() => handleVideoClick(video.youtubeId)}
                className={`group relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-[#1a1010] to-[#0a0a0a] border border-[#262626] cursor-pointer transition-all duration-500 hover:border-[#dc2626]/50 hover:shadow-xl hover:shadow-[#dc2626]/10 hover:scale-[1.02] ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                } ${isPlaying ? "shadow-[0_0_30px_rgba(220,38,38,0.4)] border-[#dc2626]/70" : ""}`}
                style={{ transitionDelay: `${(index + 1) * 150}ms` }}
              >
                {/* Reactive glow effect */}
                <div className={`absolute -inset-1 rounded-xl bg-gradient-to-r from-[#dc2626]/20 via-[#dc2626]/10 to-[#dc2626]/20 blur-xl transition-opacity duration-500 ${isPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-50"}`} />
                
                {isPlaying && video.youtubeId ? (
                  /* YouTube Embed */
                  <iframe
                    className="absolute inset-0 w-full h-full z-10"
                    src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <>
                    {/* YouTube Thumbnail for videos with youtubeId */}
                    {video.youtubeId && (
                      <img
                        src={`https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
                        alt={video.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    )}
                    
                    {/* Video thumbnail placeholder overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#dc2626]/10 to-transparent group-hover:from-[#dc2626]/20 transition-all duration-500" />

                    {/* Top bar */}
                    <div className="absolute top-0 left-0 right-0 bg-black/70 backdrop-blur-sm px-3 py-2 flex items-center gap-2 transition-all duration-300 group-hover:bg-black/80 z-10">
                      <div className="w-6 h-6 rounded bg-[#dc2626]/20 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 40 40"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M8 32L20 8L32 32H8Z" fill="#dc2626" />
                        </svg>
                      </div>
                      <span className="text-white text-xs font-medium truncate">
                        {video.title}
                      </span>
                    </div>

                    {/* Content placeholder - only show if no thumbnail */}
                    {!video.youtubeId && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-1/2 h-1/2 bg-gradient-to-b from-white/5 to-transparent rounded-lg flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
                          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                            <div className="w-10 h-10 rounded bg-[#dc2626]/20" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Play button */}
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <button className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center transition-all duration-300 shadow-lg shadow-red-600/30 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-red-600/40 active:scale-95">
                        <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                      </button>
                    </div>

                    {/* Three dots menu */}
                    <div className="absolute top-2 right-2 z-10">
                      <button className="text-white/70 hover:text-white transition-colors duration-300 hover:scale-125">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <circle cx="12" cy="6" r="1.5" />
                          <circle cx="12" cy="12" r="1.5" />
                          <circle cx="12" cy="18" r="1.5" />
                        </svg>
                      </button>
                    </div>

                    {/* Shimmer effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
