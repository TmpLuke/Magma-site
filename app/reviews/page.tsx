import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getReviews } from "@/lib/supabase/data";
import { ReviewsClient } from "@/components/reviews-client";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export default async function ReviewsPage() {
  const reviews = await getReviews();
  
  // Calculate enhanced stats
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : "0.0";
  
  // Calculate rating distribution
  const ratingDistribution = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length,
  };
  
  // Calculate satisfaction percentage (4-5 stars)
  const satisfactionRate = totalReviews > 0
    ? Math.round(((ratingDistribution[5] + ratingDistribution[4]) / totalReviews) * 100)
    : 0;
  
  return (
    <main className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#dc2626]/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '0ms' }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1000ms' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '500ms' }} />
      </div>

      <Header />
      
      <ReviewsClient 
        initialReviews={reviews} 
        averageRating={parseFloat(averageRating)} 
        totalReviews={totalReviews}
        ratingDistribution={ratingDistribution}
        satisfactionRate={satisfactionRate}
      />
      
      <Footer />
    </main>
  );
}