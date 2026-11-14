'use client';

import React from 'react';
import Link from 'next/link';
import { useMarketplace } from '@/context/MarketplaceContext';
import { useAuth } from '@/context/AuthContext';
import { OwnerNav } from '@/components/owner/OwnerNav';
import {
  Car,
  PlusCircle,
  Power,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  MapPin,
  IndianRupee,
} from 'lucide-react';

export default function MyVehiclesPage() {
  const { vehicles, toggleVehicleActive } = useMarketplace();
  const { currentUser } = useAuth();

  const myVehicles = currentUser
    ? vehicles.filter((v) => v.ownerId === currentUser.id)
    : [];

  return (
    <div className="space-y-6 pb-16">
      <OwnerNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              My Vehicle Fleet
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Registered fleet units: <strong className="text-slate-800">{myVehicles.length}</strong>
            </p>
          </div>

          <Link
            href="/owner/add-vehicle"
            className="px-4 py-2 text-xs font-bold bg-emerald-600 text-white rounded-xl shadow-md hover:bg-emerald-700 transition-colors flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            Add New Vehicle
          </Link>
        </div>

        {/* Vehicles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myVehicles.map((vehicle) => {
            const isApproved = vehicle.approvalStatus === 'approved';
            const isPending = vehicle.approvalStatus === 'pending';
            const isRejected = vehicle.approvalStatus === 'rejected';

            return (
              <div
                key={vehicle.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Photo with status badge */}
                  <div className="relative aspect-[16/10] bg-slate-100">
                    {vehicle.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={vehicle.images[0]}
                        alt={vehicle.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Car className="w-12 h-12" />
                      </div>
                    )}

                    <div className="absolute top-3 left-3">
                      {isApproved && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-sm">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Approved
                        </span>
                      )}
                      {isPending && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 shadow-sm">
                          <Clock className="w-3.5 h-3.5" />
                          Pending Admin Review
                        </span>
                      )}
                      {isRejected && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300 shadow-sm">
                          <XCircle className="w-3.5 h-3.5" />
                          Rejected
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 right-3 bg-slate-900/90 text-white px-2.5 py-1 rounded-lg text-xs font-bold">
                      ₹{vehicle.dailyRate}/day
                    </div>
                  </div>

                  <div className="p-5 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="font-mono text-[11px]">{vehicle.id}</span>
                      <span className="capitalize text-slate-600 font-semibold">
                        {vehicle.category} · {vehicle.transmission}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{vehicle.title}</h3>

                    <div className="flex items-center gap-1.5 text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{vehicle.location}</span>
                    </div>

                    {isRejected && vehicle.rejectionReason && (
                      <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                        <strong>Reason:</strong> {vehicle.rejectionReason}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => toggleVehicleActive(vehicle.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-colors ${
                      vehicle.isActive
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{vehicle.isActive ? 'Active (Live)' : 'Paused'}</span>
                  </button>

                  <Link
                    href={`/vehicles/${vehicle.id}`}
                    className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-semibold"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
