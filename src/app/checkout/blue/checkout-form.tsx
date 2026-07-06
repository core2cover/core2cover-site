'use client';

import { useState, useCallback } from 'react';

interface Props {
  sessionId: string;
  userId: string;
  returnUrl: string;
  email: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const blueFeatures = [
  'AI Chat',
  'Code Autocomplete',
  'Codebase Search',
  'Syntax Checking',
  'Cloud Models',
  'Local Models',
  'Multi-Agent Teams',
  'Figma-to-Code',
  'GitHub Integration',
  'Web Search',
];

export function CheckoutForm({ sessionId, userId, returnUrl, email }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadRazorpayScript = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      if (window.Razorpay) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
      document.body.appendChild(script);
    });
  }, []);

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      await loadRazorpayScript();

      const orderRes = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        throw new Error(orderData.error || 'Failed to create payment order');
      }

      const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

      const options = {
        key: keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Blue AI',
        description: 'Blue Plan — ₹149/month',
        order_id: orderData.orderId,
        prefill: { email },
        theme: { color: '#3b82f6' },
        handler: async function (response: any) {
          const verifyRes = await fetch('/api/checkout/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId,
              userId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyRes.json();

          if (!verifyRes.ok) {
            setError(verifyData.error || 'Payment verification failed. Please contact support.');
            setLoading(false);
            return;
          }

          window.location.href = returnUrl;
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] flex items-center">
      <section className="relative w-full flex items-center overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 relative z-10 w-full py-12">
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Complete Your Subscription
              </span>
            </h1>
            <p className="mt-2 text-gray-400 max-w-lg mx-auto">
              You are one step away from unlocking the full power of Blue AI.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 max-w-4xl mx-auto">
            <div className="lg:col-span-3">
              <div className="rounded-2xl border border-gray-800/80 p-6 bg-gray-900/20 backdrop-blur-sm">
                <h2 className="text-base font-bold text-gray-100 mb-4">Contact Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      readOnly
                      tabIndex={-1}
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-900/60 border border-gray-800 text-gray-100 text-sm opacity-70 cursor-not-allowed"
                    />
                  </div>

                  <div className="pt-3 border-t border-gray-800/80">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Payment Method</h3>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-900/40 border border-gray-800/80">
                      <div className="w-10 h-7 rounded-lg bg-blue-900/40 flex items-center justify-center text-blue-400 text-xs font-bold">
                        <i className="fa-solid fa-credit-card"></i>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-200">Pay with Razorpay</p>
                        <p className="text-[10px] text-gray-500">Credit / Debit card, UPI, Net Banking, Wallet</p>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 rounded-xl bg-red-900/20 border border-red-800/50 text-red-400 text-xs flex items-start gap-2">
                      <i className="fa-solid fa-circle-exclamation mt-0.5"></i>
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handlePayment}
                    disabled={loading}
                    className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 font-semibold text-white shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 transition duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <i className="fa-solid fa-spinner animate-spin"></i>
                        Processing...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-lock"></i>
                        Pay ₹149 — Subscribe to Blue
                      </>
                    )}
                  </button>

                  <p className="text-xs text-gray-300 text-center">
                    Your payment is secured by{' '}
                    <span className="text-blue-400 font-semibold">Razorpay</span>.
                    We never store your card details.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-gray-800/80 p-6 bg-gray-900/20 backdrop-blur-sm">
                <div className="flex items-start gap-3 pb-4 border-b border-gray-800/80">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shrink-0">
                    <i className="fa-solid fa-crown text-sm text-white"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-100 text-sm">Blue Plan</h3>
                    <p className="text-xs text-gray-500">₹149/month — Cancel anytime</p>
                  </div>
                </div>

                <div className="py-4 space-y-2 border-b border-gray-800/80">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-2">Everything in Blue Lite, plus:</p>
                  {blueFeatures.slice(5).map((feature) => (
                    <div key={feature} className="flex items-start gap-2 text-xs text-gray-400">
                      <span className="w-4 h-4 rounded-full bg-blue-950/60 border border-blue-900/60 text-blue-400 flex items-center justify-center shrink-0 mt-0.5 text-[8px]">
                        <i className="fa-solid fa-check"></i>
                      </span>
                      {feature}
                    </div>
                  ))}
                </div>

                <div className="pt-4 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Subtotal</span>
                    <span className="text-gray-200">₹149</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Tax</span>
                    <span className="text-gray-500">Included</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold pt-2 border-t border-gray-800/80">
                    <span className="text-gray-100">Total</span>
                    <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">₹149</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
