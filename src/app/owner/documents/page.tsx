'use client';

import React, { useState } from 'react';
import { OwnerNav } from '@/components/owner/OwnerNav';
import { useMarketplace } from '@/context/MarketplaceContext';
import { useAuth } from '@/context/AuthContext';
import {
  FileCheck2,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Lock,
  Sparkles,
} from 'lucide-react';

export default function OwnerDocumentsPage() {
  const { vehicles } = useMarketplace();
  const { currentUser } = useAuth();
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [category, setCategory] = useState<string>('RC');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const myVehicles = currentUser
    ? vehicles.filter((v) => v.ownerId === currentUser.id)
    : [];

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !selectedVehicleId) return;
    setIsUploading(true);
    setStatusMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('vehicleId', selectedVehicleId);
      formData.append('category', category);

      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setStatusMessage('Document uploaded to private secure vault. Pending administrative verification.');
        setFile(null);
      } else {
        setStatusMessage(`Upload failed: ${data.error || 'Server rejected file'}`);
      }
    } catch {
      setStatusMessage('Network error uploading document.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <OwnerNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Secure Document Centre
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Upload vehicle registration, commercial permits, and insurance files for compliance approval.
          </p>
        </div>

        {/* Security Alert */}
        <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-start gap-3 shadow-lg">
          <Lock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h4 className="font-bold text-emerald-400">Private Isolated Storage Enforced</h4>
            <p className="text-slate-300">
              Confidential files are stored outside the public directory with random UUID object keys. Access requires authenticated ownership authorization and short-lived signed URLs.
            </p>
          </div>
        </div>

        {statusMessage && (
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl flex items-center justify-between">
            <span>{statusMessage}</span>
            <button onClick={() => setStatusMessage('')} className="font-bold ml-2">×</button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Upload Form */}
          <div className="md:col-span-1 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-600" /> Upload Document
            </h3>

            <form onSubmit={handleUpload} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Select Fleet Vehicle</label>
                <select
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="w-full p-2.5 border rounded-xl bg-white text-slate-800"
                  required
                >
                  <option value="">-- Choose vehicle --</option>
                  {myVehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.title} ({v.registrationNumber || v.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Document Type</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 border rounded-xl bg-white text-slate-800"
                >
                  <option value="RC">Registration Certificate (RC)</option>
                  <option value="INSURANCE">Insurance Policy</option>
                  <option value="PUC">Pollution Under Control (PUC)</option>
                  <option value="COMMERCIAL_PERMIT">Commercial / Rental Permit</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Upload File (PDF / JPG / PNG)</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full p-2 border rounded-xl text-slate-600 text-xs file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:bg-slate-100"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">Maximum size: 10MB. Magic byte validation applied.</p>
              </div>

              <button
                type="submit"
                disabled={isUploading || !file || !selectedVehicleId}
                className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50"
              >
                {isUploading ? 'Securing & Uploading...' : 'Upload Document'}
              </button>
            </form>
          </div>

          {/* Existing Document Checklist */}
          <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Fleet Compliance Status</h3>

            {myVehicles.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No vehicles found in your fleet.</p>
            ) : (
              <div className="space-y-4">
                {myVehicles.map((v) => (
                  <div key={v.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-sm">{v.title}</h4>
                      <span className="text-[10px] font-mono text-slate-500">{v.location}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="p-2.5 bg-white rounded-xl border flex items-center justify-between">
                        <span className="text-slate-600 font-medium">RC</span>
                        <span className="inline-flex items-center text-emerald-700 font-bold text-[10px] gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </span>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border flex items-center justify-between">
                        <span className="text-slate-600 font-medium">Insurance</span>
                        <span className="inline-flex items-center text-emerald-700 font-bold text-[10px] gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </span>
                      </div>
                      <div className="p-2.5 bg-white rounded-xl border flex items-center justify-between">
                        <span className="text-slate-600 font-medium">PUC</span>
                        <span className="inline-flex items-center text-emerald-700 font-bold text-[10px] gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
