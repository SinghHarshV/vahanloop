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
    <div className="space-y-8 pb-16">
      <OwnerNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-brand-border">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-brand-navy">
              My Vehicle Fleet
            </h1>
            <p className="text-xs sm:text-sm text-brand-text-muted mt-1">
              Registered fleet units: <strong className="text-brand-navy">{myVehicles.length}</strong>
            </p>
          </div>

          <Link
            href="/owner/add-vehicle"
            className="px-5 py-2.5 text-xs font-bold bg-brand-emerald hover:bg-brand-emerald-dark text-white rounded-full shadow-floating transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            Register New Vehicle
          </Link>
        </div>

        {myVehicles.length === 0 ? (
          <div className="bg-white rounded-3xl border border-brand-border p-12 text-center shadow-card space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-surface flex items-center justify-center mx-auto">
              <Car className="w-8 h-8 text-brand-text-muted stroke-[1.5]" />
            </div>
            <h3 className="text-lg font-display font-bold text-brand-navy">No vehicles registered yet</h3>
            <p className="text-xs text-brand-text-muted">
              Register your first vehicle to start earning rental income from verified guests.
            </p>
            <Link
              href="/owner/add-vehicle"
              className="inline-block mt-2 px-6 py-2.5 rounded-full text-xs font-bold bg-brand-navy hover:bg-brand-emerald text-white transition-colors"
            >
              Register Your First Vehicle
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myVehicles.map((vehicle) => {
              const isApproved = vehicle.approvalStatus === 'approved';
              const isPending = vehicle.approvalStatus === 'pending';
              const isRejected = vehicle.approvalStatus === 'rejected';

              return (
                <div
                  key={vehicle.id}
                  className="bg-white rounded-3xl border border-brand-border shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden flex flex-col justify-between"
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
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-brand-emerald-subtle text-brand-emerald border border-brand-emerald/30 shadow-sm backdrop-blur-md">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Approved
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-700 border border-amber-500/30 shadow-sm backdrop-blur-md">
                            <Clock className="w-3.5 h-3.5" />
                            Under Review
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-brand-danger/15 text-brand-danger border border-brand-danger/30 shadow-sm backdrop-blur-md">
                            <XCircle className="w-3.5 h-3.5" />
                            Rejected
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-3 right-3 bg-brand-navy/90 text-white px-2.5 py-1 rounded-xl text-xs font-bold backdrop-blur-md">
                        ₹{vehicle.dailyRate.toLocaleString('en-IN')}/day
                      </div>
                    </div>

                    <div className="p-5 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-brand-text-muted">
                        <span className="font-mono text-[10px] bg-brand-surface px-2 py-0.5 rounded">{vehicle.id}</span>
                        <span className="capitalize font-semibold">
                          {vehicle.category} · {vehicle.transmission}
                        </span>
                      </div>

                      <h3 className="text-base font-display font-bold text-brand-navy">{vehicle.title}</h3>

                      <div className="flex items-center gap-1.5 text-brand-text-muted">
                        <MapPin className="w-3.5 h-3.5 text-brand-emerald" />
                        <span>{vehicle.location}</span>
                      </div>

                      {isRejected && vehicle.rejectionReason && (
                        <div className="p-2.5 rounded-xl bg-brand-danger/10 border border-brand-danger/20 text-brand-danger text-xs">
                          <strong>Reason:</strong> {vehicle.rejectionReason}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer Controls */}
                  <div className="p-4 bg-brand-surface border-t border-brand-border flex items-center justify-between text-xs">
                    <button
                      onClick={() => toggleVehicleActive(vehicle.id)}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-bold transition-all ${
                        vehicle.isActive
                          ? 'bg-brand-emerald-subtle text-brand-emerald border border-brand-emerald/20 hover:bg-brand-emerald hover:text-white'
                          : 'bg-brand-surface text-brand-text-muted border border-brand-border hover:bg-slate-200'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{vehicle.isActive ? 'Live / Active' : 'Paused'}</span>
                    </button>

                    <Link
                      href={`/vehicles/${vehicle.id}`}
                      className="flex items-center gap-1 text-brand-navy hover:text-brand-emerald font-bold transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Preview
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
