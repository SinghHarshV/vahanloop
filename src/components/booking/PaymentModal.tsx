'use client';

import React, { useState } from 'react';
import { Booking } from '@/types';
import { useMarketplace } from '@/context/MarketplaceContext';
import {
  CreditCard,
  QrCode,
  Building2,
  ShieldCheck,
  CheckCircle2,
  X,
  Loader2,
  Sparkles,
  AlertCircle,
  Clock,
} from 'lucide-react';

interface PaymentModalProps {
  booking: Booking;
  onClose: () => void;
  onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  booking,
  onClose,
  onSuccess,
}) => {
  const { updateBookingStatus } = useMarketplace();
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [receipt, setReceipt] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleCheckoutPayment = async () => {
    setIsProcessing(true);
    setErrorMessage('');

    try {
      // 1. Create payment order through backend
      const orderRes = await fetch(`/api/bookings/${booking.id}/create-payment-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        // Fallback to simulate-payment endpoint in test mode
        const simRes = await fetch(`/api/bookings/${booking.id}/simulate-payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ paymentMethod: selectedMethod.toUpperCase() }),
        });
        const simData = await simRes.json();
        if (!simRes.ok) {
          throw new Error(orderData.error || simData.error || 'Failed to complete test payment');
        }
        const txnId = simData.payment?.transactionReference || `TXN-VL-${Date.now().toString().slice(-6)}`;
        setReceipt(txnId);
        setIsCompleted(true);
        setIsProcessing(false);
        updateBookingStatus(booking.id, 'confirmed', {
          paidAt: new Date().toISOString(),
          method: selectedMethod.toUpperCase(),
          transactionId: txnId,
          amount: booking.totalAmount,
          status: 'simulated_success',
        });
        setTimeout(() => onSuccess(), 1500);
        return;
      }

      // 2. Complete payment verification via backend signature validation
      const verifyRes = await fetch(`/api/bookings/${booking.id}/verify-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          providerOrderId: orderData.orderId,
          providerPaymentId: `pay_test_${Date.now()}`,
          paymentMethod: selectedMethod.toUpperCase(),
          signature: orderData.provider === 'MOCK' ? 'mock_verified_signature' : 'test_mode_signature',
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        throw new Error(verifyData.error || 'Payment signature verification rejected');
      }

      const txnId = verifyData.payment?.transactionReference || `TXN-VL-${Date.now().toString().slice(-6)}`;
      setReceipt(txnId);
      setIsCompleted(true);
      setIsProcessing(false);

      // Trigger context update
      updateBookingStatus(booking.id, 'confirmed', {
        paidAt: new Date().toISOString(),
        method: selectedMethod.toUpperCase(),
        transactionId: txnId,
        amount: booking.totalAmount,
        status: 'simulated_success',
      });

      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment processing failed. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          disabled={isProcessing}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        {isCompleted ? (
          <div className="text-center py-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Payment Verified!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Your reservation is now confirmed with the vehicle partner.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1 font-mono text-left">
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction Ref:</span>
                <span className="font-bold text-slate-800">{receipt}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Paid:</span>
                <span className="font-bold text-emerald-700">₹{booking.totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Mode:</span>
                <span className="text-slate-700">Test Mode (Verified)</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">Redirecting to your reservation ledger...</p>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Test Payment Gateway</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">Complete Reservation Payment</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pay to confirm reservation for <strong>{booking.vehicleTitle}</strong>.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Price Box */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Quoted Payable Amount:</span>
                <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                  Immutable Quote
                </span>
              </div>
              <p className="text-2xl font-black text-slate-900">₹{booking.totalAmount.toLocaleString('en-IN')}</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Includes ₹{booking.securityDeposit} refundable security deposit and 10% platform fee.
              </p>
            </div>

            {/* Payment Mode Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">Select Test Payment Mode</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMethod('upi')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                    selectedMethod === 'upi'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-emerald-600" />
                  <span>UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('card')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                    selectedMethod === 'card'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                  <span>Cards</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('netbanking')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                    selectedMethod === 'netbanking'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Building2 className="w-5 h-5 text-emerald-600" />
                  <span>NetBanking</span>
                </button>
              </div>
            </div>

            {/* Test Mode Disclaimer */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
              <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Test Mode Gateway:</strong> No actual money will be deducted from your bank or card. Signature validation is enforced server-side.
              </div>
            </div>

            {/* Action */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleCheckoutPayment}
                disabled={isProcessing}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-colors disabled:opacity-60"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Signature & Holding Availability...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Pay ₹{booking.totalAmount.toLocaleString('en-IN')} (Test Mode)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
