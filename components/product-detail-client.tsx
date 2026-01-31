"use client";

import { useState, useEffect } from "react";
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
  Check,
  TrendingUp,
  Users,
  Sparkles,
  Lock,
  Clock,
  Package,
  Award,
  ChevronRight,
  Eye,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { processPurchase, validateCoupon } from "@/lib/purchase-actions";
import { useCart } from "@/lib/cart-context";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { AddToCartModal } from "@/components/add-to-cart-modal";
import { ReviewModal } from "@/components/review-modal";
import { createReview } from "@/lib/supabase/data";

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
  featureCards?: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
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
    "Call of Duty": [
      { id: "1", username: "COD_Veteran", avatarImage: avatarImages[0], rating: 5, text: "Best COD cheat I've used. The aimbot is smooth and the ESP is perfect for tracking enemies through walls.", created_at: "2026-01-19T15:00:00Z" },
      { id: "2", username: "WarzonePro", avatarImage: avatarImages[1], rating: 5, text: "Dominating Warzone lobbies! The UAV hack and loot ESP make every game easy mode.", created_at: "2026-01-16T12:30:00Z" },
      { id: "3", username: "ModernWarfare", avatarImage: avatarImages[2], rating: 5, text: "Undetected for 2 months now. Customer support is top tier, helped me configure everything perfectly.", created_at: "2026-01-13T10:20:00Z" },
    ],
    "Valorant": [
      { id: "1", username: "RadiantPlayer", avatarImage: avatarImages[2], rating: 5, text: "Finally hit Radiant with this cheat! The triggerbot is insane and the ESP shows abilities perfectly.", created_at: "2026-01-20T14:00:00Z" },
      { id: "2", username: "ValorantKing", avatarImage: avatarImages[0], rating: 5, text: "Bypasses Vanguard flawlessly. Been using for weeks with zero detection. Worth every penny.", created_at: "2026-01-17T11:30:00Z" },
      { id: "3", username: "AgentMain", avatarImage: avatarImages[1], rating: 4, text: "Great cheat overall. The recoil control is perfect. Would love to see more agent-specific features.", created_at: "2026-01-14T09:15:00Z" },
    ],
    "CS2": [
      { id: "1", username: "CS_Legend", avatarImage: avatarImages[1], rating: 5, text: "Best CS2 cheat on the market. The bhop and triggerbot work flawlessly. Climbing ranks fast!", created_at: "2026-01-19T16:00:00Z" },
      { id: "2", username: "GlobalElite", avatarImage: avatarImages[2], rating: 5, text: "Smooth aimbot that doesn't look suspicious. The skin changer is a nice bonus feature.", created_at: "2026-01-16T13:30:00Z" },
      { id: "3", username: "CounterStrike", avatarImage: avatarImages[0], rating: 5, text: "Undetected and reliable. Support team helped me optimize settings for my playstyle.", created_at: "2026-01-13T10:45:00Z" },
    ],
    "Apex Legends": [
      { id: "1", username: "ApexPredator", avatarImage: avatarImages[0], rating: 5, text: "The Apex cheat is incredible! Smooth aimbot and the ESP helps me track every squad. Been using for 3 weeks with zero issues.", created_at: "2026-01-18T12:00:00Z" },
      { id: "2", username: "LegendSeeker", avatarImage: avatarImages[1], rating: 5, text: "Finally a working Apex cheat. The item ESP is a game changer for looting. Support helped me set everything up perfectly.", created_at: "2026-01-15T10:30:00Z" },
      { id: "3", username: "BRKing", avatarImage: avatarImages[2], rating: 4, text: "Solid cheat for Apex. Had some FPS drops initially but after tweaking settings it runs smooth now.", created_at: "2026-01-12T15:45:00Z" },
    ],
    "Overwatch 2": [
      { id: "1", username: "OW2Master", avatarImage: avatarImages[2], rating: 5, text: "Climbing to Grandmaster has never been easier! The aimbot works perfectly with every hero.", created_at: "2026-01-20T15:00:00Z" },
      { id: "2", username: "SupportMain", avatarImage: avatarImages[0], rating: 5, text: "Even as a support main, this cheat helps me survive and track flankers. Amazing ESP features.", created_at: "2026-01-17T12:30:00Z" },
      { id: "3", username: "DPSCarry", avatarImage: avatarImages[1], rating: 5, text: "The ultimate tracking ESP is clutch. Never miss an enemy ult again. Highly recommend!", created_at: "2026-01-14T10:20:00Z" },
    ],
    "Warzone": [
      { id: "1", username: "WarzoneKing", avatarImage: avatarImages[1], rating: 5, text: "Best Warzone cheat hands down! The UAV hack and loot ESP make every game a breeze.", created_at: "2026-01-19T17:00:00Z" },
      { id: "2", username: "VerdanskPro", avatarImage: avatarImages[2], rating: 5, text: "Dropping 20+ kills every game now. The aimbot is smooth and doesn't look suspicious at all.", created_at: "2026-01-16T14:30:00Z" },
      { id: "3", username: "BRChampion", avatarImage: avatarImages[0], rating: 5, text: "Undetected for months. Customer support is incredible, helped me with every question.", created_at: "2026-01-13T11:45:00Z" },
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
  const router = useRouter();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedPriceIndex, setSelectedPriceIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState<"features" | "reviews" | "faq">("features");
  
  // Check if product has pricing
  const hasPricing = product.pricing && product.pricing.length > 0;
  const selectedTier = hasPricing ? product.pricing[selectedPriceIndex] : null;
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
  
  // Add to cart modal state
  const [showAddToCartModal, setShowAddToCartModal] = useState(false);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [localReviews, setLocalReviews] = useState<Review[]>(reviews || []);

  // Update local reviews when props change
  useEffect(() => {
    if (reviews && reviews.length > 0) {
      setLocalReviews(reviews);
    }
  }, [reviews]);

  const handleReviewSubmit = async (data: { username: string; rating: number; text: string; image_url?: string }) => {
    try {
      const newReview = {
        username: data.username,
        rating: data.rating,
        text: data.text,
        image_url: data.image_url,
        avatar: data.username.charAt(0).toUpperCase(),
        verified: true,
      };

      const savedReview = await createReview(newReview);

      if (savedReview) {
        setLocalReviews([savedReview, ...localReviews]);
        toast({
          title: "Review Submitted",
          description: "Thank you for your feedback!",
        });
      } else {
        throw new Error("Failed to save review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Live viewing counter animation
  const [viewingCount, setViewingCount] = useState(42);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setViewingCount(prev => {
        const change = Math.random() > 0.5 ? 1 : -1;
        return Math.max(35, Math.min(58, prev + change));
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Auto-rotate gallery
  useEffect(() => {
    if (product.gallery && product.gallery.length > 1) {
      const interval = setInterval(() => {
        setSelectedImage(prev => (prev + 1) % product.gallery!.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [product.gallery]);

  const handleAddToCart = () => {
    if (!selectedTier) {
      toast({
        title: "No pricing available",
        description: "This product doesn't have pricing configured yet.",
        variant: "destructive",
      });
      return;
    }
    
    addToCart({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      game: product.game,
      image: product.image,
      duration: selectedTier.duration,
      price: selectedTier.price,
      quantity: quantity,
    });
    setShowAddToCartModal(true);
  };

  const handleBuyNow = () => {
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
      if (!selectedTier) {
        throw new Error("No pricing available for this product");
      }
      
      let totalAmount = selectedTier.price * quantity;
      
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
        window.location.href = result.checkoutUrl;
      } else if (result.success && result.licenseKey) {
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
    toast({
      title: "Copied!",
      description: "Copied to clipboard",
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  return (
    <div className="pt-24 pb-16 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#dc2626]/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#dc2626]/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Enhanced Breadcrumb */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href={gameSlug ? `/store/${gameSlug}` : "/store"}
            className="group inline-flex items-center gap-2 px-4 py-2 bg-[#111111] border border-[#1a1a1a] rounded-lg text-white/60 hover:text-[#dc2626] hover:border-[#dc2626]/30 transition-all"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {gameSlug ? `Back to ${product.game} Cheats` : "Back to Store"}
          </Link>
          
          {/* Live Viewing Indicator */}
          <div className="flex items-center gap-2 px-4 py-2 bg-[#111111] border border-[#1a1a1a] rounded-lg">
            <div className="relative">
              <Eye className="w-4 h-4 text-[#dc2626]" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#dc2626] rounded-full animate-ping" />
            </div>
            <span className="text-white/80 text-sm font-medium">{viewingCount} viewing now</span>
          </div>
        </div>



        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Left: Enhanced Image Gallery */}
          <div className="space-y-6">
            {/* Main Image with Zoom Effect */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#dc2626]/50 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
              <div className="relative w-full bg-[#111111] border-2 border-[#1a1a1a] rounded-2xl overflow-hidden" style={{ aspectRatio: "16/9" }}>
                <Image
                  src={product.gallery && product.gallery.length > 0 && selectedImage < product.gallery.length
                    ? product.gallery[selectedImage]
                    : "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover transform group-hover:scale-110 transition-transform duration-700"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded-lg text-white text-sm">
                  {selectedImage + 1} / {product.gallery?.length || 1}
                </div>
              </div>
            </div>
            
            {/* Enhanced Thumbnail Gallery */}
            {product.gallery && product.gallery.length > 0 && (
              <div className="flex gap-4 flex-wrap">
                {product.gallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative group/thumb w-28 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                      selectedImage === idx
                        ? "border-[#dc2626] ring-2 ring-[#dc2626]/50 scale-105"
                        : "border-[#1a1a1a] hover:border-[#dc2626]/50 hover:scale-105"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      fill
                      className="object-cover transform group-hover/thumb:scale-110 transition-transform"
                    />
                    {selectedImage === idx && (
                      <div className="absolute inset-0 bg-[#dc2626]/20 flex items-center justify-center">
                        <Check className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Trust Badges - Dynamic Feature Cards */}
            <div className="grid grid-cols-3 gap-4">
              {(product.featureCards || [
                { icon: "Shield", title: "Secure", description: "SSL Protected" },
                { icon: "Zap", title: "Instant", description: "Auto Delivery" },
                { icon: "Users", title: "Support", description: "24/7 Available" }
              ]).map((card, idx) => {
                const IconComponent = card.icon === "Shield" ? Shield : card.icon === "Zap" ? Zap : Users;
                return (
                  <div key={idx} className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4 text-center hover:border-[#dc2626]/30 transition-all group">
                    <IconComponent className="w-8 h-8 text-[#dc2626] mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-white text-sm font-semibold mb-1">{card.title}</p>
                    <p className="text-white/50 text-xs">{card.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Enhanced Product Details */}
          <div className="space-y-6">
            {/* Product Name with Animation */}
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 animate-fade-in">{product.name}</h1>
              
              {/* Enhanced Status Badges */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#1a1a1a] to-[#111111] text-white text-sm border border-[#262626] hover:border-[#dc2626]/30 transition-all">
                  <Zap className="w-4 h-4 text-[#dc2626] group-hover:animate-pulse" />
                  Instant Delivery
                </span>
                <span
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold relative overflow-hidden group ${
                    product.status === "active"
                      ? "bg-green-500/10 text-green-400 border-2 border-green-500/30"
                      : "bg-yellow-500/10 text-yellow-400 border-2 border-yellow-500/30"
                  }`}
                >
                  <Shield className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  {product.status === "active" ? "Undetected (Working)" : "Maintenance"}
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#dc2626]/10 text-[#dc2626] text-sm border border-[#dc2626]/30 font-semibold">
                  <TrendingUp className="w-4 h-4" />
                  Trending
                </span>
              </div>
            </div>

            {/* Enhanced Price Display */}
            <div className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border-2 border-[#dc2626]/30 rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#dc2626]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-end justify-between">
                {selectedTier ? (
                  <>
                    <div>
                      <p className="text-white/60 text-sm mb-2 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {selectedTier.duration}
                      </p>
                      <p className="text-5xl font-bold text-white flex items-baseline gap-2">
                        <span className="text-[#dc2626]">$</span>
                        {selectedTier.price.toFixed(2)}
                      </p>
                      <p className="text-white/40 text-sm mt-1">per license</p>
                    </div>
                  </>
                ) : (
                  <div>
                    <p className="text-white/60 text-sm mb-2">No pricing available</p>
                    <p className="text-2xl font-bold text-white/40">Contact admin</p>
                  </div>
                )}
                
                {/* Enhanced Quantity Selector */}
                <div className="flex items-center gap-3 bg-[#0a0a0a] rounded-xl p-2 border border-[#1a1a1a]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#dc2626] to-[#ef4444] hover:from-[#ef4444] hover:to-[#dc2626] flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="w-12 text-center text-white font-bold text-xl">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#dc2626] to-[#ef4444] hover:from-[#ef4444] hover:to-[#dc2626] flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Enhanced Variant Cards */}
            <div className="space-y-3">
              <p className="text-white/60 text-sm font-medium flex items-center gap-2">
                <Package className="w-4 h-4" />
                Select Duration
              </p>
              {hasPricing ? (
                product.pricing.map((tier, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedPriceIndex(index)}
                    className={`relative w-full p-5 rounded-xl border-2 transition-all text-left group overflow-hidden ${
                      selectedPriceIndex === index
                        ? "bg-gradient-to-r from-[#dc2626] to-[#ef4444] border-[#dc2626] text-white shadow-2xl shadow-[#dc2626]/40 scale-105"
                        : "bg-[#111111] border-[#262626] text-white hover:border-[#dc2626]/50 hover:bg-[#1a1a1a] hover:scale-102"
                    }`}
                  >
                    {selectedPriceIndex === index && (
                      <div className="absolute top-3 right-3">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <div className="flex items-center justify-between pr-10">
                      <div>
                        <p className="text-xs font-semibold uppercase mb-2 flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          {tier.duration}
                        </p>
                        <p className="font-bold text-2xl">${tier.price.toFixed(2)}</p>
                        {selectedPriceIndex !== index && (
                          <p className="text-xs text-white/50 mt-1">Save more with longer plans</p>
                        )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-white/60 mb-1 flex items-center gap-1 justify-end">
                        <Package className="w-3 h-3" />
                        STOCK
                      </p>
                      <p className={`text-lg font-bold ${
                        tier.stock === 0 ? 'text-red-500' : 
                        tier.stock < 10 ? 'text-yellow-400' : ''
                      }`}>
                        {tier.stock}
                      </p>
                      {tier.stock === 0 ? (
                        <p className="text-xs text-red-500 mt-1">Out of Stock</p>
                      ) : tier.stock < 10 && (
                        <p className="text-xs text-yellow-400 mt-1">Low Stock!</p>
                      )}
                    </div>
                  </div>
                </button>
              ))
              ) : (
                <div className="p-6 bg-[#111111] border-2 border-[#262626] rounded-xl text-center">
                  <p className="text-white/60 mb-2">No pricing configured</p>
                  <p className="text-white/40 text-sm">Contact admin to add pricing variants</p>
                </div>
              )}
            </div>

            {/* Checkout Error */}
            {checkoutError && (
              <div className="p-4 bg-red-500/10 border-2 border-red-500/30 rounded-xl text-red-400 text-sm animate-shake flex items-start gap-3">
                <X className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{checkoutError}</span>
              </div>
            )}

            {/* Enhanced Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={handleAddToCart}
                className="relative w-full py-5 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden group bg-white text-[#0a0a0a] hover:bg-white/90 hover:shadow-2xl hover:shadow-white/20 hover:-translate-y-1"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <ShoppingCart className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                Add To Cart
              </button>
              
              <button
                onClick={handleBuyNow}
                disabled={!selectedTier || selectedTier.stock === 0}
                className="relative w-full py-5 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden group bg-gradient-to-r from-[#dc2626] to-[#ef4444] text-white hover:from-[#ef4444] hover:to-[#dc2626] hover:shadow-2xl hover:shadow-[#dc2626]/40 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <Zap className="w-6 h-6 group-hover:scale-110 transition-transform" />
                {selectedTier 
                  ? (selectedTier.stock > 0 
                      ? `Buy Now - $${(selectedTier.price * quantity).toFixed(2)}` 
                      : 'Out of Stock') 
                  : 'No pricing available'}
              </button>
            </div>

            {/* Money Back Guarantee */}
            <div className="flex items-center justify-center gap-2 text-white/60 text-sm">
              <Shield className="w-4 h-4 text-green-400" />
              <span>Secure checkout powered by Stripe</span>
            </div>
          </div>
        </div>

        {/* Enhanced Tabs Section */}
        <div className="mb-16">
          {/* Tab Navigation */}
          <div className="flex items-center gap-2 mb-8 bg-[#111111] border border-[#1a1a1a] rounded-xl p-2">
            {[
              { id: "features", label: "Features", icon: Sparkles },
              { id: "reviews", label: "Reviews", icon: Star },
              { id: "faq", label: "FAQ", icon: CheckCircle },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-[#dc2626] to-[#ef4444] text-white shadow-lg shadow-[#dc2626]/30"
                    : "text-white/60 hover:text-white hover:bg-[#1a1a1a]"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="animate-fade-in">
            {activeTab === "features" && (
              <div className="space-y-8">
                {/* Information Section */}
                <div className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-[#dc2626]/10 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-[#dc2626]" />
                    </div>
                    <h2 className="text-[#dc2626] font-bold text-2xl tracking-wider">SYSTEM REQUIREMENTS</h2>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { icon: Package, label: "CPU", value: product.requirements.cpu },
                      { icon: Shield, label: "Windows", value: product.requirements.windows },
                      { icon: Lock, label: "Type", value: product.requirements.cheatType },
                      { icon: Check, label: "Controller", value: product.requirements.controller ? "Supported" : "Not Supported" },
                    ].map((req, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-4 bg-[#0a0a0a]/50 rounded-xl border border-[#1a1a1a] hover:border-[#dc2626]/30 transition-all group">
                        <div className="w-10 h-10 rounded-lg bg-[#dc2626]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <req.icon className="w-5 h-5 text-[#dc2626]" />
                        </div>
                        <div>
                          <p className="text-white/50 text-xs font-medium uppercase">{req.label}</p>
                          <p className="text-white font-semibold">{req.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Features Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { title: "AIMBOT", desc: "External Aim Assistance With Tuning", features: product.features.aimbot, gradient: "from-red-500/20 to-orange-500/20" },
                    { title: "ESP", desc: "Enemy, Item, And Loot Awareness", features: product.features.esp, gradient: "from-purple-500/20 to-pink-500/20" },
                    { title: "MISC", desc: "Customization And Utility Features", features: product.features.misc, gradient: "from-blue-500/20 to-cyan-500/20" },
                  ].map((category, idx) => (
                    <div key={idx} className="group relative bg-gradient-to-br from-[#111111] to-[#0a0a0a] rounded-2xl p-6 border border-[#1a1a1a] hover:border-[#dc2626]/30 transition-all overflow-hidden">
                      <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                      <div className="absolute left-0 top-6 bottom-6 w-1 bg-gradient-to-b from-[#dc2626] to-transparent rounded-full" />
                      <div className="relative pl-4">
                        <h3 className="text-white font-bold text-xl mb-2">{category.title}</h3>
                        <p className="text-white/50 text-sm mb-6">{category.desc}</p>
                        <ul className="space-y-3">
                          {category.features && category.features.length > 0 ? (
                            category.features.map((feature, featureIdx) => (
                              <li key={featureIdx} className="flex items-start gap-3 text-sm group/item">
                                <CheckCircle className="w-4 h-4 text-[#dc2626] flex-shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform" />
                                <span className="text-white/70 group-hover/item:text-white transition-colors">{feature}</span>
                              </li>
                            ))
                          ) : (
                            <li className="text-white/40 text-sm italic">No {category.title.toLowerCase()} features</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-6">
                {/* Review Stats */}
                <div className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-8">
                  <div className="grid md:grid-cols-4 gap-6 text-center">
                    <div className="space-y-2">
                      <p className="text-5xl font-bold text-[#dc2626]">4.9</p>
                      <div className="flex items-center justify-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                        ))}
                      </div>
                      <p className="text-white/60 text-sm">Average Rating</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-5xl font-bold text-white">2.4K+</p>
                      <p className="text-white/60 text-sm">Total Reviews</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-5xl font-bold text-green-400">98%</p>
                      <p className="text-white/60 text-sm">Satisfaction</p>
                    </div>
                    <div className="space-y-2">
                      <button 
                        onClick={() => setIsReviewModalOpen(true)}
                        className="w-full h-full min-h-[100px] flex flex-col items-center justify-center gap-2 bg-[#dc2626]/10 hover:bg-[#dc2626]/20 border border-[#dc2626]/20 rounded-xl transition-all group cursor-pointer"
                      >
                        <PenLine className="w-8 h-8 text-[#dc2626] group-hover:scale-110 transition-transform" />
                        <span className="text-[#dc2626] font-bold">Write a Review</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Reviews Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {(localReviews.length > 0 ? localReviews : getProductReviews(product.name)).map((review, index) => (
                    <div 
                      key={review.id || index} 
                      className="group relative bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 hover:border-[#dc2626]/30 transition-all duration-300 overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#dc2626]/5 rounded-full blur-2xl group-hover:bg-[#dc2626]/10 transition-colors" />
                      <div className="relative">
                        <div className="flex items-center gap-1 mb-4">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}`}
                            />
                          ))}
                        </div>
                        <p className="text-white/80 text-sm mb-6 leading-relaxed line-clamp-4">{review.text}</p>
                        <div className="flex items-center gap-3 pt-4 border-t border-[#1a1a1a]">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#dc2626] to-[#ef4444] flex items-center justify-center text-white text-sm font-bold ring-2 ring-[#dc2626]/20">
                            {review.avatar || review.username[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white text-sm font-semibold">{review.username}</p>
                            <p className="text-white/40 text-xs">{formatDate(review.created_at)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "faq" && (
              <div className="space-y-4">
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
                  <div 
                    key={index} 
                    className="group bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 hover:border-[#dc2626]/30 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-[#dc2626] to-[#ef4444] flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-[#dc2626]/20">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2 group-hover:text-[#dc2626] transition-colors">
                          {faq.question}
                          <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h3>
                        <p className="text-white/70 text-sm leading-relaxed">{faq.answer}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ReviewModal
        open={isReviewModalOpen}
        onOpenChange={setIsReviewModalOpen}
        onSubmit={handleReviewSubmit}
      />

      {/* Enhanced Checkout Modal */}
      {showCheckoutModal && !purchaseComplete && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border-2 border-[#1a1a1a] rounded-2xl max-w-md w-full p-8 relative shadow-2xl">
            <button
              onClick={() => setShowCheckoutModal(false)}
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-lg bg-[#1a1a1a] text-white/60 hover:text-white hover:bg-[#dc2626] transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#dc2626]/10 flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-[#dc2626]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Complete Purchase</h2>
                <p className="text-white/60 text-sm">
                  {product.name} - {selectedTier ? selectedTier.duration : 'No pricing'}
                </p>
              </div>
            </div>
            
            {/* Email Input */}
            <div className="mb-5 group/input">
              <label className="block text-white/80 text-sm mb-2 font-medium">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within/input:text-[#dc2626] transition-colors" />
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-[#0a0a0a] border-2 border-[#1a1a1a] rounded-xl text-white placeholder:text-white/40 focus:border-[#dc2626] focus:outline-none focus:ring-2 focus:ring-[#dc2626]/20 transition-all"
                />
              </div>
              <p className="text-white/50 text-xs mt-2">Your license key will be sent to this email</p>
            </div>
            
            {/* Coupon Code */}
            <div className="mb-6">
              <label className="block text-white/80 text-sm mb-2 font-medium">Coupon Code (Optional)</label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value.toUpperCase());
                    setCouponValid(null);
                    setCouponDiscount(0);
                  }}
                  placeholder="SAVE10"
                  className="flex-1 px-4 py-3.5 bg-[#0a0a0a] border-2 border-[#1a1a1a] rounded-xl text-white placeholder:text-white/40 focus:border-[#dc2626] focus:outline-none focus:ring-2 focus:ring-[#dc2626]/20 transition-all"
                />
                <button
                  onClick={handleValidateCoupon}
                  disabled={isValidatingCoupon || !couponCode.trim()}
                  className="px-6 py-3.5 bg-[#1a1a1a] hover:bg-[#262626] text-white rounded-xl transition-all disabled:opacity-50 font-semibold"
                >
                  {isValidatingCoupon ? <Loader2 className="w-5 h-5 animate-spin" /> : "Apply"}
                </button>
              </div>
              {couponValid === true && (
                <p className="text-green-400 text-sm mt-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Coupon applied! {couponDiscount}% off
                </p>
              )}
              {couponValid === false && (
                <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
                  <X className="w-4 h-4" />
                  Invalid or expired coupon
                </p>
              )}
            </div>
            
            {/* Order Summary */}
            <div className="bg-[#0a0a0a] border-2 border-[#1a1a1a] rounded-xl p-5 mb-6 space-y-3">
              <div className="flex justify-between text-white/80">
                <span>Subtotal</span>
                <span className="font-semibold">${(product.pricing[selectedPriceIndex].price * quantity).toFixed(2)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Discount ({couponDiscount}%)</span>
                  <span className="font-semibold">-${((product.pricing[selectedPriceIndex].price * quantity * couponDiscount) / 100).toFixed(2)}</span>
                </div>
              )}
              <div className="border-t-2 border-[#1a1a1a] pt-3 flex justify-between items-center">
                <span className="text-white font-bold text-lg">Total</span>
                <span className="text-[#dc2626] font-bold text-3xl">
                  ${((product.pricing[selectedPriceIndex].price * quantity) * (1 - couponDiscount / 100)).toFixed(2)}
                </span>
              </div>
            </div>
            
            {checkoutError && (
              <div className="mb-4 p-4 bg-red-500/10 border-2 border-red-500/30 rounded-xl text-red-400 text-sm flex items-start gap-3 animate-shake">
                <X className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{checkoutError}</span>
              </div>
            )}
            
            <button
              onClick={handleCheckout}
              disabled={isProcessing || !customerEmail}
              className={`relative w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden ${
                !isProcessing && customerEmail
                  ? "bg-gradient-to-r from-[#dc2626] to-[#ef4444] text-white hover:from-[#ef4444] hover:to-[#dc2626] hover:shadow-2xl hover:shadow-[#dc2626]/40 hover:-translate-y-1"
                  : "bg-[#1a1a1a] text-white/40 cursor-not-allowed"
              }`}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              {isProcessing ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Lock className="w-6 h-6" />
                  Complete Secure Purchase
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Success Modal */}
      {purchaseComplete && orderDetails && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border-2 border-green-500/30 rounded-2xl max-w-md w-full p-8 text-center shadow-2xl">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-full flex items-center justify-center mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
              <CheckCircle className="w-10 h-10 text-green-500 relative" />
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-3">Purchase Complete!</h2>
            <p className="text-white/60 mb-8">
              Your license key has been sent to<br />
              <span className="text-[#dc2626] font-semibold">{customerEmail}</span>
            </p>
            
            <div className="bg-[#0a0a0a] border-2 border-[#1a1a1a] rounded-xl p-5 mb-4">
              <p className="text-white/60 text-sm mb-2">Order Number</p>
              <p className="text-white font-mono font-bold text-lg">{orderDetails.orderNumber}</p>
            </div>
            
            <div className="bg-gradient-to-br from-[#dc2626]/10 to-transparent border-2 border-[#dc2626]/30 rounded-xl p-5 mb-8">
              <p className="text-white/60 text-sm mb-3">Your License Key</p>
              <div className="flex items-center justify-between gap-3 bg-[#0a0a0a] rounded-lg p-3">
                <p className="text-[#dc2626] font-mono font-bold text-lg flex-1">{orderDetails.licenseKey}</p>
                <button
                  onClick={() => copyToClipboard(orderDetails.licenseKey)}
                  className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors group"
                >
                  <Copy className="w-5 h-5 text-white/60 group-hover:text-[#dc2626]" />
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
              className="w-full py-4 bg-gradient-to-r from-[#dc2626] to-[#ef4444] hover:from-[#ef4444] hover:to-[#dc2626] text-white font-bold rounded-xl transition-all hover:shadow-xl hover:shadow-[#dc2626]/30"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}

      {/* Add to Cart Modal */}
      <AddToCartModal
        isOpen={showAddToCartModal}
        onClose={() => setShowAddToCartModal(false)}
        product={{
          name: product.name,
          image: product.image,
          duration: selectedTier ? selectedTier.duration : 'N/A',
          quantity: quantity,
        }}
      />

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

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }

        .delay-1000 {
          animation-delay: 1000ms;
        }

        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
      </div>
  );
}