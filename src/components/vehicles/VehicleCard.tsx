'use client';

import React from 'react';
import Link from 'next/link';
import { Vehicle } from '@/types';
import {
  Car,
  Bike,
  Fuel,
  Users,
  MapPin,
  Star,
  ArrowRight,
  Gauge,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

interface VehicleCardProps {
  vehicle: Vehicle;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle }) => {
  const getCategoryIcon = () => {
    switch (vehicle.category) {
      case 'car':
        return <Car className="w-3.5 h-3.5 text-brand-navy" />;
      case 'bike':
      case 'scooter':
        return <Bike className="w-3.5 h-3.5 text-brand-navy" />;
    }
  };

  return (
    <div className="group bg-white rounded-3xl border border-brand-border/80 shadow-card hover:shadow-card-hover hover:border-brand-border-dark transition-all duration-300 flex flex-col overflow-hidden">
      {/* Image Container with 16:10 aspect ratio */}
      <div className="relative aspect-[16/10] w-full bg-slate-100 overflow-hidden">
        {vehicle.images && vehicle.images.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={vehicle.images[0]}
            alt={vehicle.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <Car className="w-12 h-12 stroke-[1.5]" />
          </div>
        )}

        {/* Top Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-brand-navy shadow-sm backdrop-blur-md">
            {getCategoryIcon()}
            <span className="capitalize">{vehicle.category}</span>
          </span>

          {vehicle.supportedModes.includes('with-driver') && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-brand-navy text-white shadow-sm backdrop-blur-md">
              <Sparkles className="w-3 h-3 text-brand-emerald" />
              Chauffeur Opt
            </span>
          )}
        </div>

        {/* Price Tag Overlay Badge */}
        <div className="absolute bottom-3 right-3 bg-brand-navy/95 text-white px-3 py-1.5 rounded-2xl text-xs font-bold shadow-floating backdrop-blur-md border border-white/10">
          ₹{vehicle.dailyRate.toLocaleString('en-IN')}{' '}
          <span className="text-[10px] font-normal text-slate-300">/ day</span>
        </div>
      </div>

      {/* Body Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Location & Rating */}
          <div className="flex items-center justify-between text-xs text-brand-text-muted mb-2">
            <div className="flex items-center gap-1.5 truncate max-w-[170px]">
              <MapPin className="w-3.5 h-3.5 text-brand-emerald shrink-0" />
              <span className="truncate font-medium">{vehicle.location}</span>
            </div>
            <div className="flex items-center gap-1 font-bold text-brand-navy bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{vehicle.ownerRating}</span>
              <span className="text-[10px] text-brand-text-muted font-normal">(demo)</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-display font-bold text-brand-navy text-lg leading-snug group-hover:text-brand-emerald transition-colors line-clamp-1">
            {vehicle.title}
          </h3>

          <p className="text-xs text-brand-text-muted mt-0.5 font-medium">
            {vehicle.year} · {vehicle.manufacturer}
          </p>

          {/* Key Attributes Pills */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-brand-border text-xs text-brand-navy font-semibold">
            <div className="flex items-center justify-center gap-1.5 bg-brand-surface py-2 px-1 rounded-xl border border-brand-border/60">
              <Gauge className="w-3.5 h-3.5 text-brand-text-muted shrink-0" />
              <span className="capitalize truncate text-[11px]">{vehicle.transmission}</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 bg-brand-surface py-2 px-1 rounded-xl border border-brand-border/60">
              <Fuel className="w-3.5 h-3.5 text-brand-text-muted shrink-0" />
              <span className="capitalize truncate text-[11px]">{vehicle.fuelType}</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 bg-brand-surface py-2 px-1 rounded-xl border border-brand-border/60">
              <Users className="w-3.5 h-3.5 text-brand-text-muted shrink-0" />
              <span className="truncate text-[11px]">{vehicle.seatingCapacity} Seats</span>
            </div>
          </div>
        </div>

        {/* Card Footer */}
        <div className="mt-5 pt-3.5 border-t border-brand-border flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-brand-text-muted">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-emerald shrink-0" />
            <span>Host: <strong className="text-brand-navy font-bold">{vehicle.ownerName.split(' ')[0]}</strong></span>
          </div>

          <Link
            href={`/vehicles/${vehicle.id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-brand-navy hover:bg-brand-emerald text-white transition-all shadow-sm group-hover:shadow"
          >
            Details
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};
