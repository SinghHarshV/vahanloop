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
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <Car className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-800">Vehicle Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          The requested vehicle may have been removed or does not exist.
        </p>
        <Link
          href="/explore"
          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-emerald-600 transition-colors"
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
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Listings
        </button>
      </div>

      {/* Admin Notice if not approved */}
      {(isPending || isRejected) && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">
              Prototype Notice: Vehicle Status is{' '}
              <span className="uppercase font-mono text-amber-800">{vehicle.approvalStatus}</span>
            </p>
            <p className="mt-0.5 text-amber-800">
              This listing is currently hidden from the public explore catalogue. Switch to the{' '}
              <strong>Admin role</strong> to review and approve it.
            </p>
          </div>
        </div>
      )}

      {/* Title & Location Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-slate-100 text-slate-800 capitalize border border-slate-200">
              {vehicle.category}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {vehicle.year} Model · {vehicle.manufacturer}
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {vehicle.title}
          </h1>
          <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>{vehicle.location}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1 font-semibold text-slate-700">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{vehicle.ownerRating} Host Rating</span>
            </div>
          </div>
        </div>

        <div className="text-left md:text-right">
          <p className="text-xs text-slate-400">Daily Base Rate</p>
          <p className="text-3xl font-black text-slate-900">
            ₹{vehicle.dailyRate.toLocaleString('en-IN')}{' '}
            <span className="text-xs font-normal text-slate-400">/ day</span>
          </p>
        </div>
      </div>

      {/* Main Grid: Gallery & Specs vs Booking Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2/3): Gallery, Specs, Description, Reviews */}
        <div className="lg:col-span-2 space-y-8">
          {/* Gallery */}
          <div className="space-y-3">
            <div className="aspect-[16/10] w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative">
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
                    className={`w-24 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      selectedImageIndex === idx
                        ? 'border-emerald-600 ring-2 ring-emerald-500/20'
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
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="space-y-1 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-slate-400 font-medium">Transmission</p>
              <div className="flex items-center gap-1.5 font-bold text-slate-800 capitalize">
                <Gauge className="w-4 h-4 text-emerald-600" />
                {vehicle.transmission}
              </div>
            </div>

            <div className="space-y-1 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-slate-400 font-medium">Fuel Type</p>
              <div className="flex items-center gap-1.5 font-bold text-slate-800 capitalize">
                <Fuel className="w-4 h-4 text-emerald-600" />
                {vehicle.fuelType}
              </div>
            </div>

            <div className="space-y-1 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-slate-400 font-medium">Capacity</p>
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <Users className="w-4 h-4 text-emerald-600" />
                {vehicle.seatingCapacity} Passengers
              </div>
            </div>

            <div className="space-y-1 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-slate-400 font-medium">Min Duration</p>
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <Calendar className="w-4 h-4 text-emerald-600" />
                {vehicle.minimumDurationDays} {vehicle.minimumDurationDays === 1 ? 'Day' : 'Days'}
              </div>
            </div>
          </div>

          {/* About this vehicle */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">About this Vehicle</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{vehicle.description}</p>

            {/* Key Features */}
            {vehicle.features && vehicle.features.length > 0 && (
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                  Vehicle Highlights & Amenities
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {vehicle.features.map((feature, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Rental Conditions */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <FileText className="w-4 h-4 text-slate-500" />
              <span>Rental Terms & Guidelines</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-600">
              {vehicle.rentalConditions.map((cond, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                  <span>{cond}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-slate-500" />
                <h3 className="text-base font-bold text-slate-900">
                  Guest Reviews ({vehicle.reviews.length})
                </h3>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-slate-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{vehicle.ownerRating} Overall</span>
              </div>
            </div>

            {vehicle.reviews.length > 0 ? (
              <div className="space-y-3">
                {vehicle.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{rev.customerName}</span>
                      <span className="text-[11px] text-slate-400">{rev.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, starIndex) => (
                        <Star
                          key={starIndex}
                          className={`w-3 h-3 ${
                            starIndex < Math.floor(rev.rating)
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-slate-600">{rev.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                No reviews yet. Be the first guest to rent this vehicle!
              </p>
            )}
          </div>
        </div>

        {/* Right Column (1/3): Sticky Booking Action Card & Host Profile */}
        <div className="space-y-6">
          <div className="sticky top-24 space-y-6">
            {/* Booking Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xl space-y-5">
              <div>
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                  Instant Request
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-black text-slate-900">
                    ₹{vehicle.dailyRate.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-slate-500">/ day</span>
                </div>
              </div>

              {/* Supported Modes Badges */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Supported Rental Modes
                </label>
                <div className="flex flex-wrap gap-2 text-xs">
                  {vehicle.supportedModes.includes('self-drive') && (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                      Self-Drive
                    </span>
                  )}
                  {vehicle.supportedModes.includes('with-driver') && (
                    <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 font-semibold border border-blue-200">
                      With Chauffeur (+₹{vehicle.driverChargePerDay}/day)
                    </span>
                  )}
                </div>
              </div>

              {/* Book Now Button */}
              <button
                onClick={() => setShowBookingModal(true)}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-slate-900 text-white hover:bg-emerald-600 transition-colors shadow-lg flex items-center justify-center gap-2 group"
              >
                <span>Book This Vehicle</span>
                <Sparkles className="w-4 h-4 text-emerald-400 group-hover:text-white" />
              </button>

              <div className="pt-2 text-[11px] text-slate-400 text-center space-y-1">
                <p className="flex items-center justify-center gap-1 text-slate-600 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Free cancellation prior to partner acceptance
                </p>
                <p>Simulated prototype payment after partner accepts.</p>
              </div>
            </div>

            {/* Host Profile Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-sm shadow">
                  {vehicle.ownerName.charAt(0)}
                </div>
                <div>
                  <p className="text-xs text-slate-400">Listed by Verified Host</p>
                  <p className="text-sm font-bold text-slate-900">{vehicle.ownerName}</p>
                  <p className="text-[11px] text-slate-500">{vehicle.ownerEmail}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-slate-50 p-2 rounded-xl">
                  <p className="text-[10px] text-slate-400">Host Rating</p>
                  <p className="font-bold text-slate-800 mt-0.5">★ {vehicle.ownerRating}</p>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl">
                  <p className="text-[10px] text-slate-400">KYC Status</p>
                  <p className="font-bold text-emerald-700 mt-0.5">Verified Host</p>
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
