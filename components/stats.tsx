"use client";

import React from "react";
import { Gamepad2, Bug, Users, Wifi } from "lucide-react";
import { useCountUp } from "@/hooks/use-count-up";
import { useEffect, useState, useRef } from "react";

interface StatCardProps {
  icon: React.ElementType;
  value: number;
  label: string;
  suffix?: string;
  index: number;
}

function StatCard({ icon: Icon, value, label, suffix = "", index }: StatCardProps) {
  const { count, ref } = useCountUp({ end: value, duration: 2500 });

  return (
    <div
      ref={ref}
      className="group bg-[#111111] border border-[#262626] rounded-xl p-6 flex flex-col items-center justify-center text-center transition-all duration-500 hover:border-[#dc2626]/50 hover:bg-[#111111]/80 hover:shadow-lg hover:shadow-[#dc2626]/10 hover:-translate-y-1"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="relative mb-4">
        <Icon className="w-10 h-10 text-[#dc2626] transition-all duration-500 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(220,38,38,0.5)]" />
        <div className="absolute inset-0 bg-[#dc2626]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
      <span className="text-4xl md:text-5xl font-bold text-white mb-2 tabular-nums transition-all duration-300 group-hover:text-[#dc2626]">
        {count.toLocaleString()}{suffix}
      </span>
      <span className="text-white/50 text-sm tracking-wider transition-colors duration-300 group-hover:text-white/70">
        {label}
      </span>
    </div>
  );
}



const statsData = [
  {
    icon: Gamepad2,
    value: 19,
    label: "GAMES",
  },
  {
    icon: Bug,
    value: 180,
    label: "CHEATS",
  },
  {
    icon: Users,
    value: 25827,
    label: "TOTAL MEMBERS",
  },
  {
    icon: Wifi,
    value: 79,
    label: "ONLINE NOW",
  },
];

export function Stats() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const stats = statsData; // Declare the stats variable

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
        {/* Header */}
        <div
          className={`flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 mb-12 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Track game-changing
            <br />
            stats that{" "}
            <span className="text-[#dc2626] relative inline-block">
              drive performance
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-[#dc2626] to-transparent rounded-full" />
            </span>
          </h2>
          <p className="text-white/60 max-w-md text-base leading-relaxed">
            View key metrics and performance indicators in real time, built for
            speed and clarity. Understand what&apos;s working, optimize
            strategies, and stay ahead with data designed for competitive
            environments.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              icon={stat.icon}
              value={stat.value}
              label={stat.label}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
