import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getReviews } from "@/lib/supabase/data";
import { ReviewsClient } from "@/components/reviews-client";

export const revalidate = 60;

export default async function ReviewsPage() {
  const reviews = await getReviews();
  
  // Calculate stats
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : "0.0";

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Header />
      <ReviewsClient 
        initialReviews={reviews} 
        averageRating={parseFloat(averageRating)} 
        totalReviews={totalReviews} 
      />
      <Footer />
    </main>
  );
}
