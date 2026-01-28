"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useCart } from "@/lib/cart-context";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingCart, ArrowLeft, X } from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const { items, removeFromCart, updateQuantity, getTotal, clearCart } = useCart();

  const subtotal = getTotal();

  const handleCheckout = () => {
    router.push("/checkout/login");
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Header />

      <div className="pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Your Cart</h1>
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
            <div className="space-y-6">
              {/* Cart Items */}
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-6"
                  >
                    <div className="flex gap-6 items-center">
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
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-white font-bold text-xl mb-1">
                              {item.quantity}x {item.productName}
                            </h3>
                            <p className="text-white/60 text-sm mb-1">
                              <span className="uppercase font-semibold">QUANTITY</span>
                            </p>
                            <div className="flex items-center gap-3 bg-[#0a0a0a] rounded-lg p-1 border border-[#262626] w-fit">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-8 h-8 rounded bg-[#dc2626] hover:bg-[#ef4444] flex items-center justify-center text-white transition-colors"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-8 text-center text-white font-bold">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 rounded bg-[#dc2626] hover:bg-[#ef4444] flex items-center justify-center text-white transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-white/60 text-sm mb-1 uppercase font-semibold">
                              Price
                            </p>
                            <p className="text-[#dc2626] font-bold text-2xl">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors text-sm font-semibold"
                        >
                          <X className="w-4 h-4" />
                          REMOVE FROM CART
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-[#1a1a1a]">
                {/* Empty Cart Button */}
                <button
                  onClick={clearCart}
                  className="flex items-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors font-semibold"
                >
                  <X className="w-5 h-5" />
                  EMPTY CART
                </button>

                {/* Subtotal & Checkout */}
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-white/60 text-sm mb-1 uppercase font-semibold">
                      Subtotal
                    </p>
                    <p className="text-[#dc2626] font-bold text-3xl">
                      ${subtotal.toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="px-8 py-4 bg-[#dc2626] hover:bg-[#ef4444] text-white rounded-lg font-bold text-lg transition-colors flex items-center gap-2"
                  >
                    Checkout
                    <ArrowLeft className="w-5 h-5 rotate-180" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
