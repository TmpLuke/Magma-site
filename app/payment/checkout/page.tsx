"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Loader2,
  CreditCard,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  Bitcoin,
  Wallet,
  ArrowLeft,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type PaymentStatus = "loading" | "pending" | "processing" | "completed" | "failed" | "expired";

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<PaymentStatus>("loading");
  const [paymentData, setPaymentData] = useState<{
    amount_cents: number;
    currency: string;
    paid_at: string | null;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [pollCount, setPollCount] = useState(0);

  // Mock crypto address for demo
  const cryptoAddress = "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh";

  useEffect(() => {
    if (!token) {
      setStatus("failed");
      return;
    }

    // Initial status check
    checkPaymentStatus();

    // Poll every 5 seconds for up to 10 minutes
    const interval = setInterval(() => {
      if (status === "pending" || status === "processing" || status === "loading") {
        checkPaymentStatus();
        setPollCount((prev) => prev + 1);
      }
    }, 5000);

    // Stop polling after 10 minutes
    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (status === "pending" || status === "processing") {
        setStatus("expired");
      }
    }, 600000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [token, status]);

  const checkPaymentStatus = async () => {
    try {
      const response = await fetch(`/api/payments/check-status?token=${token}`);
      const data = await response.json();

      if (data.success) {
        if (data.paid) {
          setStatus("completed");
          setPaymentData({
            amount_cents: data.amount_cents,
            currency: data.currency,
            paid_at: data.paid_at,
          });

          // Redirect to success page after 2 seconds
          setTimeout(() => {
            router.push(`/payment/success?token=${token}`);
          }, 2000);
        } else if (data.status === "expired") {
          setStatus("expired");
        } else if (data.status === "cancelled") {
          setStatus("failed");
        } else {
          setStatus("pending");
        }
      } else {
        console.error("[v0] Status check failed:", data.error);
      }
    } catch (error) {
      console.error("[v0] Error checking payment status:", error);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(cryptoAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simulate payment completion for demo
  const simulatePayment = async () => {
    setStatus("processing");
    setTimeout(() => {
      setStatus("completed");
      setPaymentData({
        amount_cents: 790,
        currency: "USD",
        paid_at: new Date().toISOString(),
      });
      setTimeout(() => {
        router.push(`/payment/success?token=${token}`);
      }, 2000);
    }, 2000);
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="bg-[#111111] border border-[#262626] rounded-2xl p-8 max-w-md w-full text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Invalid Payment Link</h1>
          <p className="text-white/60 mb-6">
            This payment link is invalid or has expired.
          </p>
          <Link href="/">
            <Button className="bg-[#dc2626] hover:bg-[#ef4444] text-white">
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to store
        </Link>

        <div className="bg-[#111111] border border-[#262626] rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#dc2626]/20 to-transparent p-6 border-b border-[#262626]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#dc2626] flex items-center justify-center">
                <Bitcoin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Crypto Payment</h1>
                <p className="text-white/60 text-sm">Powered by BrickPay</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Status indicator */}
            <div className="flex items-center justify-center mb-8">
              {status === "loading" && (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-12 h-12 text-[#dc2626] animate-spin" />
                  <p className="text-white/60">Loading payment details...</p>
                </div>
              )}

              {status === "pending" && (
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-[#dc2626]/20 flex items-center justify-center">
                      <Clock className="w-8 h-8 text-[#dc2626]" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#dc2626] flex items-center justify-center animate-pulse">
                      <span className="text-white text-xs font-bold">{pollCount}</span>
                    </div>
                  </div>
                  <p className="text-white font-medium">Awaiting Payment</p>
                  <p className="text-white/60 text-sm text-center">
                    Send the exact amount to the address below
                  </p>
                </div>
              )}

              {status === "processing" && (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-12 h-12 text-[#dc2626] animate-spin" />
                  <p className="text-white font-medium">Processing Payment</p>
                  <p className="text-white/60 text-sm">Please wait...</p>
                </div>
              )}

              {status === "completed" && (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                  </div>
                  <p className="text-green-500 font-medium">Payment Successful!</p>
                  <p className="text-white/60 text-sm">Redirecting to confirmation...</p>
                </div>
              )}

              {status === "failed" && (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                    <XCircle className="w-10 h-10 text-red-500" />
                  </div>
                  <p className="text-red-500 font-medium">Payment Failed</p>
                  <p className="text-white/60 text-sm">Please try again or <a href="https://discord.gg/magmacheats" target="_blank" rel="noopener noreferrer" className="text-[#dc2626] hover:underline">contact support</a></p>
                </div>
              )}

              {status === "expired" && (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <Clock className="w-10 h-10 text-yellow-500" />
                  </div>
                  <p className="text-yellow-500 font-medium">Payment Expired</p>
                  <p className="text-white/60 text-sm">Please create a new order</p>
                </div>
              )}
            </div>

            {/* Payment details (show when pending) */}
            {status === "pending" && (
              <>
                {/* Amount */}
                <div className="bg-[#0a0a0a] rounded-xl p-4 mb-4">
                  <p className="text-white/60 text-sm mb-1">Amount to pay</p>
                  <p className="text-3xl font-bold text-white">$7.90 <span className="text-lg text-white/60">USD</span></p>
                </div>

                {/* Crypto Address */}
                <div className="bg-[#0a0a0a] rounded-xl p-4 mb-4">
                  <p className="text-white/60 text-sm mb-2">Send Bitcoin to:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-[#dc2626] text-sm font-mono bg-[#1a1a1a] rounded-lg p-3 break-all">
                      {cryptoAddress}
                    </code>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={copyAddress}
                      className="flex-shrink-0 border-[#262626] hover:bg-[#dc2626] hover:border-[#dc2626] hover:text-white bg-transparent"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                {/* QR Code placeholder */}
                <div className="bg-[#0a0a0a] rounded-xl p-4 mb-6 flex flex-col items-center">
                  <div className="w-40 h-40 bg-white rounded-lg flex items-center justify-center mb-3">
                    <div className="w-32 h-32 bg-[#0a0a0a] rounded grid grid-cols-8 gap-0.5 p-2">
                      {Array.from({ length: 64 }).map((_, i) => (
                        <div
                          key={i}
                          className={`aspect-square ${Math.random() > 0.5 ? "bg-black" : "bg-white"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-white/60 text-sm">Scan QR code to pay</p>
                </div>

                {/* Demo: Simulate payment button */}
                <Button
                  onClick={simulatePayment}
                  className="w-full bg-[#dc2626] hover:bg-[#ef4444] text-white py-6"
                >
                  <Wallet className="w-5 h-5 mr-2" />
                  Simulate Payment (Demo)
                </Button>

                {/* Security note */}
                <div className="flex items-center gap-2 mt-4 p-3 bg-[#0a0a0a] rounded-lg">
                  <Shield className="w-5 h-5 text-[#dc2626]" />
                  <p className="text-white/60 text-sm">
                    Secure payment powered by BrickPay
                  </p>
                </div>
              </>
            )}

            {/* Actions for failed/expired */}
            {(status === "failed" || status === "expired") && (
              <div className="flex flex-col gap-3">
                <Link href="/">
                  <Button className="w-full bg-[#dc2626] hover:bg-[#ef4444] text-white">
                    Create New Order
                  </Button>
                </Link>
                <Link href="/">
                  <Button
                    variant="outline"
                    className="w-full border-[#262626] hover:bg-[#1a1a1a] text-white bg-transparent"
                  >
                    Return to Store
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
