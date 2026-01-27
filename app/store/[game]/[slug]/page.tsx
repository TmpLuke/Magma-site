import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getProductBySlug, getReviews } from "@/lib/supabase/data";
import { notFound } from "next/navigation";
import { ProductDetailClient } from "@/components/product-detail-client";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ game: string; slug: string }>;
}) {
  const { slug, game } = await params;
  
  let product = null;
  let reviews: { id: string; username: string; avatar: string; rating: number; text: string; created_at: string }[] = [];
  
  try {
    [product, reviews] = await Promise.all([
      getProductBySlug(slug),
      getReviews(),
    ]);
  } catch (error) {
    console.error("[v0] Error fetching product data:", error);
  }

  if (!product) {
    notFound();
  }

  // Get a few reviews for display
  const displayReviews = reviews.slice(0, 3);

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Header />
      <ProductDetailClient product={product} reviews={displayReviews} gameSlug={game} />
      <Footer />
    </main>
  );
}
