"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle,
  Download,
  Key,
  Copy,
  Check,
  ArrowRight,
  Shield,
  Mail,
  Clock,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

interface OrderData {
  order_number: string;
  product_name: string;
  duration: string;
  amount: number;
  license_key?: string;
  customer_email: string;
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");
  const sessionId = searchParams.get("session_id");
  const token = searchParams.get("token"); // Declared the token variable

  const [copied, setCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsVisible(true);
    
    // Fetch order details
    async function fetchOrderDetails() {
      if (!orderNumber) {
        setIsLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`/api/payments/moneymotion/check-status?order=${orderNumber}`);
        const data = await response.json();
        
        if (data.success && data.order) {
          setOrderData({
            order_number: data.order.order_number,
            product_name: data.order.product_name,
            duration: data.order.duration,
            amount: data.order.amount,
            license_key: data.license?.license_key,
            customer_email: data.order.customer_email,
          });
        } else {
          setError("Order not found");
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("Failed to load order details");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchOrderDetails();
  }, [orderNumber]);

  // Fallback license key if not found
  const licenseKey = orderData?.license_key || 
    `MAGMA-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const copyLicenseKey = () => {
    navigator.clipboard.writeText(licenseKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div
        className={`max-w-2xl w-full transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        {/* Success Card */}
        <div className="bg-[#111111] border border-[#262626] rounded-2xl overflow-hidden">
          {/* Animated Success Header */}
          <div className="relative bg-gradient-to-r from-green-500/20 via-green-500/10 to-transparent p-8 border-b border-[#262626] overflow-hidden">
            {/* Animated background circles */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
              <div
                className="absolute -bottom-10 -left-10 w-32 h-32 bg-green-500/10 rounded-full blur-2xl animate-pulse"
                style={{ animationDelay: "0.5s" }}
              />
            </div>

            <div className="relative flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Payment Successful!</h1>
                <p className="text-white/60">Your order has been confirmed</p>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="p-12 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-[#dc2626] animate-spin mb-4" />
              <p className="text-white/60">Loading order details...</p>
            </div>
          )}

          {/* Order Details */}
          {!isLoading && (
            <div className="p-6 space-y-6">
              {/* Order Summary */}
              <div className="bg-[#0a0a0a] rounded-xl p-4">
                <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#dc2626]" />
                  Order Summary
                </h2>
                <div className="flex items-center gap-4 p-3 bg-[#111111] rounded-lg">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-[#dc2626]/20 to-transparent flex items-center justify-center">
                    <Shield className="w-8 h-8 text-[#dc2626]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{orderData?.product_name || "Your Purchase"}</p>
                    <p className="text-white/60 text-sm">{orderData?.duration || "License"}</p>
                  </div>
                  <p className="text-white font-bold">${orderData?.amount?.toFixed(2) || "0.00"}</p>
                </div>
              </div>

              {/* License Key */}
              <div className="bg-gradient-to-r from-[#dc2626]/10 to-transparent rounded-xl p-4 border border-[#dc2626]/20">
                <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Key className="w-5 h-5 text-[#dc2626]" />
                  Your License Key
                </h2>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-[#dc2626] text-lg font-mono bg-[#0a0a0a] rounded-lg p-4 tracking-wider">
                    {licenseKey}
                  </code>
                  <Button
                    onClick={copyLicenseKey}
                    className={`flex-shrink-0 ${
                      copied
                        ? "bg-green-500 hover:bg-green-600"
                        : "bg-[#dc2626] hover:bg-[#ef4444]"
                    } text-white transition-colors`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-white/60 text-sm mt-3">
                  Save this key securely. You will need it to activate your product.
                </p>
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#0a0a0a] rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-[#dc2626]/20 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-[#dc2626]" />
                    </div>
                    <p className="text-white font-medium">Email Sent</p>
                  </div>
                  <p className="text-white/60 text-sm">
                    A confirmation email with your license key has been sent to your email
                    address.
                  </p>
                </div>

                <div className="bg-[#0a0a0a] rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-[#dc2626]/20 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-[#dc2626]" />
                    </div>
                    <p className="text-white font-medium">License Duration</p>
                  </div>
                  <p className="text-white/60 text-sm">
                    Your license is valid for 24 hours from the time of first activation.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button className="flex-1 bg-[#dc2626] hover:bg-[#ef4444] text-white py-6">
                  <Download className="w-5 h-5 mr-2" />
                  Download Loader
                </Button>
                <Link href="/" className="flex-1">
                  <Button
                    variant="outline"
                    className="w-full border-[#262626] hover:bg-[#1a1a1a] text-white py-6 bg-transparent"
                  >
                    Return to Store
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>

              {/* Support Note */}
              <div className="text-center pt-4 border-t border-[#262626]">
                <p className="text-white/60 text-sm">
                  Need help?{" "}
                  <a href="https://discord.gg/magmacheats" target="_blank" rel="noopener noreferrer" className="text-[#dc2626] hover:underline">
                    Contact our support team
                  </a>{" "}
                  or join our{" "}
                  <a href="https://discord.gg/magmacheats" target="_blank" rel="noopener noreferrer" className="text-[#dc2626] hover:underline">
                    Discord server
                  </a>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Transaction ID */}
        <p className="text-center text-white/40 text-sm mt-4">
          Transaction ID: {token || "N/A"}
        </p>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#dc2626] animate-spin" />
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
