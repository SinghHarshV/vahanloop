'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMarketplace } from '@/context/MarketplaceContext';
import { BookingModal } from '@/components/booking/BookingModal';
import {
  Car,
  Bike,
  Zap,
  MapPin,
  Star,
  Users,
  Fuel,
  Gauge,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  FileText,
  MessageSquare,
  ArrowLeft,
  Sparkles,
  Info,
  Clock,
  Lock,
} from 'lucide-react';

export default function VehicleDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const vehicleId = params.id as string;
  const { vehicles } = useMarketplace();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const vehicle = vehicles.find((v) => v.id === vehicleId);

  if (!vehicle) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-surface flex items-center justify-center mx-auto mb-4 text-brand-text-muted">
          <Car className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-display font-bold text-brand-navy">Vehicle Not Found</h2>
        <p className="text-xs text-brand-text-muted mt-2 mb-6">
          The requested vehicle may have been removed or does not exist in the active catalogue.
        </p>
        <Link
          href="/explore"
          className="px-6 py-2.5 bg-brand-navy text-white rounded-full text-xs font-bold hover:bg-brand-emerald transition-colors"
        >
          Return to Explore
        </Link>
      </div>
    );
  }

  const isPending = vehicle.approvalStatus === 'pending';
  const isRejected = vehicle.approvalStatus === 'rejected';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <div>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs font-bold text-brand-navy hover:text-brand-emerald bg-white px-4 py-2 rounded-full border border-brand-border shadow-card transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Fleet
        </button>
      </div>

      {/* Admin Notice if not approved */}
      {(isPending || isRejected) && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">
              Prototype Operational Notice: Vehicle Status is{' '}
              <span className="uppercase font-mono text-amber-800">{vehicle.approvalStatus}</span>
            </p>
            <p className="mt-0.5 text-amber-800">
              This listing is currently hidden from customer explore. Switch to the{' '}
              <strong>Admin role</strong> to review and approve it.
            </p>
          </div>
        </div>
      )}

      {/* Title & Location Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-brand-border">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-brand-emerald-subtle text-brand-emerald capitalize border border-brand-emerald/20">
              {vehicle.category}
            </span>
            <span className="text-xs text-brand-text-muted font-semibold">
              {vehicle.year} Model · {vehicle.manufacturer}
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-brand-navy tracking-tight">
            {vehicle.title}
          </h1>
          <div className="flex items-center gap-4 text-xs text-brand-text-muted mt-2 font-medium">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-brand-emerald" />
              <span>{vehicle.location}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1 font-bold text-brand-navy bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{vehicle.ownerRating} Host Rating</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1 text-brand-emerald font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Identity & Insurance Verified</span>
            </div>
          </div>
        </div>

        <div className="text-left md:text-right bg-white p-4 rounded-2xl border border-brand-border shadow-card">
          <p className="text-[11px] font-bold uppercase tracking-wider text-brand-text-muted">Daily Rate</p>
          <p className="text-3xl sm:text-4xl font-display font-black text-brand-navy">
            ₹{vehicle.dailyRate.toLocaleString('en-IN')}{' '}
            <span className="text-xs font-normal text-brand-text-muted">/ day</span>
          </p>
        </div>
      </div>

      {/* Main Grid: Gallery & Specs vs Booking Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2/3): Gallery, Specs, Description, Reviews */}
        <div className="lg:col-span-2 space-y-8">
          {/* Gallery */}
          <div className="space-y-3">
            <div className="aspect-[16/10] w-full rounded-3xl overflow-hidden bg-slate-100 border border-brand-border shadow-premium relative">
              {vehicle.images && vehicle.images[selectedImageIndex] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={vehicle.images[selectedImageIndex]}
                  alt={vehicle.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <Car className="w-16 h-16" />
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {vehicle.images && vehicle.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {vehicle.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-24 h-16 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${
                      selectedImageIndex === idx
                        ? 'border-brand-emerald ring-2 ring-brand-emerald/20 shadow-md'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Specs Grid */}
          <div className="bg-white rounded-3xl p-6 border border-brand-border shadow-card grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="space-y-1 p-3.5 rounded-2xl bg-brand-surface border border-brand-border/60">
              <p className="text-brand-text-muted font-bold text-[10px] uppercase">Transmission</p>
              <div className="flex items-center gap-1.5 font-bold text-brand-navy capitalize text-sm">
                <Gauge className="w-4 h-4 text-brand-emerald" />
                {vehicle.transmission}
              </div>
            </div>

            <div className="space-y-1 p-3.5 rounded-2xl bg-brand-surface border border-brand-border/60">
              <p className="text-brand-text-muted font-bold text-[10px] uppercase">Fuel Type</p>
              <div className="flex items-center gap-1.5 font-bold text-brand-navy capitalize text-sm">
                <Fuel className="w-4 h-4 text-brand-emerald" />
                {vehicle.fuelType}
              </div>
            </div>

            <div className="space-y-1 p-3.5 rounded-2xl bg-brand-surface border border-brand-border/60">
              <p className="text-brand-text-muted font-bold text-[10px] uppercase">Capacity</p>
              <div className="flex items-center gap-1.5 font-bold text-brand-navy text-sm">
                <Users className="w-4 h-4 text-brand-emerald" />
                {vehicle.seatingCapacity} Seats
              </div>
            </div>

            <div className="space-y-1 p-3.5 rounded-2xl bg-brand-surface border border-brand-border/60">
              <p className="text-brand-text-muted font-bold text-[10px] uppercase">Min Duration</p>
              <div className="flex items-center gap-1.5 font-bold text-brand-navy text-sm">
                <Calendar className="w-4 h-4 text-brand-emerald" />
                {vehicle.minimumDurationDays} {vehicle.minimumDurationDays === 1 ? 'Day' : 'Days'}
              </div>
            </div>
          </div>

          {/* About this vehicle */}
          <div className="bg-white rounded-3xl p-7 border border-brand-border shadow-card space-y-5">
            <h3 className="text-lg font-display font-bold text-brand-navy">About this Vehicle</h3>
            <p className="text-sm text-brand-text-muted leading-relaxed">{vehicle.description}</p>

            {/* Key Features */}
            {vehicle.features && vehicle.features.length > 0 && (
              <div className="pt-4 border-t border-brand-border">
                <h4 className="text-xs font-bold text-brand-navy uppercase tracking-wider mb-3">
                  Vehicle Highlights & Amenities
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {vehicle.features.map((feature, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-xs font-semibold text-brand-navy bg-brand-surface px-3 py-2 rounded-xl border border-brand-border/60"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-emerald shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Rental Conditions */}
          <div className="bg-white rounded-3xl p-7 border border-brand-border shadow-card space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-brand-navy uppercase tracking-wider">
              <FileText className="w-4 h-4 text-brand-emerald" />
              <span>Rental Terms & Guidelines</span>
            </div>
            <ul className="space-y-2.5 text-xs text-brand-text-muted">
              {vehicle.rentalConditions.map((cond, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{cond}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-3xl p-7 border border-brand-border shadow-card space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-brand-emerald" />
                <h3 className="text-lg font-display font-bold text-brand-navy">
                  Verified Guest Reviews ({vehicle.reviews.length})
                </h3>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-brand-navy bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/20">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{vehicle.ownerRating} Overall Rating</span>
              </div>
            </div>

            {vehicle.reviews.length > 0 ? (
              <div className="space-y-3">
                {vehicle.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-2xl bg-brand-surface border border-brand-border/60 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-brand-navy">{rev.customerName}</span>
                      <span className="text-[11px] text-brand-text-muted">{rev.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, starIndex) => (
                        <Star
                          key={starIndex}
                          className={`w-3.5 h-3.5 ${
                            starIndex < Math.floor(rev.rating)
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-brand-text-muted leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-brand-text-muted italic">
                No reviews yet. Be the first guest to rent this vehicle!
              </p>
            )}
          </div>
        </div>

        {/* Right Column (1/3): Sticky Booking Action Card & Host Profile */}
        <div className="space-y-6">
          <div className="sticky top-24 space-y-6">
            {/* Booking Card */}
            <div className="bg-white rounded-3xl p-7 border border-brand-border shadow-floating space-y-6">
              <div>
                <span className="text-[11px] font-bold text-brand-emerald uppercase tracking-wider">
                  Guaranteed Availability
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-4xl font-display font-black text-brand-navy">
                    ₹{vehicle.dailyRate.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs font-semibold text-brand-text-muted">/ day</span>
                </div>
              </div>

              {/* Supported Modes Badges */}
              <div className="space-y-2.5">
                <label className="block text-[10px] font-bold text-brand-text-muted uppercase tracking-wider">
                  Rental Flexibility
                </label>
                <div className="flex flex-col gap-2 text-xs">
                  {vehicle.supportedModes.includes('self-drive') && (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-brand-surface border border-brand-border/60 font-semibold text-brand-navy">
                      <span>Self-Drive Available</span>
                      <span className="text-brand-emerald text-xs font-bold">Standard</span>
                    </div>
                  )}
                  {vehicle.supportedModes.includes('with-driver') && (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-brand-surface border border-brand-border/60 font-semibold text-brand-navy">
                      <span>Chauffeur Service</span>
                      <span className="text-brand-navy text-xs font-bold">+₹{vehicle.driverChargePerDay}/day</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Book Now Button */}
              <button
                onClick={() => setShowBookingModal(true)}
                className="w-full py-4 px-6 rounded-full font-bold text-sm bg-brand-navy hover:bg-brand-emerald text-white transition-all shadow-floating flex items-center justify-center gap-2 group"
              >
                <span>Reserve Vehicle</span>
                <Sparkles className="w-4 h-4 text-brand-emerald group-hover:text-white transition-colors" />
              </button>

              <div className="pt-2 text-[11px] text-brand-text-muted text-center space-y-1.5">
                <p className="flex items-center justify-center gap-1.5 text-brand-navy font-semibold">
                  <ShieldCheck className="w-4 h-4 text-brand-emerald" />
                  <span>Free cancellation before host acceptance</span>
                </p>
                <p className="flex items-center justify-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-brand-emerald" />
                  <span>15-minute payment hold upon host approval</span>
                </p>
              </div>
            </div>

            {/* Host Profile Card */}
            <div className="bg-white rounded-3xl p-6 border border-brand-border shadow-card space-y-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-brand-navy text-white font-display font-extrabold flex items-center justify-center text-base shadow-sm">
                  {vehicle.ownerName.charAt(0)}
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-brand-text-muted">Verified Host</p>
                  <p className="text-base font-display font-bold text-brand-navy">{vehicle.ownerName}</p>
                  <p className="text-xs text-brand-text-muted">{vehicle.ownerEmail}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-brand-border grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-brand-surface p-2.5 rounded-xl border border-brand-border/60">
                  <p className="text-[10px] text-brand-text-muted font-bold uppercase">Rating</p>
                  <p className="font-bold text-brand-navy mt-0.5">★ {vehicle.ownerRating}</p>
                </div>
                <div className="bg-brand-surface p-2.5 rounded-xl border border-brand-border/60">
                  <p className="text-[10px] text-brand-text-muted font-bold uppercase">KYC Check</p>
                  <p className="font-bold text-brand-emerald mt-0.5">Passed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <BookingModal vehicle={vehicle} onClose={() => setShowBookingModal(false)} />
      )}
    </div>
  );
}
