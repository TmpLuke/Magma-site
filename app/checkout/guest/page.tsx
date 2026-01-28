"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useCart } from "@/lib/cart-context";
import { useRouter } from "next/navigation";
import { Mail, User, MapPin, Phone, CreditCard, Loader2, ArrowRight } from "lucide-react";
import Image from "next/image";

export default function GuestCheckoutPage() {
  const router = useRouter();
  const { items, getTotal } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("United States");
  const [phone, setPhone] = useState("");

  const subtotal = getTotal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    // Validate
    if (!email || !firstName || !lastName) {
      setError("Please fill in all required fields");
      setIsProcessing(false);
      return;
    }

    try {
      // Process guest checkout
      // This would integrate with your payment processor
      router.push("/checkout/confirm");
    } catch (err) {
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
            <h1 className="text-4xl font-bold text-white mb-2">Guest Checkout</h1>
            <p className="text-white/60">Complete your purchase without creating an account</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Contact Information */}
                <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Contact Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white/80 text-sm mb-2">
                        Email Address <span className="text-[#dc2626]">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your@email.com"
                          required
                          className="w-full pl-11 pr-4 py-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg text-white placeholder:text-white/40 focus:border-[#dc2626] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Billing Information */}
                <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Billing Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/80 text-sm mb-2">
                        First Name <span className="text-[#dc2626]">*</span>
                      </label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="John"
                        required
                        className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg text-white placeholder:text-white/40 focus:border-[#dc2626] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-white/80 text-sm mb-2">
                        Last Name <span className="text-[#dc2626]">*</span>
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Doe"
                        required
                        className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg text-white placeholder:text-white/40 focus:border-[#dc2626] focus:outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-white/80 text-sm mb-2">Address</label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="123 Main St"
                        className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg text-white placeholder:text-white/40 focus:border-[#dc2626] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-white/80 text-sm mb-2">City</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="New York"
                        className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg text-white placeholder:text-white/40 focus:border-[#dc2626] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-white/80 text-sm mb-2">ZIP Code</label>
                      <input
                        type="text"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        placeholder="10001"
                        className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg text-white placeholder:text-white/40 focus:border-[#dc2626] focus:outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-white/80 text-sm mb-2">Country</label>
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg text-white focus:border-[#dc2626] focus:outline-none"
                      >
                        <option>United States</option>
                        <option>Canada</option>
                        <option>United Kingdom</option>
                        <option>Australia</option>
                        <option>Germany</option>
                        <option>France</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-white/80 text-sm mb-2">Phone (Optional)</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+1 (555) 123-4567"
                          className="w-full pl-11 pr-4 py-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg text-white placeholder:text-white/40 focus:border-[#dc2626] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
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
                      Continue to Payment
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-[#111111] border border-[#1a1a1a] rounded-xl p-6 sticky top-24">
                <h3 className="text-xl font-bold text-white mb-4">Order Summary</h3>
                
                {/* Cart Items */}
                <div className="space-y-3 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-[#1a1a1a] flex-shrink-0">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.productName}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-semibold text-sm truncate">
                          {item.productName}
                        </h4>
                        <p className="text-white/50 text-xs">{item.duration}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-white/60 text-xs">x{item.quantity}</span>
                          <span className="text-[#dc2626] font-bold text-sm">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-t border-[#1a1a1a] pt-4 space-y-2">
                  <div className="flex justify-between text-white/60">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-white font-bold text-xl pt-2">
                    <span>Total</span>
                    <span className="text-[#dc2626]">${subtotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
