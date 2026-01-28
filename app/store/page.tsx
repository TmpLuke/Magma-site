import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getProducts } from "@/lib/supabase/data";
import { Headphones, ShoppingCart, Shield, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { StoreFilters } from "@/components/store-filters";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export default async function StorePage() {
  const products = await getProducts();

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Header />

      {/* Hero Section */}
      <div className="relative pt-20">
        {/* Red gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#dc2626]/10 via-[#0a0a0a] to-[#0a0a0a]" />
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
          {/* Page Header with Logo */}
          <div className="text-center mb-10">
            <div className="flex justify-center mb-6">
              <Image
                src="/images/magma-flame.png"
                alt="Magma Cheats"
                width={80}
                height={100}
                className="object-contain"
              />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">
              A Powerful, Instant Way
            </h1>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
              <span className="text-white">to Shop </span>
              <span className="text-[#dc2626]">Without Limits</span>
              <span className="text-white">.</span>
            </h2>
          </div>

          {/* Client-side filtering component */}
          <StoreFilters products={products} />
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-[#0a0a0a] py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {/* 24/7 Support */}
            <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-5 sm:p-6 hover:border-[#dc2626]/30 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-[#dc2626]/10 flex items-center justify-center mb-4">
                <Headphones className="w-6 h-6 text-[#dc2626]" />
              </div>
              <h4 className="text-white font-bold text-base sm:text-lg mb-2">24/7 - 365 Support</h4>
              <p className="text-white/50 text-sm">
                Our dedicated support team is available 24/7, 365 days a year.
              </p>
            </div>

            {/* Instant Delivery */}
            <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-5 sm:p-6 hover:border-[#dc2626]/30 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-[#dc2626]/10 flex items-center justify-center mb-4">
                <ShoppingCart className="w-6 h-6 text-[#dc2626]" />
              </div>
              <h4 className="text-white font-bold text-base sm:text-lg mb-2">Instant Delivery</h4>
              <p className="text-white/50 text-sm">
                No need to wait for delivery, products are delivered instantly after purchase.
              </p>
            </div>

            {/* Secure Transactions */}
            <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-5 sm:p-6 hover:border-[#dc2626]/30 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-[#dc2626]/10 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-[#dc2626]" />
              </div>
              <h4 className="text-white font-bold text-base sm:text-lg mb-2">Secure Transactions</h4>
              <p className="text-white/50 text-sm">
                Ensure your transactions are safe and hassle-free with our robust payment system.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
