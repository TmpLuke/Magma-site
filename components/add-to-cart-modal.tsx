"use client";

import { X, ShoppingCart, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

interface AddToCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    name: string;
    image: string;
    duration: string;
    quantity: number;
  };
}

export function AddToCartModal({ isOpen, onClose, product }: AddToCartModalProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Icon */}
        <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingCart className="w-6 h-6 text-green-500" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white text-center mb-2">Added to cart</h2>

        {/* Product Info */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-4 mb-6">
          <div className="flex gap-4 items-center">
            <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-[#1a1a1a] flex-shrink-0">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold mb-1">{product.name}</h3>
              <p className="text-white/60 text-sm mb-1">{product.duration}</p>
              <p className="text-white/50 text-sm">Quantity: {product.quantity}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/cart"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full py-3 bg-[#dc2626] hover:bg-[#ef4444] text-white rounded-lg font-semibold transition-colors"
          >
            Review & Checkout
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            onClick={onClose}
            className="w-full py-3 bg-[#1a1a1a] hover:bg-[#262626] text-white rounded-lg font-semibold transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
