'use client';

import React, { useState } from 'react';
import { Vehicle } from '@/types';
import { useMarketplace } from '@/context/MarketplaceContext';
import {
  CheckCircle2,
  XCircle,
  ShieldCheck,
  AlertCircle,
  FileCheck,
  Car,
  MapPin,
  X,
  IndianRupee,
} from 'lucide-react';

interface ListingReviewModalProps {
  vehicle: Vehicle;
  onClose: () => void;
}

export const ListingReviewModal: React.FC<ListingReviewModalProps> = ({
  vehicle,
  onClose,
}) => {
  const { updateVehicleApproval } = useMarketplace();
  const [rejectMode, setRejectMode] = useState(false);
  const [reason, setReason] = useState('Missing clear registration document details.');

  const handleApprove = () => {
    updateVehicleApproval(vehicle.id, 'approved');
    onClose();
  };

  const handleReject = () => {
    updateVehicleApproval(vehicle.id, 'rejected', reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar border border-slate-200 shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-purple-700 font-semibold text-xs tracking-wider uppercase mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>Platform Administrator Verification</span>
        </div>

        <h2 className="text-xl font-bold text-slate-900">Review Vehicle Listing</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Submitted by: <strong className="text-slate-700">{vehicle.ownerName}</strong> ({vehicle.ownerEmail})
        </p>

        {/* Vehicle Preview Card */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="aspect-[4/3] rounded-lg overflow-hidden bg-slate-200">
            {vehicle.images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={vehicle.images[0]}
                alt={vehicle.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <Car className="w-8 h-8" />
              </div>
            )}
          </div>

          <div className="md:col-span-2 space-y-2 text-xs text-slate-600">
            <h3 className="text-base font-bold text-slate-900">{vehicle.title}</h3>
            <div className="flex items-center gap-1.5 text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{vehicle.location}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 font-medium text-slate-700">
              <div>Category: <span className="capitalize">{vehicle.category}</span></div>
              <div>Year: {vehicle.year}</div>
              <div>Fuel: <span className="capitalize">{vehicle.fuelType}</span></div>
              <div>Transmission: <span className="capitalize">{vehicle.transmission}</span></div>
              <div>Seating: {vehicle.seatingCapacity} Persons</div>
              <div>
                Rate: <strong className="text-emerald-700">₹{vehicle.dailyRate}/day</strong>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 italic pt-1">{vehicle.description}</p>
          </div>
        </div>

        {/* Mock Document Checklist */}
        <div className="mt-5 space-y-3">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Verification Checklist (Mock Documentation)
          </h4>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-semibold text-slate-700">Vehicle RC Copy</span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                Verified (Mock)
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-semibold text-slate-700">Valid Comprehensive Insurance</span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                Verified (Mock)
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-semibold text-slate-700">Pollution Under Control (PUC)</span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                Verified (Mock)
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-semibold text-slate-700">Rental / Commercial Permit</span>
              <span className="text-[11px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                Compliant (Mock)
              </span>
            </div>
          </div>
        </div>

        {/* Disclaimer Notice */}
        <div className="mt-4 p-3 rounded-xl bg-purple-50 border border-purple-200 text-[11px] text-purple-900 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
          <span>
            <strong>Prototype Admin Action:</strong> Approving this vehicle will immediately set its
            status to <code>approved</code> and make it visible in the customer search catalogue.
            This action is for demonstration purposes.
          </span>
        </div>

        {/* Rejection Input Mode */}
        {rejectMode && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-2">
            <label className="block text-xs font-bold text-rose-800">
              State Reason for Rejection
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-between pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {rejectMode ? (
              <>
                <button
                  type="button"
                  onClick={() => setRejectMode(false)}
                  className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  className="px-4 py-2 text-xs font-bold bg-rose-600 text-white rounded-xl shadow hover:bg-rose-700 transition-colors flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Confirm Rejection
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setRejectMode(true)}
                  className="px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Reject Listing
                </button>
                <button
                  type="button"
                  onClick={handleApprove}
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 text-white rounded-xl shadow hover:bg-emerald-700 transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Approve & Publish Listing
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
