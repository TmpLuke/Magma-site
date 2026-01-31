"use client";

import React from "react"

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Star, Send, CheckCircle } from "lucide-react";
import { ImageUploader } from "@/components/admin/image-uploader";

interface ReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (review: {
    username: string;
    rating: number;
    text: string;
    image_url?: string;
  }) => void;
}

export function ReviewModal({ open, onOpenChange, onSubmit }: ReviewModalProps) {
  const [username, setUsername] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !rating || !text) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    onSubmit({ username, rating, text, image_url: imageUrl });
    setIsSubmitting(false);
    setIsSuccess(true);
    
    // Reset and close after showing success
    setTimeout(() => {
      setUsername("");
      setRating(0);
      setText("");
      setImageUrl("");
      setIsSuccess(false);
      onOpenChange(false);
    }, 2000);
  };

  const resetForm = () => {
    setUsername("");
    setRating(0);
    setHoverRating(0);
    setText("");
    setImageUrl("");
    setIsSuccess(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) resetForm();
        onOpenChange(newOpen);
      }}
    >
      <DialogContent className="bg-[#111111] border-[#262626] text-white sm:max-w-md">
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold text-white">Thank You!</h3>
            <p className="text-white/60 text-center">
              Your review has been submitted successfully.
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">
                Leave a Review
              </DialogTitle>
              <DialogDescription className="text-white/60">
                Share your experience with our products and help others make informed decisions.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-5 mt-2">
              {/* Username Input */}
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-white/80">
                  Your Name
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#dc2626] focus:ring-1 focus:ring-[#dc2626] transition-colors"
                  required
                />
              </div>

              {/* Star Rating */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">
                  Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          star <= (hoverRating || rating)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-white/20"
                        }`}
                      />
                    </button>
                  ))}
                  {rating > 0 && (
                    <span className="ml-2 text-white/60 text-sm">
                      {rating === 1 && "Poor"}
                      {rating === 2 && "Fair"}
                      {rating === 3 && "Good"}
                      {rating === 4 && "Great"}
                      {rating === 5 && "Excellent"}
                    </span>
                  )}
                </div>
              </div>

              {/* Review Text */}
              <div className="space-y-2">
                <label htmlFor="review" className="text-sm font-medium text-white/80">
                  Your Review
                </label>
                <textarea
                  id="review"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Tell us about your experience..."
                  rows={4}
                  className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#dc2626] focus:ring-1 focus:ring-[#dc2626] transition-colors resize-none"
                  required
                />
                <p className="text-white/40 text-xs">
                  Minimum 10 characters ({text.length}/10)
                </p>
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <ImageUploader
                  value={imageUrl}
                  onChange={setImageUrl}
                  label="Attach an Image (Optional)"
                  description="Upload a screenshot or photo with your review."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!username || !rating || text.length < 10 || isSubmitting}
                className="w-full bg-[#dc2626] hover:bg-[#ef4444] disabled:bg-[#dc2626]/50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Review
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
