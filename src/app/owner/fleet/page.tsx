'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { OwnerNav } from '@/components/owner/OwnerNav';
import { useMarketplace } from '@/context/MarketplaceContext';
import { useAuth } from '@/context/AuthContext';
import {
  Car,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Clock,
  PlusCircle,
  Building2,
  Wrench,
  Calendar,
  ExternalLink,
} from 'lucide-react';

export default function FleetManagementPage() {
  const { vehicles, bookings, toggleVehicleActive } = useMarketplace();
  const { currentUser } = useAuth();

  const [fleetLocations, setFleetLocations] = useState<any[]>([]);
  const [fleetAssignments, setFleetAssignments] = useState<any[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [message, setMessage] = useState<string>('');

  const myVehicles = currentUser
    ? vehicles.filter((v) => v.ownerId === currentUser.id)
    : vehicles;

  useEffect(() => {
    async function loadFleet() {
      try {
        const res = await fetch('/api/fleet');
        if (res.ok) {
          const data = await res.json();
          setFleetLocations(data.locations || []);
          setFleetAssignments(data.assignments || []);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadFleet();
  }, []);

  const activeVehicles = myVehicles.filter(
    (v) => (v.availabilityStatus as string).toUpperCase() === 'AVAILABLE'
  );
  const maintenanceVehicles = myVehicles.filter(
    (v) => (v.availabilityStatus as string).toUpperCase() === 'MAINTENANCE'
  );
  const pendingApprovals = myVehicles.filter(
    (v) => (v.approvalStatus as string).toUpperCase() === 'PENDING'
  );

  const handleAssignLocation = async (vehicleId: string, locationId: string) => {
    setIsAssigning(true);
    setMessage('');
    try {
      const res = await fetch('/api/fleet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ASSIGN_VEHICLE',
          vehicleId,
          orgId: 'org-fleet-01',
          locationId: locationId || null,
        }),
      });
      if (res.ok) {
        setMessage('Vehicle assigned to fleet depot successfully.');
        setSelectedVehicleId(null);
        // refresh fleet assignments
        const fRes = await fetch('/api/fleet');
        if (fRes.ok) {
          const d = await fRes.json();
          setFleetAssignments(d.assignments || []);
        }
      }
    } catch {
      setMessage('Failed to assign depot.');
    } finally {
      setIsAssigning(false);
    }
  };

  const toggleMaintenance = async (vehicleId: string) => {
    await toggleVehicleActive(vehicleId);
  };

  return (
    <div className="space-y-6 pb-16">
      <OwnerNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Banner */}
        <div className="bg-brand-navy text-white rounded-3xl p-6 sm:p-8 shadow-floating flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-brand-emerald-accent border border-white/15 mb-1">
              <Building2 className="w-3.5 h-3.5 text-brand-emerald" />
              <span>Multi-Depot Fleet Command</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight">
              Fleet Operations &amp; Vehicle Utilization
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Manage multi-vehicle deployment, operational maintenance blocks, and hub distribution.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/owner/fleet/locations"
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center gap-1.5 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-brand-emerald" />
              <span>Fleet Locations ({fleetLocations.length})</span>
            </Link>
            <Link
              href="/owner/add-vehicle"
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-brand-emerald hover:bg-brand-emerald-dark text-white shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Vehicle</span>
            </Link>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-brand-border shadow-card space-y-1">
            <div className="flex items-center justify-between text-brand-text-muted">
              <span className="text-[10px] font-bold uppercase tracking-wider">Total Fleet Size</span>
              <Car className="w-4 h-4 text-brand-navy" />
            </div>
            <p className="text-2xl font-display font-black text-brand-navy">{myVehicles.length}</p>
            <p className="text-[11px] text-brand-text-muted">Registered vehicles</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-brand-border shadow-card space-y-1">
            <div className="flex items-center justify-between text-brand-text-muted">
              <span className="text-[10px] font-bold uppercase tracking-wider">Active &amp; Bookable</span>
              <CheckCircle2 className="w-4 h-4 text-brand-emerald" />
            </div>
            <p className="text-2xl font-display font-black text-brand-emerald">{activeVehicles.length}</p>
            <p className="text-[11px] text-brand-text-muted">Live in search catalog</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-brand-border shadow-card space-y-1">
            <div className="flex items-center justify-between text-brand-text-muted">
              <span className="text-[10px] font-bold uppercase tracking-wider">Under Maintenance</span>
              <Wrench className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-display font-black text-amber-600">{maintenanceVehicles.length}</p>
            <p className="text-[11px] text-brand-text-muted">Service &amp; repairs</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-brand-border shadow-card space-y-1">
            <div className="flex items-center justify-between text-brand-text-muted">
              <span className="text-[10px] font-bold uppercase tracking-wider">Pending Review</span>
              <Clock className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-display font-black text-brand-navy">{pendingApprovals.length}</p>
            <p className="text-[11px] text-brand-text-muted">Compliance verification</p>
          </div>
        </div>

        {message && (
          <div className="p-3 bg-brand-emerald-subtle border border-brand-emerald/30 text-brand-emerald text-xs rounded-2xl flex items-center justify-between">
            <span>{message}</span>
            <button onClick={() => setMessage('')} className="font-bold">×</button>
          </div>
        )}

        {/* Fleet Vehicles Grid */}
        <div className="bg-white rounded-3xl border border-brand-border shadow-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-display font-bold text-brand-navy">
                Fleet Roster &amp; Depot Distribution
              </h2>
              <p className="text-xs text-brand-text-muted">
                Assign depot pickup locations and toggle operational maintenance blocks.
              </p>
            </div>
          </div>

          <div className="divide-y divide-brand-border/60">
            {myVehicles.map((v) => {
              const assignment = fleetAssignments.find((a: any) => a.vehicleId === v.id);
              const isMaintenance = (v.availabilityStatus as string).toUpperCase() === 'MAINTENANCE';

              return (
                <div key={v.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-16 rounded-2xl overflow-hidden bg-brand-surface shrink-0 border border-brand-border">
                      {v.images?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={typeof v.images[0] === 'string' ? v.images[0] : (v.images[0] as any).imageUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-brand-text-muted">
                          <Car className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-brand-text-muted text-[10px]">{v.id}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            isMaintenance
                              ? 'bg-amber-100 text-amber-800'
                              : v.availabilityStatus === 'AVAILABLE'
                              ? 'bg-brand-emerald-subtle text-brand-emerald'
                              : 'bg-brand-surface text-brand-text-muted'
                          }`}
                        >
                          {v.availabilityStatus}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-brand-navy">
                        {v.make} {v.model} ({v.manufacturingYear})
                      </h3>

                      <p className="text-brand-text-muted flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-brand-emerald" />
                        <span>
                          {assignment?.location?.name || v.location || 'Central Depot'}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="font-mono">{v.registrationNumber}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Location assignment selector */}
                    <select
                      value={assignment?.locationId || ''}
                      onChange={(e) => handleAssignLocation(v.id, e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-brand-border bg-brand-surface text-xs font-semibold text-brand-navy"
                    >
                      <option value="">-- Assign Depot --</option>
                      {fleetLocations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name} ({loc.city})
                        </option>
                      ))}
                    </select>

                    {/* Maintenance toggle */}
                    <button
                      onClick={() => toggleMaintenance(v.id)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-colors ${
                        isMaintenance
                          ? 'bg-brand-emerald text-white hover:bg-brand-emerald-dark'
                          : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                      }`}
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>{isMaintenance ? 'Clear Maintenance' : 'Set Maintenance'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
