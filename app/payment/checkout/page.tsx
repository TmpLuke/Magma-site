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
  DollarSign,
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
  const sessionId = searchParams.get("session");
  const token = searchParams.get("token"); // Fallback for legacy BrickPay URLs

  const [status, setStatus] = useState<PaymentStatus>("loading");
  const [paymentData, setPaymentData] = useState<{
    amount: number;
    currency: string;
    paid_at: string | null;
    customer_email?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [pollCount, setPollCount] = useState(0);

  useEffect(() => {
    const currentSessionId = sessionId || token;
    const mockSuccess = searchParams.get("mock_success");
    
    if (!currentSessionId) {
      setStatus("failed");
      return;
    }

    // Handle mock success from redirect
    if (mockSuccess === "true") {
      setStatus("completed");
      setPaymentData({
        amount: 7.90,
        currency: "USD",
        paid_at: new Date().toISOString(),
      });
      setTimeout(() => {
        router.push(`/payment/success?session=${currentSessionId}`);
      }, 2000);
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
  }, [sessionId, token, status, searchParams, router]);

  const checkPaymentStatus = async () => {
    const currentSessionId = sessionId || token;
    if (!currentSessionId) return;

    try {
      // Try MoneyMotion first, then fallback to BrickPay
      let response;
      if (sessionId) {
        response = await fetch(`/api/payments/moneymotion/check-status?session=${currentSessionId}`);
      } else {
        response = await fetch(`/api/payments/check-status?token=${currentSessionId}`);
      }
      
      const data = await response.json();

      if (data.success) {
        if (data.paid || data.status === "completed") {
          setStatus("completed");
          setPaymentData({
            amount: data.amount || (data.amount_cents ? data.amount_cents / 100 : 0),
            currency: data.currency,
            paid_at: data.paid_at,
            customer_email: data.customer_email,
          });

          // Redirect to success page after 2 seconds
          setTimeout(() => {
            router.push(`/payment/success?session=${currentSessionId}`);
          }, 2000);
        } else if (data.status === "expired") {
          setStatus("expired");
        } else if (data.status === "cancelled" || data.status === "failed") {
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
    const currentSessionId = sessionId || token;
    setStatus("processing");
    setTimeout(() => {
      setStatus("completed");
      setPaymentData({
        amount: 7.90,
        currency: "USD",
        paid_at: new Date().toISOString(),
      });
      setTimeout(() => {
        router.push(`/payment/success?session=${currentSessionId}`);
      }, 2000);
    }, 2000);
  };

  const currentSessionId = sessionId || token;
  if (!currentSessionId) {
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
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Secure Payment</h1>
                <p className="text-white/60 text-sm">Powered by MoneyMotion</p>
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
                  <p className="text-3xl font-bold text-white">${paymentData?.amount?.toFixed(2) || "7.90"} <span className="text-lg text-white/60">USD</span></p>
                </div>

                {/* Payment Instructions */}
                <div className="bg-[#0a0a0a] rounded-xl p-4 mb-6">
                  <p className="text-white/60 text-sm mb-2">Payment Instructions:</p>
                  <ul className="text-white text-sm space-y-1 list-disc list-inside">
                    <li>Click the button below to proceed to MoneyMotion checkout</li>
                    <li>Complete your payment securely</li>
                    <li>You will be redirected back after payment</li>
                  </ul>
                </div>

                {/* Proceed to MoneyMotion */}
                <Button
                  onClick={() => {
                    // Redirect to MoneyMotion checkout URL
                    const checkoutUrl = sessionId ? 
                      `${window.location.origin}/api/payments/moneymotion/redirect?session=${sessionId}` :
                      `/api/payments/brickpay/redirect?token=${token}`;
                    window.location.href = checkoutUrl;
                  }}
                  className="w-full bg-[#dc2626] hover:bg-[#ef4444] text-white py-6"
                >
                  <Wallet className="w-5 h-5 mr-2" />
                  Proceed to Payment
                </Button>

                {/* Demo: Simulate payment button */}
                <Button
                  onClick={simulatePayment}
                  variant="outline"
                  className="w-full border-[#262626] hover:bg-[#1a1a1a] text-white bg-transparent mt-3"
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Simulate Payment (Demo Only)
                </Button>

                {/* Security note */}
                <div className="flex items-center gap-2 mt-4 p-3 bg-[#0a0a0a] rounded-lg">
                  <Shield className="w-5 h-5 text-[#dc2626]" />
                  <p className="text-white/60 text-sm">
                    Secure payment powered by MoneyMotion
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
