"use client";

import { useState } from "react";
import { Star, Quote } from "lucide-react";
import { ReviewModal } from "@/components/review-modal";
import { createReview } from "@/lib/supabase/data";

interface Review {
  id: string;
  username: string;
  avatar: string;
  rating: number;
  text: string;
  created_at: string;
  verified: boolean;
}

interface ReviewsClientProps {
  initialReviews: Review[];
  averageRating: number;
  totalReviews: number;
}

export function ReviewsClient({ initialReviews, averageRating, totalReviews }: ReviewsClientProps) {
  const [visibleCount, setVisibleCount] = useState(6);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);

  const loadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 6, reviews.length));
  };

  const handleReviewSubmit = async (newReview: { username: string; rating: number; text: string }) => {
    // Create review in database
    const createdReview = await createReview({
      username: newReview.username,
      avatar: newReview.username.charAt(0).toUpperCase(),
      rating: newReview.rating,
      text: newReview.text,
      verified: false,
    });

    if (createdReview) {
      setReviews((prev) => [createdReview, ...prev]);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  return (
    <>
      {/* Hero Section */}
      <section className="pt-24 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#dc2626]/5 to-transparent" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Trusted by Those
            <br />
            <span className="text-white">Who Demand </span>
            <span className="text-[#dc2626]">the Best.</span>
          </h1>
          <p className="text-white/60 text-lg mb-8 max-w-2xl mx-auto">
            Read genuine reviews from customers who chose us for quality, speed,
            and results that speak for themselves.
          </p>

          {/* Rating Summary */}
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="flex items-center gap-4">
              <span className="text-5xl font-bold text-white">{averageRating.toFixed(1)}</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-6 h-6 ${
                      star <= Math.round(averageRating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-white/20"
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-white/50 text-sm">Based on {totalReviews}+ reviews</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button 
              onClick={() => setIsReviewModalOpen(true)}
              className="bg-[#dc2626] hover:bg-[#ef4444] text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-[#dc2626]/25"
            >
              Leave a Review
            </button>
            <button 
              onClick={() => {
                setVisibleCount(reviews.length);
                setTimeout(() => {
                  document.getElementById("reviews-grid")?.scrollIntoView({ behavior: "smooth" });
                }, 100);
              }}
              disabled={visibleCount >= reviews.length}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 border ${
                visibleCount >= reviews.length
                  ? "bg-[#1a1a1a]/50 text-white/50 border-[#262626]/50 cursor-not-allowed"
                  : "bg-[#1a1a1a] hover:bg-[#262626] text-white border-[#262626]"
              }`}
            >
              {visibleCount >= reviews.length ? `Showing All ${reviews.length} Reviews` : "See All Reviews"}
            </button>
          </div>
        </div>
      </section>

      {/* Review Modal */}
      <ReviewModal
        open={isReviewModalOpen}
        onOpenChange={setIsReviewModalOpen}
        onSubmit={handleReviewSubmit}
      />

      {/* Reviews Grid */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div id="reviews-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.slice(0, visibleCount).map((review, index) => (
              <div
                key={review.id}
                className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-6 transition-all duration-300 hover:border-[#dc2626]/30 hover:shadow-xl hover:shadow-[#dc2626]/5"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Quote className="w-8 h-8 text-[#dc2626]/30 mb-4" />
                <p className="text-white/70 text-sm leading-relaxed mb-6 min-h-[80px]">
                  {review.text}
                </p>
                <div className="flex justify-end mb-4">
                  <Quote className="w-8 h-8 text-[#dc2626]/30 rotate-180" />
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-[#1a1a1a]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#dc2626] flex items-center justify-center text-white font-bold">
                      {review.avatar}
                    </div>
                    <div>
                      <p className="text-white font-medium">{review.username}</p>
                      <p className="text-white/50 text-xs">{formatDate(review.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-white font-bold">{review.rating}</span>
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {visibleCount < reviews.length && (
            <div className="text-center mt-10">
              <button
                onClick={loadMore}
                className="bg-[#1a1a1a] hover:bg-[#262626] text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 border border-[#262626]"
              >
                Load More Reviews
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
