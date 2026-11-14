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

  const handleSimulatePayment = () => {
    setIsProcessing(true);

    setTimeout(() => {
      const simulatedPayment = {
        paidAt: new Date().toISOString(),
        method:
          selectedMethod === 'upi'
            ? 'UPI / Instant QR (Simulated)'
            : selectedMethod === 'card'
            ? 'Visa/Mastercard (Simulated)'
            : 'NetBanking (Simulated)',
        transactionId: `TXN-VL-${Math.floor(100000 + Math.random() * 900000)}`,
        amount: booking.totalAmount,
        status: 'simulated_success' as const,
      };

      updateBookingStatus(booking.id, 'confirmed', simulatedPayment);
      setIsProcessing(false);
      setIsCompleted(true);

      setTimeout(() => {
        onSuccess();
      }, 1400);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 relative">
        {!isCompleted && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {isCompleted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">
              Payment Simulated Successfully!
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Booking <strong className="text-slate-800">{booking.id}</strong> for{' '}
              <strong className="text-slate-800">{booking.vehicleTitle}</strong> is now Confirmed.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-1.5 text-emerald-600 font-semibold text-xs tracking-wider uppercase mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Simulated Payment Checkout</span>
            </div>

            <h2 className="text-xl font-bold text-slate-900">Complete Demo Reservation</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Booking ID: <span className="font-mono">{booking.id}</span>
            </p>

            {/* Amount Summary */}
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 my-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Payable Amount (Incl. Deposit)</p>
                <p className="text-xl font-black text-slate-900">
                  ₹{booking.totalAmount.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="text-right text-[11px] text-slate-400">
                <p>{booking.totalDays} day(s)</p>
                <p className="capitalize text-slate-600 font-medium">
                  {booking.rentalType.replace('-', ' ')}
                </p>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Simulated Channel
              </label>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setSelectedMethod('upi')}
                  className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-all ${
                    selectedMethod === 'upi'
                      ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <QrCode className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">UPI / QR Code</p>
                      <p className="text-[11px] text-slate-500">Google Pay, PhonePe, Paytm, BHIM</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    Instant
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('card')}
                  className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-all ${
                    selectedMethod === 'card'
                      ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">Credit / Debit Card</p>
                      <p className="text-[11px] text-slate-500">Visa, Mastercard, RuPay (Demo)</p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('netbanking')}
                  className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-all ${
                    selectedMethod === 'netbanking'
                      ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">Net Banking</p>
                      <p className="text-[11px] text-slate-500">HDFC, ICICI, SBI, Axis (Demo)</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Sandbox Notice */}
            <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Simulated Sandbox:</strong> No financial credentials or real funds will be
                transacted. This completes the prototype reservation loop.
              </span>
            </div>

            {/* Action Button */}
            <div className="mt-5">
              <button
                type="button"
                onClick={handleSimulatePayment}
                disabled={isProcessing}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-emerald-600 transition-colors shadow-lg flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Simulating Settlement...
                  </>
                ) : (
                  <>
                    Simulate Payment ₹{booking.totalAmount.toLocaleString('en-IN')}
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
