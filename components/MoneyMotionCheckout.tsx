'use client';

import { createCheckoutSession, getCheckoutStatus } from '@/lib/moneymotion';
import { useState } from 'react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // in cents
}

export default function MoneyMotionCheckout({ product, userEmail }: { product: Product; userEmail: string }) {
  const [checkoutId, setCheckoutId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleCreateCheckout = async () => {
    try {
      setLoading(true);
      
      const lineItems = [{
        name: product.name,
        description: product.description,
        pricePerItemInCents: product.price,
        quantity: 1
      }];

      const userInfo = { email: userEmail };
      const description = `Order for ${product.name}`;

      const sessionId = await createCheckoutSession(lineItems, userInfo, description);
      setCheckoutId(sessionId);
      
      // Redirect to MoneyMotion checkout page
      window.location.href = `https://checkout.moneymotion.io/${sessionId}`;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to create checkout session');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    if (!checkoutId) return;
    
    try {
      const statusData = await getCheckoutStatus(checkoutId);
      setStatus(statusData.status);
    } catch (error) {
      console.error('Error checking status:', error);
    }
  };

  return (
    <div className="p-6 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Complete Your Purchase</h3>
      
      <div className="mb-4">
        <p className="font-medium">{product.name}</p>
        <p className="text-gray-600">{product.description}</p>
        <p className="text-xl font-bold">${(product.price / 100).toFixed(2)}</p>
      </div>

      <button
        onClick={handleCreateCheckout}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Creating Checkout...' : 'Proceed to Payment'}
      </button>

      {checkoutId && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p className="text-sm">Checkout ID: {checkoutId}</p>
          <button
            onClick={handleCheckStatus}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            Check Status
          </button>
          {status && <p className="text-sm mt-1">Status: {status}</p>}
        </div>
      )}
    </div>
  );
}