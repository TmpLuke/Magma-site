"use client";

import { useState } from "react";
import {
  Minus,
  Plus,
  Zap,
  Shield,
  Star,
  ShoppingCart,
  Loader2,
  ArrowLeft,
  Quote,
  CheckCircle,
  Copy,
  Mail,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { processPurchase, validateCoupon } from "@/lib/purchase-actions";

interface Product {
  id: string;
  name: string;
  slug: string;
  game: string;
  description: string;
  image: string;
  status: string;
  pricing: { duration: string; price: number; stock: number }[];
  features: { aimbot: string[]; esp: string[]; misc: string[] };
  requirements: { cpu: string; windows: string; cheatType: string; controller: boolean };
  gallery?: string[];
}

interface Review {
  id: string;
  username: string;
  avatar: string;
  rating: number;
  text: string;
  created_at: string;
}

// Avatar images for reviews
const avatarImages = [
  "/images/avatars/avatar-1.png",
  "/images/avatars/avatar-2.png",
  "/images/avatars/avatar-3.png",
];

// Generate unique reviews based on product name
const getProductReviews = (productName: string) => {
  const reviewSets: Record<string, { id: string; username: string; avatarImage: string; rating: number; text: string; created_at: string }[]> = {
    "Armani": [
      { id: "1", username: "ApexPredator", avatarImage: avatarImages[0], rating: 5, text: "The Apex cheat is incredible! Smooth aimbot and the ESP helps me track every squad. Been using for 3 weeks with zero issues.", created_at: "2026-01-18T12:00:00Z" },
      { id: "2", username: "LegendSeeker", avatarImage: avatarImages[1], rating: 5, text: "Finally a working Apex cheat. The item ESP is a game changer for looting. Support helped me set everything up perfectly.", created_at: "2026-01-15T10:30:00Z" },
      { id: "3", username: "BRKing", avatarImage: avatarImages[2], rating: 4, text: "Solid cheat for Apex. Had some FPS drops initially but after tweaking settings it runs smooth now.", created_at: "2026-01-12T15:45:00Z" },
    ],
    "Fortnite": [
      { id: "1", username: "BuildMaster", avatarImage: avatarImages[1], rating: 5, text: "Dominating every match now! The silent aim is unreal and the player ESP helps me plan my rotations perfectly.", created_at: "2026-01-19T14:00:00Z" },
      { id: "2", username: "VictoryRoyal", avatarImage: avatarImages[0], rating: 5, text: "Been playing Fortnite for years, this cheat takes it to another level. Chest ESP alone is worth it.", created_at: "2026-01-16T11:30:00Z" },
      { id: "3", username: "FN_Elite", avatarImage: avatarImages[2], rating: 5, text: "Quick setup, great features, amazing support team. What more could you ask for?", created_at: "2026-01-13T09:20:00Z" },
    ],
    "HWID Spoofer": [
      { id: "1", username: "CleanSlate", avatarImage: avatarImages[2], rating: 5, text: "Got HWID banned from 3 games. This spoofer got me back in all of them within minutes. Absolute lifesaver!", created_at: "2026-01-20T16:00:00Z" },
      { id: "2", username: "SecondChance", avatarImage: avatarImages[0], rating: 5, text: "Works perfectly with every anti-cheat. Registry cleaner feature is super useful too.", created_at: "2026-01-17T13:30:00Z" },
      { id: "3", username: "BackInGame", avatarImage: avatarImages[1], rating: 5, text: "Simple to use and very effective. Customer support walked me through the whole process.", created_at: "2026-01-14T10:15:00Z" },
    ],
    "Marvel Rivals": [
      { id: "1", username: "HeroMain", avatarImage: avatarImages[0], rating: 5, text: "Finally a Marvel Rivals cheat that works! The ability tracking ESP is clutch for team fights.", created_at: "2026-01-19T18:00:00Z" },
      { id: "2", username: "UltimateGamer", avatarImage: avatarImages[2], rating: 5, text: "Smooth aimbot that works with all heroes. Been climbing ranks fast since I got this.", created_at: "2026-01-16T14:30:00Z" },
      { id: "3", username: "MarvelFan", avatarImage: avatarImages[1], rating: 4, text: "Good cheat overall. Would love to see more hero-specific features in future updates.", created_at: "2026-01-13T11:45:00Z" },
    ],
    "Rust": [
      { id: "1", username: "RustLord", avatarImage: avatarImages[1], rating: 5, text: "Raiding bases has never been easier. The player ESP through walls is insanely useful.", created_at: "2026-01-18T20:00:00Z" },
      { id: "2", username: "Survivor2026", avatarImage: avatarImages[0], rating: 5, text: "Dominating servers now. Silent aim makes every PVP encounter a guaranteed win.", created_at: "2026-01-15T17:30:00Z" },
      { id: "3", username: "BaseBuilder", avatarImage: avatarImages[2], rating: 5, text: "The resource ESP alone is worth the price. Finding sulfur has never been easier.", created_at: "2026-01-12T14:20:00Z" },
    ],
    "Delta Force": [
      { id: "1", username: "TacticalOps", avatarImage: avatarImages[0], rating: 5, text: "Best tactical shooter cheat out there. The visibility check prevents any suspicious kills.", created_at: "2026-01-18T12:00:00Z" },
      { id: "2", username: "SpecOps_Elite", avatarImage: avatarImages[1], rating: 5, text: "Smooth aimbot with perfect bone selection. Vehicle ESP is a nice bonus.", created_at: "2026-01-15T10:30:00Z" },
      { id: "3", username: "GhostRecon", avatarImage: avatarImages[2], rating: 4, text: "Solid performance. Radar hack helps a lot with map awareness.", created_at: "2026-01-12T15:45:00Z" },
    ],
    "PUBG": [
      { id: "1", username: "ChickenDinner", avatarImage: avatarImages[2], rating: 5, text: "Finally getting consistent wins! The vehicle aim is perfect for drive-bys.", created_at: "2026-01-18T14:00:00Z" },
      { id: "2", username: "BattleRoyale", avatarImage: avatarImages[1], rating: 5, text: "Airdrop ESP gives such an advantage. Been using for months undetected.", created_at: "2026-01-15T11:30:00Z" },
      { id: "3", username: "SneakKing", avatarImage: avatarImages[0], rating: 5, text: "Love the prediction on the aimbot. Long range shots are easy now.", created_at: "2026-01-12T09:20:00Z" },
    ],
    "DayZ": [
      { id: "1", username: "ZombieSurvivor", avatarImage: avatarImages[0], rating: 5, text: "The loot ESP changed the game for me. No more endless searching for supplies.", created_at: "2026-01-18T16:00:00Z" },
      { id: "2", username: "ApocNow", avatarImage: avatarImages[2], rating: 5, text: "Player ESP keeps me safe from bandits. Worth every cent.", created_at: "2026-01-15T13:30:00Z" },
      { id: "3", username: "LastMan", avatarImage: avatarImages[1], rating: 4, text: "Great cheat overall. Animal ESP helps with food hunting too.", created_at: "2026-01-12T10:15:00Z" },
    ],
    "Rainbow Six Siege": [
      { id: "1", username: "SiegeMain", avatarImage: avatarImages[1], rating: 5, text: "Wallhacks are perfect for holding angles. No one flanks me anymore.", created_at: "2026-01-18T18:00:00Z" },
      { id: "2", username: "OperatorX", avatarImage: avatarImages[0], rating: 5, text: "The aimbot feels natural with good smoothing settings. Very satisfied.", created_at: "2026-01-15T14:30:00Z" },
      { id: "3", username: "DiamondPush", avatarImage: avatarImages[2], rating: 5, text: "Helped me finally hit Diamond. Support team is amazing.", created_at: "2026-01-12T11:45:00Z" },
    ],
    "Escape From Tarkov": [
      { id: "1", username: "TarkovRat", avatarImage: avatarImages[0], rating: 5, text: "Loot runs are so profitable now. The item ESP finds all the good stuff.", created_at: "2026-01-18T20:00:00Z" },
      { id: "2", username: "PMC_Slayer", avatarImage: avatarImages[1], rating: 5, text: "Finally surviving raids consistently. Player ESP is a must-have.", created_at: "2026-01-15T17:30:00Z" },
      { id: "3", username: "LabsRunner", avatarImage: avatarImages[2], rating: 5, text: "Worth every ruble! The aimbot works great with all weapons.", created_at: "2026-01-12T14:20:00Z" },
    ],
    "default": [
      { id: "1", username: "ProGamer_X", avatarImage: avatarImages[0], rating: 5, text: "Absolutely love this cheat! Smooth performance and the features work exactly as advertised. Support team is incredibly responsive.", created_at: "2026-01-18T12:00:00Z" },
      { id: "2", username: "ElitePlayer", avatarImage: avatarImages[1], rating: 5, text: "Been using for over a month now with no issues. Undetected and reliable. Highly recommend to anyone looking for quality.", created_at: "2026-01-15T10:30:00Z" },
      { id: "3", username: "GameChanger", avatarImage: avatarImages[2], rating: 4, text: "Solid product with great features. Setup was easy and support helped me optimize my settings.", created_at: "2026-01-12T15:45:00Z" },
    ],
  };
  return reviewSets[productName] || reviewSets["default"];
};

export function ProductDetailClient({ product, reviews, gameSlug }: { product: Product; reviews: Review[]; gameSlug?: string }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedPriceIndex, setSelectedPriceIndex] = useState(0);
  const [cpuConfirmed, setCpuConfirmed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  
  // Checkout modal state
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [customerEmail, setCustomerEmail] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponValid, setCouponValid] = useState<boolean | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  
  // Success state
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  const [orderDetails, setOrderDetails] = useState<{
    orderNumber: string;
    licenseKey: string;
  } | null>(null);

  const handleOpenCheckout = () => {
    if (!cpuConfirmed) return;
    setShowCheckoutModal(true);
  };

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setIsValidatingCoupon(true);
    try {
      const result = await validateCoupon(couponCode, product.id);
      if (result.valid && result.discount) {
        setCouponDiscount(result.discount);
        setCouponValid(true);
      } else {
        setCouponDiscount(0);
        setCouponValid(false);
      }
    } catch {
      setCouponValid(false);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleCheckout = async () => {
    if (!customerEmail || !customerEmail.includes("@")) {
      setCheckoutError("Please enter a valid email address");
      return;
    }

    setIsProcessing(true);
    setCheckoutError(null);

    try {
      const selectedTier = product.pricing[selectedPriceIndex];
      let totalAmount = selectedTier.price * quantity;
      
      // Apply coupon discount
      if (couponDiscount > 0) {
        totalAmount = totalAmount * (1 - couponDiscount / 100);
      }

      const result = await processPurchase({
        productId: product.id,
        productName: `${product.name} - ${product.game}`,
        productSlug: product.slug,
        duration: selectedTier.duration,
        price: totalAmount,
        customerEmail: customerEmail,
        couponCode: couponValid ? couponCode : undefined,
      });

      if (result.success && result.checkoutUrl) {
        // Redirect to Money Motion checkout
        window.location.href = result.checkoutUrl;
      } else if (result.success && result.licenseKey) {
        // Fallback for direct purchases (if any)
        setOrderDetails({
          orderNumber: result.orderNumber || "",
          licenseKey: result.licenseKey,
        });
        setPurchaseComplete(true);
      } else {
        setCheckoutError(result.error || "Failed to process purchase. Please try again.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setCheckoutError("An error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Link
          href={gameSlug ? `/store/${gameSlug}` : "/store"}
          className="inline-flex items-center gap-2 text-white/60 hover:text-[#dc2626] mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {gameSlug ? `Back to ${product.game} Cheats` : "Back to Store"}
        </Link>

        {/* Product Hero Banner */}
        <div className="relative rounded-xl overflow-hidden mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-[#dc2626]/30 via-[#dc2626]/20 to-[#dc2626]/30" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0a]" />
          <div 
            className="absolute inset-0 opacity-20 bg-cover bg-center"
            style={{ backgroundImage: `url(${product.image})` }}
          />
          <div className="relative py-12 px-6 text-center">
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2"
              style={{ fontFamily: "Georgia, serif", fontStyle: "italic" }}
            >
              {product.name}
            </h1>
            <p className="text-[#dc2626] text-xl md:text-2xl font-medium italic">{product.game} Cheats</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Image with Stacked Card Effect */}
          <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-6 lg:p-8">
            <div className="relative flex items-center justify-center py-8">
              {/* Stacked cards behind - Card 3 (back) */}
              <div className="absolute w-[85%] aspect-[3/4] rounded-2xl bg-[#1a1a1a] border border-[#262626] transform rotate-6 translate-x-4 translate-y-4 opacity-40" />
              
              {/* Stacked cards behind - Card 2 (middle) */}
              <div className="absolute w-[85%] aspect-[3/4] rounded-2xl bg-[#151515] border border-[#262626] transform rotate-3 translate-x-2 translate-y-2 opacity-60" />
              
              {/* Main product card */}
              <div className="relative w-[85%] aspect-[3/4] rounded-2xl overflow-hidden border-2 border-[#262626] shadow-2xl shadow-black/50 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a]">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
                
                {/* Bottom gradient with game name */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <span 
                    className="text-white font-bold text-2xl uppercase tracking-widest"
                    style={{ textShadow: "0 2px 10px rgba(0,0,0,0.8)" }}
                  >
                    {product.game.split(":")[0]}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1a1a1a] text-white text-sm">
                <Zap className="w-4 h-4 text-[#dc2626]" />
                Instant Delivery
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm ${
                  product.status === "active"
                    ? "bg-green-500/20 text-green-400"
                    : "bg-yellow-500/20 text-yellow-400"
                }`}
              >
                <Shield className="w-4 h-4" />
                {product.status === "active" ? "Undetected (Working)" : "Maintenance"}
              </span>
            </div>

            {/* Price */}
            <div className="mb-6">
              <p className="text-3xl font-bold text-white">
                ${(product.pricing[selectedPriceIndex].price * quantity).toFixed(2)}
              </p>
            </div>

            {/* Duration Selection */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
              {product.pricing.map((tier, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedPriceIndex(index)}
                  className={`p-2.5 sm:p-4 rounded-xl border-2 transition-all duration-300 active:scale-[0.98] ${
                    selectedPriceIndex === index
                      ? "bg-[#dc2626] border-[#dc2626] text-white shadow-lg shadow-[#dc2626]/30"
                      : "bg-[#0a0a0a] border-[#1a1a1a] text-white hover:border-[#dc2626]/50"
                  }`}
                >
                  <p className="text-[10px] sm:text-xs text-white/60 uppercase mb-0.5 sm:mb-1">{tier.duration}</p>
                  <p className="font-bold text-sm sm:text-base">${tier.price.toFixed(2)}</p>
                  <p className="text-[10px] sm:text-xs text-white/50 mt-0.5 sm:mt-1">STOCK: {tier.stock}</p>
                </button>
              ))}
            </div>

            {/* Quantity */}
            <div className="flex items-center justify-between mb-6 bg-[#0a0a0a] rounded-xl p-4">
              <span className="text-white/60 text-sm sm:text-base">Quantity</span>
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#dc2626] hover:bg-[#ef4444] flex items-center justify-center text-white transition-colors active:scale-95"
                >
                  <Minus className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <span className="w-10 sm:w-12 text-center text-white font-bold text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#dc2626] hover:bg-[#ef4444] flex items-center justify-center text-white transition-colors active:scale-95"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            {/* CPU Confirmation */}
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-4 mb-6">
              <p className="text-white/80 text-sm mb-3">
                I confirm that my computer has an Intel CPU. If you have an AMD CPU, do NOT buy!{" "}
                <span className="text-[#dc2626]">REQUIRED</span>
              </p>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cpuConfirmed}
                    onChange={(e) => setCpuConfirmed(e.target.checked)}
                    className="w-4 h-4 rounded border-[#1a1a1a] bg-[#1a1a1a] text-[#dc2626] focus:ring-[#dc2626]"
                  />
                  <span className="text-white/70 text-sm">Yes</span>
                </label>
                <span className="text-white/50 text-sm">or</span>
                <button
                  onClick={() => setCpuConfirmed(true)}
                  className="text-white/70 text-sm underline hover:text-white"
                >
                  All / None
                </button>
              </div>
            </div>

            {/* Checkout Error */}
            {checkoutError && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                {checkoutError}
              </div>
            )}

            {/* Checkout Button */}
            <button
              onClick={handleOpenCheckout}
              disabled={!cpuConfirmed}
              className={`w-full py-4 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                cpuConfirmed
                  ? "bg-[#dc2626] text-white hover:bg-[#ef4444] hover:shadow-lg hover:shadow-[#dc2626]/30"
                  : "bg-[#1a1a1a] text-white/50 cursor-not-allowed"
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              Add To Cart - ${(product.pricing[selectedPriceIndex].price * quantity).toFixed(2)}
            </button>
          </div>
        </div>

        {/* Checkout Modal */}
        {showCheckoutModal && !purchaseComplete && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl max-w-md w-full p-6 relative">
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="absolute top-4 right-4 text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h2 className="text-2xl font-bold text-white mb-2">Complete Purchase</h2>
              <p className="text-white/60 mb-6">
                {product.name} - {product.pricing[selectedPriceIndex].duration}
              </p>
              
              {/* Email Input */}
              <div className="mb-4">
                <label className="block text-white/80 text-sm mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full pl-11 pr-4 py-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg text-white placeholder:text-white/40 focus:border-[#dc2626] focus:outline-none"
                  />
                </div>
                <p className="text-white/50 text-xs mt-1">Your license key will be sent to this email</p>
              </div>
              
              {/* Coupon Code */}
              <div className="mb-6">
                <label className="block text-white/80 text-sm mb-2">Coupon Code (Optional)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value.toUpperCase());
                      setCouponValid(null);
                      setCouponDiscount(0);
                    }}
                    placeholder="SAVE10"
                    className="flex-1 px-4 py-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg text-white placeholder:text-white/40 focus:border-[#dc2626] focus:outline-none"
                  />
                  <button
                    onClick={handleValidateCoupon}
                    disabled={isValidatingCoupon || !couponCode.trim()}
                    className="px-4 py-3 bg-[#1a1a1a] hover:bg-[#262626] text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isValidatingCoupon ? <Loader2 className="w-5 h-5 animate-spin" /> : "Apply"}
                  </button>
                </div>
                {couponValid === true && (
                  <p className="text-green-400 text-sm mt-1">Coupon applied! {couponDiscount}% off</p>
                )}
                {couponValid === false && (
                  <p className="text-red-400 text-sm mt-1">Invalid or expired coupon</p>
                )}
              </div>
              
              {/* Order Summary */}
              <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-4 mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-white/60">Subtotal</span>
                  <span className="text-white">${(product.pricing[selectedPriceIndex].price * quantity).toFixed(2)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between mb-2 text-green-400">
                    <span>Discount ({couponDiscount}%)</span>
                    <span>-${((product.pricing[selectedPriceIndex].price * quantity * couponDiscount) / 100).toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-[#1a1a1a] pt-2 mt-2 flex justify-between">
                  <span className="text-white font-semibold">Total</span>
                  <span className="text-[#dc2626] font-bold text-xl">
                    ${((product.pricing[selectedPriceIndex].price * quantity) * (1 - couponDiscount / 100)).toFixed(2)}
                  </span>
                </div>
              </div>
              
              {checkoutError && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                  {checkoutError}
                </div>
              )}
              
              <button
                onClick={handleCheckout}
                disabled={isProcessing || !customerEmail}
                className={`w-full py-4 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                  !isProcessing && customerEmail
                    ? "bg-[#dc2626] text-white hover:bg-[#ef4444]"
                    : "bg-[#1a1a1a] text-white/50 cursor-not-allowed"
                }`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Complete Purchase
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {purchaseComplete && orderDetails && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl max-w-md w-full p-6 text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2">Purchase Complete!</h2>
              <p className="text-white/60 mb-6">
                Your license key has been sent to {customerEmail}
              </p>
              
              <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-4 mb-4">
                <p className="text-white/60 text-sm mb-1">Order Number</p>
                <p className="text-white font-mono">{orderDetails.orderNumber}</p>
              </div>
              
              <div className="bg-[#0a0a0a] border border-[#dc2626]/30 rounded-lg p-4 mb-6">
                <p className="text-white/60 text-sm mb-1">Your License Key</p>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[#dc2626] font-mono font-bold text-lg">{orderDetails.licenseKey}</p>
                  <button
                    onClick={() => copyToClipboard(orderDetails.licenseKey)}
                    className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors"
                  >
                    <Copy className="w-5 h-5 text-white/60" />
                  </button>
                </div>
              </div>
              
              <button
                onClick={() => {
                  setPurchaseComplete(false);
                  setShowCheckoutModal(false);
                  setOrderDetails(null);
                  setCustomerEmail("");
                  setCouponCode("");
                  setCouponDiscount(0);
                }}
                className="w-full py-3 bg-[#dc2626] hover:bg-[#ef4444] text-white font-semibold rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Information Section */}
        <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-6 mb-8">
          <h2 className="text-[#dc2626] font-bold text-lg mb-4 tracking-wider">INFORMATION</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#dc2626] rounded-full" />
              <span className="text-white/80 text-sm">Supported CPU: {product.requirements.cpu}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#dc2626] rounded-full" />
              <span className="text-white/80 text-sm">Supported Windows Version: {product.requirements.windows}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#dc2626] rounded-full" />
              <span className="text-white/80 text-sm">Cheat Type: {product.requirements.cheatType}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#dc2626] rounded-full" />
              <span className="text-white/80 text-sm">
                {product.requirements.controller ? "Controller Supported" : "Controller Not Supported"}
              </span>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* AIMBOT Card */}
          <div className="relative bg-[#111111] rounded-xl p-6 overflow-hidden group hover:shadow-lg hover:shadow-[#dc2626]/10 transition-all duration-300">
            {/* Curved left border effect */}
            <div className="absolute left-0 top-4 bottom-4 w-1 bg-[#dc2626] rounded-full" />
            <div className="pl-4">
              <h3 className="text-white font-bold text-lg mb-1">AIMBOT</h3>
              <p className="text-white/50 text-sm mb-4">External Aim Assistance With Tuning.</p>
              <ul className="space-y-2.5">
                {product.features.aimbot && product.features.aimbot.length > 0 ? (
                  product.features.aimbot.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2.5 text-sm">
                      <span className="w-1.5 h-1.5 bg-[#dc2626] rounded-full flex-shrink-0" />
                      <span className="text-white/70">{feature}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-white/40 text-sm italic">No aimbot features</li>
                )}
              </ul>
            </div>
          </div>

          {/* ESP Card */}
          <div className="relative bg-[#111111] rounded-xl p-6 overflow-hidden group hover:shadow-lg hover:shadow-[#dc2626]/10 transition-all duration-300">
            {/* Curved left border effect */}
            <div className="absolute left-0 top-4 bottom-4 w-1 bg-[#dc2626] rounded-full" />
            <div className="pl-4">
              <h3 className="text-white font-bold text-lg mb-1">ESP</h3>
              <p className="text-white/50 text-sm mb-4">Enemy, Item, And Loot Awareness.</p>
              <ul className="space-y-2.5">
                {product.features.esp && product.features.esp.length > 0 ? (
                  product.features.esp.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2.5 text-sm">
                      <span className="w-1.5 h-1.5 bg-[#dc2626] rounded-full flex-shrink-0" />
                      <span className="text-white/70">{feature}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-white/40 text-sm italic">No ESP features</li>
                )}
              </ul>
            </div>
          </div>

          {/* MISC Card */}
          <div className="relative bg-[#111111] rounded-xl p-6 overflow-hidden group hover:shadow-lg hover:shadow-[#dc2626]/10 transition-all duration-300">
            {/* Curved left border effect */}
            <div className="absolute left-0 top-4 bottom-4 w-1 bg-[#dc2626] rounded-full" />
            <div className="pl-4">
              <h3 className="text-white font-bold text-lg mb-1">MISC</h3>
              <p className="text-white/50 text-sm mb-4">Customization And Utility Features.</p>
              <ul className="space-y-2.5">
                {product.features.misc && product.features.misc.length > 0 ? (
                  product.features.misc.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2.5 text-sm">
                      <span className="w-1.5 h-1.5 bg-[#dc2626] rounded-full flex-shrink-0" />
                      <span className="text-white/70">{feature}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-white/40 text-sm italic">No misc features</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mb-8">
          <h2 className="text-white font-bold text-lg mb-6 flex items-center gap-3">
            <span className="w-1 h-6 bg-[#dc2626] rounded-full" />
            CUSTOMER REVIEWS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(reviews.length > 0 ? reviews : getProductReviews(product.name)).map((review, index) => (
              <div 
                key={review.id || index} 
                className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-5 hover:border-[#dc2626]/30 transition-all duration-300 group"
              >
                <p className="text-white/80 text-sm mb-5 leading-relaxed line-clamp-4">{review.text}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#dc2626] flex items-center justify-center text-white text-sm font-bold">
                      {review.avatar || review.username[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{review.username}</p>
                      <p className="text-white/40 text-xs">{formatDate(review.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-white font-bold text-sm">{review.rating}</span>
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-6">
          <div className="space-y-6">
            {[
              {
                question: "Are Magma Cheats undetectable?",
                answer: "Our cheats are built with the latest security measures to stay ahead of anti-cheat systems. We continuously update our software to minimize detection risks, giving you the safest experience possible."
              },
              {
                question: "What's the difference between cheats?",
                answer: "The difference comes down to the game supported, included features, and customization. Some cheats include advanced visuals or extra aimbot features, while others are optimized for maximum stealth."
              },
              {
                question: "Where can I get customer support?",
                answer: "Our dedicated support team is available 24/7 to assist you. You can reach us anytime through our Discord server for fast and reliable assistance."
              },
              {
                question: "How do I purchase and get instant access?",
                answer: "Simply select your desired package, complete the payment, and within seconds, your access key will be delivered instantly. No waiting, no delays."
              }
            ].map((faq, index) => (
              <div key={index} className="pb-6 border-b border-[#1a1a1a] last:border-0 last:pb-0">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-[#dc2626] flex items-center justify-center text-[#dc2626] text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg mb-2">{faq.question}</h3>
                    <p className="text-white/60 text-sm leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
