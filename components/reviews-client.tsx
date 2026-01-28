"use client";

import { useState } from "react";
import { Star, Filter, TrendingUp, Users, Award, Sparkles, Quote, ThumbsUp, Calendar, Search, X } from "lucide-react";
import Image from "next/image";

interface Review {
  id: string;
  username: string;
  avatar: string;
  rating: number;
  text: string;
  created_at: string;
  product?: string;
}

interface ReviewsClientProps {
  initialReviews: Review[];
  averageRating: number;
  totalReviews: number;
  ratingDistribution?: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  satisfactionRate?: number;
}

export function ReviewsClient({ 
  initialReviews, 
  averageRating, 
  totalReviews,
  ratingDistribution,
  satisfactionRate = 0
}: ReviewsClientProps) {
  const [reviews, setReviews] = useState(initialReviews);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "highest" | "lowest">("newest");

  // Filter and sort reviews
  const filteredReviews = reviews
    .filter(review => {
      const matchesRating = filterRating === null || review.rating === filterRating;
      const matchesSearch = searchQuery === "" || 
        review.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.username.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesRating && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "highest":
          return b.rating - a.rating;
        case "lowest":
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric",
      year: "numeric" 
    });
  };

  const clearFilters = () => {
    setFilterRating(null);
    setSearchQuery("");
    setSortBy("newest");
  };

  return (
    <div className="relative pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#dc2626]/10 border border-[#dc2626]/20 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-[#dc2626] animate-pulse" />
            <span className="text-[#dc2626] text-sm font-semibold">Verified Customer Reviews</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight">
            <span className="block mb-2">What Our</span>
            <span className="relative inline-block">
              <span className="text-[#dc2626]">Customers Say</span>
              <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-[#dc2626] to-transparent" />
            </span>
          </h1>
          
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Real feedback from real customers. See why thousands trust our products.
          </p>
        </div>

        {/* Enhanced Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {/* Average Rating */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500/20 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
            <div className="relative bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-8 hover:border-yellow-500/30 transition-all text-center">
              <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
              </div>
              <p className="text-6xl font-bold text-yellow-400 mb-2">{averageRating}</p>
              <div className="flex items-center justify-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < Math.round(averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}`}
                  />
                ))}
              </div>
              <p className="text-white/60 text-sm">Average Rating</p>
            </div>
          </div>

          {/* Total Reviews */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
            <div className="relative bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-8 hover:border-blue-500/30 transition-all text-center">
              <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-400" />
              </div>
              <p className="text-6xl font-bold text-blue-400 mb-2">{totalReviews.toLocaleString()}</p>
              <p className="text-white/60 text-sm">Total Reviews</p>
            </div>
          </div>

          {/* Satisfaction Rate */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500/20 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
            <div className="relative bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-8 hover:border-green-500/30 transition-all text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <ThumbsUp className="w-8 h-8 text-green-400" />
              </div>
              <p className="text-6xl font-bold text-green-400 mb-2">{satisfactionRate}%</p>
              <p className="text-white/60 text-sm">Satisfaction</p>
            </div>
          </div>

          {/* 5-Star Reviews */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#dc2626]/20 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
            <div className="relative bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-8 hover:border-[#dc2626]/30 transition-all text-center">
              <div className="w-16 h-16 rounded-full bg-[#dc2626]/10 flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-[#dc2626]" />
              </div>
              <p className="text-6xl font-bold text-[#dc2626] mb-2">{ratingDistribution?.[5] || 0}</p>
              <p className="text-white/60 text-sm">5-Star Reviews</p>
            </div>
          </div>
        </div>

        {/* Rating Distribution Chart */}
        {ratingDistribution && (
          <div className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-8 mb-12">
            <h3 className="text-white font-bold text-xl mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#dc2626]" />
              Rating Distribution
            </h3>
            <div className="space-y-4">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = ratingDistribution[stars as keyof typeof ratingDistribution] || 0;
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                
                return (
                  <div key={stars} className="flex items-center gap-4">
                    <div className="flex items-center gap-1 w-24">
                      <span className="text-white font-semibold">{stars}</span>
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    </div>
                    <div className="flex-1 h-3 bg-[#0a0a0a] rounded-full overflow-hidden border border-[#1a1a1a]">
                      <div 
                        className="h-full bg-gradient-to-r from-[#dc2626] to-[#ef4444] rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-white/60 text-sm w-16 text-right">{count}</span>
                    <span className="text-white/40 text-xs w-12 text-right">{percentage.toFixed(0)}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="flex-1">
              <label className="block text-white/80 text-sm font-medium mb-2 flex items-center gap-2">
                <Search className="w-4 h-4" />
                Search Reviews
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by username or review text..."
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl text-white placeholder:text-white/40 focus:border-[#dc2626] focus:outline-none focus:ring-2 focus:ring-[#dc2626]/20 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-[#1a1a1a] rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-white/60" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter by Rating */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter by Rating
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterRating(null)}
                  className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                    filterRating === null
                      ? "bg-gradient-to-r from-[#dc2626] to-[#ef4444] text-white"
                      : "bg-[#0a0a0a] border border-[#1a1a1a] text-white/60 hover:text-white hover:border-[#dc2626]/30"
                  }`}
                >
                  All
                </button>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setFilterRating(rating)}
                    className={`px-4 py-3 rounded-xl font-semibold transition-all flex items-center gap-1 ${
                      filterRating === rating
                        ? "bg-gradient-to-r from-[#dc2626] to-[#ef4444] text-white"
                        : "bg-[#0a0a0a] border border-[#1a1a1a] text-white/60 hover:text-white hover:border-[#dc2626]/30"
                    }`}
                  >
                    {rating}
                    <Star className="w-3 h-3" />
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl text-white focus:border-[#dc2626] focus:outline-none focus:ring-2 focus:ring-[#dc2626]/20 transition-all cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="highest">Highest Rated</option>
                <option value="lowest">Lowest Rated</option>
              </select>
            </div>
          </div>

          {/* Active Filters */}
          {(filterRating !== null || searchQuery !== "") && (
            <div className="mt-4 pt-4 border-t border-[#1a1a1a] flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-white/60 text-sm">Active filters:</span>
                {filterRating !== null && (
                  <span className="px-3 py-1 bg-[#dc2626]/20 border border-[#dc2626]/30 rounded-lg text-[#dc2626] text-sm font-medium">
                    {filterRating} stars
                  </span>
                )}
                {searchQuery && (
                  <span className="px-3 py-1 bg-[#dc2626]/20 border border-[#dc2626]/30 rounded-lg text-[#dc2626] text-sm font-medium">
                    Search: "{searchQuery}"
                  </span>
                )}
              </div>
              <button
                onClick={clearFilters}
                className="text-white/60 hover:text-[#dc2626] text-sm font-medium transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Reviews Count */}
        <div className="mb-6">
          <p className="text-white/60 text-sm">
            Showing <span className="text-white font-semibold">{filteredReviews.length}</span> of <span className="text-white font-semibold">{totalReviews}</span> reviews
          </p>
        </div>

        {/* Reviews Grid */}
        {filteredReviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredReviews.map((review, index) => (
              <div 
                key={review.id}
                className="group relative animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#dc2626]/20 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
                <div className="relative bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 hover:border-[#dc2626]/30 transition-all h-full flex flex-col">
                  {/* Quote Icon */}
                  <div className="absolute top-6 right-6 opacity-10">
                    <Quote className="w-12 h-12 text-[#dc2626]" />
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-4 relative z-10">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}`}
                      />
                    ))}
                  </div>

                  {/* Review Text */}
                  <p className="text-white/80 text-sm leading-relaxed mb-6 flex-1 relative z-10">
                    "{review.text}"
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-[#1a1a1a] relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#dc2626] to-[#ef4444] flex items-center justify-center text-white text-sm font-bold ring-2 ring-[#dc2626]/20">
                        {review.avatar || review.username[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white text-sm font-semibold">{review.username}</p>
                        {review.product && (
                          <p className="text-white/40 text-xs">{review.product}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-white/40 text-xs">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(review.created_at)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#dc2626]/20 to-transparent rounded-2xl blur opacity-50" />
            <div className="relative text-center py-20 bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a] rounded-2xl">
              <div className="w-20 h-20 bg-[#dc2626]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-[#dc2626]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">No Reviews Found</h3>
              <p className="text-white/50 max-w-md mx-auto mb-6">
                Try adjusting your filters or search terms
              </p>
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-gradient-to-r from-[#dc2626] to-[#ef4444] hover:from-[#ef4444] hover:to-[#dc2626] text-white rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-[#dc2626]/30"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="relative group mt-16">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#dc2626]/30 via-[#dc2626]/10 to-transparent rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
          <div className="relative bg-gradient-to-br from-[#111111] to-[#0a0a0a] border-2 border-[#dc2626]/30 rounded-2xl p-10 overflow-hidden text-center">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#dc2626]/5 rounded-full blur-3xl" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#dc2626]/10 border border-[#dc2626]/30 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-[#dc2626] animate-pulse" />
                <span className="text-[#dc2626] text-sm font-semibold">Join Thousands of Happy Customers</span>
              </div>
              
              <h3 className="text-white font-bold text-3xl mb-3">Ready to Experience Excellence?</h3>
              <p className="text-white/60 text-lg mb-8 max-w-2xl mx-auto">
                Join our community and see why we have such amazing reviews. Premium quality, unbeatable support.
              </p>
              
              <a
                href="/store"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-[#dc2626] to-[#ef4444] hover:from-[#ef4444] hover:to-[#dc2626] text-white px-10 py-4 rounded-xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#dc2626]/40"
              >
                Browse Products
                <Star className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>

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
      `}</style>
    </div>
  );
}