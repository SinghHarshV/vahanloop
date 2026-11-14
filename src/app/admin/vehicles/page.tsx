'use client';

import React, { useState } from 'react';
import { useMarketplace } from '@/context/MarketplaceContext';
import { AdminNav } from '@/components/admin/AdminNav';
import { ListingReviewModal } from '@/components/admin/ListingReviewModal';
import { Vehicle, ApprovalStatus } from '@/types';
import {
  Car,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Check,
  X,
  Search,
  MapPin,
} from 'lucide-react';

export default function AdminVehiclesPage() {
  const { vehicles, updateVehicleApproval } = useMarketplace();
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [tab, setTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [search, setSearch] = useState('');

  const filtered = vehicles
    .filter((v) => {
      if (tab !== 'all' && v.approvalStatus !== tab) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          v.title.toLowerCase().includes(q) ||
          v.ownerName.toLowerCase().includes(q) ||
          v.id.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      // Pending first
      if (a.approvalStatus === 'pending' && b.approvalStatus !== 'pending') return -1;
      if (b.approvalStatus === 'pending' && a.approvalStatus !== 'pending') return 1;
      return 0;
    });

  const pendingCount = vehicles.filter((v) => v.approvalStatus === 'pending').length;

  return (
    <div className="space-y-6 pb-16">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Vehicle Catalogue Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Verify host registrations and manage public search publication.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by title or host..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
            />
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-2 border-b border-slate-200 pb-2 text-xs font-semibold">
          <button
            onClick={() => setTab('all')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors ${
              tab === 'all'
                ? 'bg-purple-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            All Vehicles ({vehicles.length})
          </button>

          <button
            onClick={() => setTab('pending')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              tab === 'pending'
                ? 'bg-purple-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>Pending Review</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setTab('approved')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors ${
              tab === 'approved'
                ? 'bg-purple-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Approved ({vehicles.filter((v) => v.approvalStatus === 'approved').length})
          </button>

          <button
            onClick={() => setTab('rejected')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors ${
              tab === 'rejected'
                ? 'bg-purple-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Rejected ({vehicles.filter((v) => v.approvalStatus === 'rejected').length})
          </button>
        </div>

        {/* Vehicles Table / Cards */}
        <div className="space-y-4">
          {filtered.map((v) => {
            const isApproved = v.approvalStatus === 'approved';
            const isPending = v.approvalStatus === 'pending';
            const isRejected = v.approvalStatus === 'rejected';

            return (
              <div
                key={v.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-4">
                  <div className="w-20 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                    {v.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={v.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Car className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-400 text-[10px]">{v.id}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isApproved
                            ? 'bg-emerald-100 text-emerald-800'
                            : isPending
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {v.approvalStatus}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{v.title}</h3>

                    <p className="text-slate-500">
                      Host: <strong>{v.ownerName}</strong> ({v.ownerEmail}) · {v.location}
                    </p>

                    <p className="text-slate-400 text-[11px]">
                      ₹{v.dailyRate}/day · {v.category} · {v.transmission} · {v.fuelType}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                  <button
                    onClick={() => setSelectedVehicle(v)}
                    className="px-3.5 py-1.5 rounded-xl font-bold bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200 transition-colors flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Inspect Details
                  </button>

                  {isPending && (
                    <>
                      <button
                        onClick={() => updateVehicleApproval(v.id, 'approved')}
                        className="px-3.5 py-1.5 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-colors flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          updateVehicleApproval(
                            v.id,
                            'rejected',
                            'Documentation requirements not fulfilled.'
                          )
                        }
                        className="px-3 py-1.5 rounded-xl font-semibold bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {isApproved && (
                    <button
                      onClick={() =>
                        updateVehicleApproval(v.id, 'rejected', 'Revoked by administrator.')
                      }
                      className="px-3 py-1.5 rounded-xl font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      Revoke Approval
                    </button>
                  )}

                  {isRejected && (
                    <button
                      onClick={() => updateVehicleApproval(v.id, 'approved')}
                      className="px-3 py-1.5 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                    >
                      Re-Approve
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedVehicle && (
        <ListingReviewModal
          vehicle={selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
        />
      )}
    </div>
  );
}
