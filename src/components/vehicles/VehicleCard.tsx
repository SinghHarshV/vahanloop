'use client';

import React from 'react';
import Link from 'next/link';
import { Vehicle } from '@/types';
import {
  Car,
  Bike,
  Zap,
  Fuel,
  Users,
  MapPin,
  Star,
  ShieldCheck,
  ArrowRight,
  Gauge,
} from 'lucide-react';

interface VehicleCardProps {
  vehicle: Vehicle;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle }) => {
  const getCategoryIcon = () => {
    switch (vehicle.category) {
      case 'car':
        return <Car className="w-3.5 h-3.5" />;
      case 'bike':
      case 'scooter':
        return <Bike className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-200 flex flex-col overflow-hidden">
      {/* Image Container */}
      <div className="relative aspect-[16/10] w-full bg-slate-100 overflow-hidden">
        {vehicle.images && vehicle.images.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={vehicle.images[0]}
            alt={vehicle.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <Car className="w-12 h-12 stroke-[1.5]" />
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/95 text-slate-800 shadow-sm backdrop-blur">
            {getCategoryIcon()}
            <span className="capitalize">{vehicle.category}</span>
          </span>

          {vehicle.supportedModes.includes('with-driver') && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-600 text-white shadow-sm">
              Driver Available
            </span>
          )}
        </div>

        {/* Price Tag Overlay */}
        <div className="absolute bottom-3 right-3 bg-slate-900/90 text-white px-3 py-1 rounded-xl text-xs font-bold shadow-md backdrop-blur">
          ₹{vehicle.dailyRate.toLocaleString('en-IN')}{' '}
          <span className="text-[10px] font-normal text-slate-300">/ day</span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Location & Rating */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <div className="flex items-center gap-1 truncate max-w-[170px]">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{vehicle.location}</span>
            </div>
            <div className="flex items-center gap-1 font-semibold text-slate-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span>{vehicle.ownerRating}</span>
              <span className="text-[10px] text-slate-400 font-normal">(demo)</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-emerald-700 transition-colors">
            {vehicle.title}
          </h3>

          <p className="text-xs text-slate-500 mt-0.5">
            {vehicle.year} · {vehicle.manufacturer}
          </p>

          {/* Key Attributes Pills */}
          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-600">
            <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
              <Gauge className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="capitalize truncate">{vehicle.transmission}</span>
            </div>
            <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
              <Fuel className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="capitalize truncate">{vehicle.fuelType}</span>
            </div>
            <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
              <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{vehicle.seatingCapacity} Seats</span>
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Host: <span className="font-semibold text-slate-700">{vehicle.ownerName.split(' ')[0]}</span>
          </div>

          <Link
            href={`/vehicles/${vehicle.id}`}
            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-emerald-600 transition-colors shadow-sm group-hover:shadow"
          >
            View Details
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
