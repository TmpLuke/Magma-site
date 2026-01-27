import { getProductBySlug } from "@/lib/supabase/data";
import { redirect, notFound } from "next/navigation";

export const dynamic = "force-dynamic";

// Convert game name to slug
function gameToSlug(game: string): string {
  return game.toLowerCase().replace(/[:\s]+/g, "-").replace(/--+/g, "-");
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  // Try to find the product by slug
  let product = null;
  
  try {
    product = await getProductBySlug(slug);
  } catch (error) {
    console.error("[v0] Error fetching product:", error);
  }

  // If product found, redirect to the new URL structure
  if (product) {
    const gameSlug = gameToSlug(product.game);
    redirect(`/store/${gameSlug}/${slug}`);
  }

  // Otherwise, this might be a game slug - let it fall through to not found
  // The [game]/page.tsx will handle game-level pages
  notFound();
}
