"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, CreditCard, Tag } from "lucide-react";
import Image from "next/image";
import { processPurchase, validateCoupon } from "@/lib/purchase-actions";

export default function ConfirmCheckoutPage() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponValid, setCouponValid] = useState<boolean | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const subtotal = getTotal();
  const discount = (subtotal * couponDiscount) / 100;
  const total = subtotal - discount;

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsValidatingCoupon(true);
    try {
      const result = await validateCoupon(couponCode);
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
    if (items.length === 0) {
      setError("Your cart is empty");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const firstItem = items[0];
      const result = await processPurchase({
        productId: firstItem.productId,
        productName: firstItem.productName,
        productSlug: firstItem.productSlug,
        duration: firstItem.duration,
        price: total,
        customerEmail: user?.email || "",
        couponCode: couponValid ? couponCode : undefined,
      });

      if (result.success && result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        setError(result.error || "Failed to process purchase. Please try again.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    router.push("/cart");
    return null;
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Header />

      <div className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-2">Confirm & Pay</h1>
            <p className="text-white/60">Review your order and complete payment</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Cart Items */}
              <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Order Items</h3>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4 pb-4 border-b border-[#1a1a1a] last:border-0 last:pb-0">
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-[#1a1a1a] flex-shrink-0">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.productName}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-bold mb-1">{item.productName}</h4>
                        <p className="text-white/60 text-sm mb-1">{item.duration}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-white/50 text-sm">Quantity: {item.quantity}</span>
                          <span className="text-[#dc2626] font-bold">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Info */}
              {user && (
                <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Customer Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-white/60">Email</span>
                      <span className="text-white">{user.email}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Summary */}
            <div className="lg:col-span-1">
              <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-6 sticky top-24">
                <h3 className="text-xl font-bold text-white mb-6">Payment Summary</h3>

                {/* Coupon Code */}
                <div className="mb-6">
                  <label className="block text-white/80 text-sm mb-2">Coupon Code</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value.toUpperCase());
                          setCouponValid(null);
                          setCouponDiscount(0);
                        }}
                        placeholder="SAVE10"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg text-white placeholder:text-white/40 focus:border-[#dc2626] focus:outline-none text-sm"
                      />
                    </div>
                    <button
                      onClick={handleValidateCoupon}
                      disabled={isValidatingCoupon || !couponCode.trim()}
                      className="px-4 py-2.5 bg-[#1a1a1a] hover:bg-[#262626] text-white rounded-lg transition-colors disabled:opacity-50 text-sm"
                    >
                      {isValidatingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                    </button>
                  </div>
                  {couponValid === true && (
                    <p className="text-green-400 text-xs mt-1">Coupon applied! {couponDiscount}% off</p>
                  )}
                  {couponValid === false && (
                    <p className="text-red-400 text-xs mt-1">Invalid or expired coupon</p>
                  )}
                </div>

                {/* Totals */}
                <div className="space-y-3 mb-6 pb-6 border-b border-[#1a1a1a]">
                  <div className="flex justify-between text-white/60 text-sm">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-green-400 text-sm">
                      <span>Discount ({couponDiscount}%)</span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-white font-bold text-xl pt-2">
                    <span>Total</span>
                    <span className="text-[#dc2626]">${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className="w-full py-4 bg-[#dc2626] hover:bg-[#ef4444] text-white rounded-lg font-bold text-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Complete Payment
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <p className="text-white/50 text-xs text-center mt-4">
                  Secure payment powered by Money Motion
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
