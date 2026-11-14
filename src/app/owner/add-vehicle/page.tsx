'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMarketplace } from '@/context/MarketplaceContext';
import { useAuth } from '@/context/AuthContext';
import { OwnerNav } from '@/components/owner/OwnerNav';
import { VehicleCategory, FuelType, Transmission, RentalType, Vehicle } from '@/types';
import {
  Car,
  Bike,
  Zap,
  CheckCircle2,
  FileCheck2,
  Image as ImageIcon,
  IndianRupee,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Info,
} from 'lucide-react';

const SAMPLE_PHOTO_PRESETS: Record<VehicleCategory, string[]> = {
  car: [
    'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop&q=80',
  ],
  bike: [
    'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800&auto=format&fit=crop&q=80',
  ],
  scooter: [
    'https://images.unsplash.com/photo-1571188654248-7a89213915f7?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1596700813958-fdb9bc2c35bb?w=800&auto=format&fit=crop&q=80',
  ],
};

export default function AddVehiclePage() {
  const router = useRouter();
  const { addVehicle } = useMarketplace();
  const { currentUser } = useAuth();

  const [step, setStep] = useState(1);

  // Form State
  const [category, setCategory] = useState<VehicleCategory>('car');
  const [manufacturer, setManufacturer] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState(2023);
  const [fuelType, setFuelType] = useState<FuelType>('petrol');
  const [transmission, setTransmission] = useState<Transmission>('manual');
  const [seatingCapacity, setSeatingCapacity] = useState(5);
  const [description, setDescription] = useState('');

  // Rental Config
  const [supportsSelfDrive, setSupportsSelfDrive] = useState(true);
  const [supportsWithDriver, setSupportsWithDriver] = useState(false);
  const [dailyRate, setDailyRate] = useState(1800);
  const [driverChargePerDay, setDriverChargePerDay] = useState(700);
  const [minimumDurationDays, setMinimumDurationDays] = useState(1);
  const [location, setLocation] = useState('Indiranagar, Bengaluru');

  // Images
  const [selectedPhoto, setSelectedPhoto] = useState(SAMPLE_PHOTO_PRESETS.car[0]);
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');

  // Mock Document Checklist
  const [docRC, setDocRC] = useState(true);
  const [docInsurance, setDocInsurance] = useState(true);
  const [docPUC, setDocPUC] = useState(true);
  const [docCommercial, setDocCommercial] = useState(true);

  const [formError, setFormError] = useState('');

  const nextStep = () => {
    setFormError('');
    if (step === 2) {
      if (!manufacturer.trim() || !model.trim()) {
        setFormError('Please provide both manufacturer and model name.');
        return;
      }
    }
    if (step === 3) {
      if (!supportsSelfDrive && !supportsWithDriver) {
        setFormError('Please select at least one rental mode (Self-Drive or With Driver).');
        return;
      }
      if (dailyRate <= 0) {
        setFormError('Please specify a valid daily rate.');
        return;
      }
    }
    setStep((prev) => Math.min(6, prev + 1));
  };

  const prevStep = () => {
    setFormError('');
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const supportedModes: RentalType[] = [];
    if (supportsSelfDrive) supportedModes.push('self-drive');
    if (supportsWithDriver) supportedModes.push('with-driver');

    const finalImage = customPhotoUrl.trim() || selectedPhoto;

    const newVehicle: Vehicle = {
      id: `veh-${category}-${Date.now().toString().slice(-5)}`,
      title: `${manufacturer} ${model}`,
      manufacturer,
      model,
      year: Number(year),
      category,
      fuelType,
      transmission,
      seatingCapacity: Number(seatingCapacity),
      location,
      dailyRate: Number(dailyRate),
      driverChargePerDay: supportsWithDriver ? Number(driverChargePerDay) : undefined,
      minimumDurationDays: Number(minimumDurationDays),
      supportedModes,
      images: [finalImage],
      description:
        description.trim() ||
        `Well-maintained ${manufacturer} ${model} ready for self-drive and city cruising in ${location}.`,
      ownerId: currentUser?.id || 'usr-owner-1',
      ownerName: currentUser?.name || 'Verified Host',
      ownerEmail: currentUser?.email || 'owner@vahanloop.demo',
      ownerRating: 5.0,
      approvalStatus: 'pending', // IMPORTANT: pending administrator review!
      isActive: true,
      isAvailable: true,
      documents: {
        rc: docRC ? 'verified' : 'pending',
        insurance: docInsurance ? 'verified' : 'pending',
        puc: docPUC ? 'verified' : 'pending',
        commercialAuthorisation: docCommercial ? 'verified' : 'pending',
      },
      rentalConditions: [
        'Valid driving licence required at handover.',
        'Speed limit of 100 km/h on expressways.',
        'Refundable security deposit collected prior to handover.',
      ],
      features: ['Air Conditioning', 'Power Steering', 'Bluetooth Audio', 'Fastag Enabled'],
      reviews: [],
      createdAt: new Date().toISOString(),
    };

    addVehicle(newVehicle);
    router.push('/owner/vehicles');
  };

  return (
    <div className="space-y-6 pb-20">
      <OwnerNav />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Vehicle Partner Onboarding</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Register New Vehicle
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Follow the 6-step registration. Newly submitted vehicles are sent to the Admin Review
            console before appearing publicly.
          </p>
        </div>

        {/* Step Progress Tracker */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            {[
              '1. Category',
              '2. Info',
              '3. Pricing',
              '4. Photos',
              '5. Documents',
              '6. Review',
            ].map((label, idx) => (
              <span
                key={idx}
                className={`${
                  step === idx + 1
                    ? 'text-emerald-600 font-extrabold'
                    : step > idx + 1
                    ? 'text-slate-800'
                    : 'text-slate-300'
                }`}
              >
                {label}
              </span>
            ))}
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-600 h-full transition-all duration-300"
              style={{ width: `${(step / 6) * 100}%` }}
            />
          </div>
        </div>

        {formError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <Info className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Multi-step Form Content */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          {/* STEP 1: CATEGORY */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900">
                Step 1: Select Vehicle Category
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    id: 'car',
                    title: 'Four-Wheeler Car',
                    desc: 'Sedan, Hatchback, Compact SUV, or 7-Seater',
                    icon: <Car className="w-8 h-8 text-blue-600" />,
                  },
                  {
                    id: 'bike',
                    title: 'Motorcycle',
                    desc: 'Cruiser, Commuter, or Sports Bike',
                    icon: <Bike className="w-8 h-8 text-amber-600" />,
                  },
                  {
                    id: 'scooter',
                    title: 'Automatic Scooter',
                    desc: 'Gearless scooter for swift city mobility',
                    icon: <Zap className="w-8 h-8 text-emerald-600" />,
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setCategory(item.id as VehicleCategory);
                      setSelectedPhoto(SAMPLE_PHOTO_PRESETS[item.id as VehicleCategory][0]);
                      if (item.id !== 'car') setSeatingCapacity(2);
                    }}
                    className={`p-5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      category === item.id
                        ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div>{item.icon}</div>
                    <div className="mt-4">
                      <p className="text-sm font-bold text-slate-900">{item.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: INFORMATION */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900">
                Step 2: Basic Vehicle Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Manufacturer / Make
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hyundai, Tata, Honda, Royal Enfield"
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Model & Variant
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. i20 Asta, Nexon Fearless, Classic 350"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Manufacturing Year
                  </label>
                  <input
                    type="number"
                    min="2015"
                    max="2026"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Fuel Type
                  </label>
                  <select
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value as FuelType)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="petrol">Petrol</option>
                    <option value="diesel">Diesel</option>
                    <option value="electric">Electric</option>
                    <option value="cng">CNG</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Transmission
                  </label>
                  <select
                    value={transmission}
                    onChange={(e) => setTransmission(e.target.value as Transmission)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="manual">Manual Transmission</option>
                    <option value="automatic">Automatic / AMT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Seating Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="9"
                    value={seatingCapacity}
                    onChange={(e) => setSeatingCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description & Key Condition Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Share details regarding cleanliness, driving dynamics, highway etiquette, or key accessories..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {/* STEP 3: RENTAL CONFIGURATION */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900">
                Step 3: Rental Pricing & Operational Modes
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Base Daily Rate (₹ / Day)
                  </label>
                  <input
                    type="number"
                    step="50"
                    min="300"
                    value={dailyRate}
                    onChange={(e) => setDailyRate(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Minimum Rental Duration (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="7"
                    value={minimumDurationDays}
                    onChange={(e) => setMinimumDurationDays(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Supported Modes */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Supported Rental Modes
                </p>

                <label className="flex items-center gap-3 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={supportsSelfDrive}
                    onChange={(e) => setSupportsSelfDrive(e.target.checked)}
                    className="w-4 h-4 accent-emerald-600 rounded"
                  />
                  <div>
                    <span className="font-bold">Self-Drive Rental</span>
                    <p className="text-[11px] text-slate-500">
                      Renter drives the vehicle themselves under verification.
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 text-xs text-slate-700 cursor-pointer pt-2 border-t border-slate-200">
                  <input
                    type="checkbox"
                    checked={supportsWithDriver}
                    onChange={(e) => setSupportsWithDriver(e.target.checked)}
                    className="w-4 h-4 accent-emerald-600 rounded"
                  />
                  <div>
                    <span className="font-bold">With Chauffeur / Driver</span>
                    <p className="text-[11px] text-slate-500">
                      You provide an experienced commercial driver with the ride.
                    </p>
                  </div>
                </label>

                {supportsWithDriver && (
                  <div className="mt-3 pl-7">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Additional Driver Allowance (₹ / Day)
                    </label>
                    <input
                      type="number"
                      step="50"
                      value={driverChargePerDay}
                      onChange={(e) => setDriverChargePerDay(Number(e.target.value))}
                      className="w-48 px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Primary Handover Location
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Indiranagar, Bengaluru">Indiranagar, Bengaluru</option>
                  <option value="Koramangala, Bengaluru">Koramangala, Bengaluru</option>
                  <option value="HSR Layout, Bengaluru">HSR Layout, Bengaluru</option>
                  <option value="Whitefield, Bengaluru">Whitefield, Bengaluru</option>
                  <option value="Jayanagar, Bengaluru">Jayanagar, Bengaluru</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 4: IMAGES */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900">
                Step 4: Vehicle Images & Gallery Preview
              </h2>
              <p className="text-xs text-slate-500">
                Select from verified vehicle presets or paste a direct image URL.
              </p>

              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Curated Presets for {category.toUpperCase()}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {SAMPLE_PHOTO_PRESETS[category].map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setSelectedPhoto(url);
                        setCustomPhotoUrl('');
                      }}
                      className={`aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all ${
                        selectedPhoto === url && !customPhotoUrl
                          ? 'border-emerald-600 ring-2 ring-emerald-500/20 scale-102'
                          : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Or Paste Custom Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={customPhotoUrl}
                  onChange={(e) => setCustomPhotoUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-slate-400 shrink-0" />
                <span>
                  Prototype uses hosted preview images. Real photo file uploads with EXIF verification
                  will be enabled in Phase 2.
                </span>
              </div>
            </div>
          )}

          {/* STEP 5: DOCUMENT CHECKLIST */}
          {step === 5 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900">
                Step 5: Demonstration Document Checklist
              </h2>
              <p className="text-xs text-slate-500">
                Mark readiness for standard Indian motor regulatory documents.
              </p>

              <div className="p-4 bg-amber-50/70 border border-amber-200 text-xs text-amber-800 rounded-2xl flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Privacy & Mock Data Protection:</strong> As a demonstration prototype, no
                  real government IDs, physical RC books, or sensitive documents will be collected.
                </div>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    id: 'rc',
                    label: 'Valid Vehicle Registration Certificate (RC)',
                    desc: 'Vehicle registered in host name or authorized fleet lease.',
                    state: docRC,
                    setter: setDocRC,
                  },
                  {
                    id: 'insurance',
                    label: 'Comprehensive Motor Insurance',
                    desc: 'Zero-depreciation or third-party + own-damage coverage active.',
                    state: docInsurance,
                    setter: setDocInsurance,
                  },
                  {
                    id: 'puc',
                    label: 'Pollution Under Control (PUC) Certificate',
                    desc: 'Valid emission test compliance certificate.',
                    state: docPUC,
                    setter: setDocPUC,
                  },
                  {
                    id: 'comm',
                    label: 'Commercial / Rental Authorization',
                    desc: 'Compliant self-drive permit / transport authorization status.',
                    state: docCommercial,
                    setter: setDocCommercial,
                  },
                ].map((item) => (
                  <label
                    key={item.id}
                    className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={item.state}
                      onChange={(e) => item.setter(e.target.checked)}
                      className="w-4 h-4 accent-emerald-600 rounded mt-0.5"
                    />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-800">{item.label}</p>
                      <p className="text-[11px] text-slate-500">{item.desc}</p>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      Ready
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* STEP 6: REVIEW & SUBMIT */}
          {step === 6 && (
            <div className="space-y-5">
              <h2 className="text-base font-bold text-slate-900">
                Step 6: Review & Submit Listing
              </h2>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h3 className="text-base font-bold text-slate-900">
                    {manufacturer} {model} ({year})
                  </h3>
                  <span className="capitalize font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    {category}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-600">
                  <div>
                    Fuel: <strong className="text-slate-800 capitalize">{fuelType}</strong>
                  </div>
                  <div>
                    Transmission:{' '}
                    <strong className="text-slate-800 capitalize">{transmission}</strong>
                  </div>
                  <div>
                    Capacity: <strong className="text-slate-800">{seatingCapacity} Seats</strong>
                  </div>
                  <div>
                    Daily Rate:{' '}
                    <strong className="text-emerald-700">₹{dailyRate}/day</strong>
                  </div>
                  <div>
                    Min Days: <strong className="text-slate-800">{minimumDurationDays}</strong>
                  </div>
                  <div>
                    Location: <strong className="text-slate-800">{location}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                    Rental Modes:
                  </span>
                  <div className="flex gap-2 mt-1">
                    {supportsSelfDrive && (
                      <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-medium">
                        Self-Drive
                      </span>
                    )}
                    {supportsWithDriver && (
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-medium">
                        With Chauffeur (+₹{driverChargePerDay}/day)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 text-xs flex items-start gap-2.5">
                <Info className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">What happens next?</p>
                  <p className="mt-0.5 text-purple-800">
                    Your vehicle will be saved with status <code>Pending Approval</code>. It will
                    immediately appear in the <strong>Administrator Portal</strong> for review, and
                    will only be shown to customers in search once approved.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Previous Step
              </button>
            ) : (
              <div />
            )}

            {step < 6 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-5 py-2.5 text-xs font-bold bg-slate-900 text-white rounded-xl shadow-md hover:bg-emerald-600 transition-colors flex items-center gap-1.5"
              >
                Next Step
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="px-6 py-2.5 text-xs font-bold bg-emerald-600 text-white rounded-xl shadow-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Submit for Admin Approval
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
