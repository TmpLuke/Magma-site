import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { Stats } from "@/components/stats";
import { PopularCheats } from "@/components/popular-cheats";
import { VideoCarousel } from "@/components/video-carousel";
import { FAQ } from "@/components/faq";
import { Reviews } from "@/components/reviews";
import { Footer } from "@/components/footer";
import { getProducts, getReviews } from "@/lib/supabase/data";

const stats = {
  users: 1000,
  products: 50,
  reviews: 200,
};

export const dynamic = "force-dynamic";
export const revalidate = 60;

export default async function Home() {
  const [products, reviews] = await Promise.all([
    getProducts(),
    getReviews(),
  ]);

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Header />
      <Hero />
      <Stats />
      <PopularCheats products={products} />
      <VideoCarousel />
      <FAQ />
      <Reviews reviews={reviews.slice(0, 6)} />
      <Footer />
    </main>
  );
}
