"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { XCircle, ArrowLeft, RefreshCw, HelpCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function PaymentCancelledContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div
        className={`max-w-lg w-full transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        {/* Cancelled Card */}
        <div className="bg-[#111111] border border-[#262626] rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-red-500/20 via-red-500/10 to-transparent p-8 border-b border-[#262626] overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
              <div
                className="absolute -bottom-10 -left-10 w-32 h-32 bg-red-500/10 rounded-full blur-2xl animate-pulse"
                style={{ animationDelay: "0.5s" }}
              />
            </div>

            <div className="relative flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/30">
                <XCircle className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Payment Cancelled</h1>
                <p className="text-white/60">Your order was not completed</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            <div className="text-center space-y-2">
              <p className="text-white/80">
                Your payment was cancelled or did not complete successfully.
              </p>
              <p className="text-white/60 text-sm">
                No charges have been made to your account.
              </p>
            </div>

            {/* Order Reference */}
            {orderNumber && (
              <div className="bg-[#0a0a0a] rounded-xl p-4">
                <p className="text-white/60 text-sm mb-1">Order Reference</p>
                <p className="text-white font-mono">{orderNumber}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-4">
              <Link href="/store">
                <Button className="w-full bg-[#dc2626] hover:bg-[#ef4444] text-white py-6">
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Try Again
                </Button>
              </Link>
              <Link href="/">
                <Button
                  variant="outline"
                  className="w-full border-[#262626] hover:bg-[#1a1a1a] text-white py-6 bg-transparent"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Return to Home
                </Button>
              </Link>
            </div>

            {/* Support Note */}
            <div className="text-center pt-4 border-t border-[#262626]">
              <p className="text-white/60 text-sm flex items-center justify-center gap-2">
                <HelpCircle className="w-4 h-4" />
                Having issues?{" "}
                <a 
                  href="https://discord.gg/magmacheats" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[#dc2626] hover:underline"
                >
                  Contact support
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCancelledPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#dc2626] animate-spin" />
      </div>
    }>
      <PaymentCancelledContent />
    </Suspense>
  );
}
