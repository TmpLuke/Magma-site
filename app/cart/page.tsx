"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useCart } from "@/lib/cart-context";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingCart, ArrowLeft, Mail, Tag } from "lucide-react";
import { processPurchase, validateCoupon } from "@/lib/purchase-actions";
import { Loader2, X } from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const { items, removeFromCart, updateQuantity, getTotal, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [customerEmail, setCustomerEmail] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponValid, setCouponValid] = useState<boolean | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsValidatingCoupon(true);
    try {
      // Validate coupon for first product (or implement multi-product coupon logic)
      const firstProductId = items[0]?.productId;
      if (firstProductId) {
        const result = await validateCoupon(couponCode, firstProductId);
        if (result.valid && result.discount) {
          setCouponDiscount(result.discount);
          setCouponValid(true);
        } else {
          setCouponDiscount(0);
          setCouponValid(false);
        }
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

    if (items.length === 0) {
      setCheckoutError("Your cart is empty");
      return;
    }

    setIsProcessing(true);
    setCheckoutError(null);

    try {
      // Process first item for now (can be extended for multiple items)
      const firstItem = items[0];
      const totalAmount = getTotal() * (1 - couponDiscount / 100);

      const result = await processPurchase({
        productId: firstItem.productId,
        productName: firstItem.productName,
        productSlug: firstItem.productSlug,
        duration: firstItem.duration,
        price: totalAmount,
        customerEmail: customerEmail,
        couponCode: couponValid ? couponCode : undefined,
      });

      if (result.success && result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
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

  const subtotal = getTotal();
  const discount = (subtotal * couponDiscount) / 100;
  const total = subtotal - discount;

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Header />

      <div className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Shopping Cart</h1>
              <p className="text-white/60">
                {items.length} {items.length === 1 ? "item" : "items"} in your cart
              </p>
            </div>
            <Link
              href="/store"
              className="inline-flex items-center gap-2 text-white/60 hover:text-[#dc2626] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Link>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingCart className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Your cart is empty</h2>
              <p className="text-white/60 mb-6">Add some products to get started!</p>
              <Link
                href="/store"
                className="inline-block px-6 py-3 bg-[#dc2626] hover:bg-[#ef4444] text-white rounded-lg font-semibold transition-colors"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-6 flex gap-6"
                  >
                    {/* Product Image */}
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-[#1a1a1a] flex-shrink-0">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.productName}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-white font-bold text-lg mb-1">{item.productName}</h3>
                          <p className="text-white/60 text-sm">{item.game}</p>
                          <p className="text-white/50 text-sm mt-1">{item.duration}</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-white/40 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-3 bg-[#1a1a1a] rounded-lg p-1 border border-[#262626]">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded bg-[#dc2626] hover:bg-[#ef4444] flex items-center justify-center text-white transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center text-white font-bold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded bg-[#dc2626] hover:bg-[#ef4444] flex items-center justify-center text-white transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-white font-bold text-xl">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-6 sticky top-24">
                  <h2 className="text-white font-bold text-lg mb-6">Order Summary</h2>

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
                    <div className="flex justify-between text-white font-bold text-lg pt-2">
                      <span>Total</span>
                      <span className="text-[#dc2626]">${total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <button
                    onClick={() => setShowCheckoutModal(true)}
                    className="w-full py-4 bg-[#dc2626] hover:bg-[#ef4444] text-white rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckoutModal && (
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
              {items.length} {items.length === 1 ? "item" : "items"} in your cart
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
              <p className="text-white/50 text-xs mt-1">Your license keys will be sent to this email</p>
            </div>

            {/* Order Summary in Modal */}
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-4 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-white/60">Subtotal</span>
                <span className="text-white">${subtotal.toFixed(2)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between mb-2 text-green-400">
                  <span>Discount ({couponDiscount}%)</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-[#1a1a1a] pt-2 mt-2 flex justify-between">
                <span className="text-white font-semibold">Total</span>
                <span className="text-[#dc2626] font-bold text-xl">${total.toFixed(2)}</span>
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

      <Footer />
    </main>
  );
}
