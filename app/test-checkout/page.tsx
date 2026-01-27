"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CreditCard } from "lucide-react";

export default function TestCheckoutPage() {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("7.90");
  const [email, setEmail] = useState("test@example.com");

  const handleTestCheckout = async () => {
    setLoading(true);
    try {
      window.location.href = `/api/test-checkout?amount=${amount}&email=${email}`;
    } catch (error) {
      console.error("Test checkout error:", error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#111111] border-[#262626]">
        <CardHeader>
          <CardTitle className="text-white">Test Checkout</CardTitle>
          <CardDescription className="text-white/60">
            Test your payment checkout functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-white">Amount (USD)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-[#0a0a0a] border-[#262626] text-white"
              placeholder="7.90"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[#0a0a0a] border-[#262626] text-white"
              placeholder="test@example.com"
            />
          </div>

          <Button 
            onClick={handleTestCheckout}
            disabled={loading}
            className="w-full bg-[#dc2626] hover:bg-[#ef4444] text-white"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Test Payment...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Test Checkout
              </>
            )}
          </Button>

          <div className="text-xs text-white/40 text-center space-y-1">
            <p>• This will create a mock payment and redirect to checkout</p>
            <p>• In development mode, payments will auto-complete randomly</p>
            <p>• Use the "Simulate Payment" button on checkout to test completion</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}