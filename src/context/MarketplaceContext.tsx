'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { Vehicle, Booking, ApprovalStatus, BookingStatus, SimulatedPayment } from '@/types';
import { INITIAL_VEHICLES, INITIAL_BOOKINGS } from '@/data/seedData';

export interface ApiVehicle extends Vehicle {
  // DB field aliases for compatibility
  make?: string;
  dailyRentalPrice?: number;
  driverCharge?: number | null;
  selfDriveEnabled?: boolean;
  chauffeurEnabled?: boolean;
  manufacturingYear?: number;
  availabilityStatus?: string;
  registrationNumber?: string;
  owner?: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
  };
}

export interface ApiBooking extends Booking {
  // DB field aliases for compatibility
  pickupDateTime?: string;
  returnDateTime?: string;
  pickupLocation?: string;
  dropLocation?: string;
  basePrice?: number;
  driverCharge?: number;
  customer?: { id: string; fullName: string; email: string; phone: string };
  vehicle?: ApiVehicle;
  payments?: any[];
}

interface NotificationItem {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

// Convert DB vehicle record to UI Vehicle
function normalizeVehicle(v: any): ApiVehicle {
  if (!v) return v;
  const title = v.title || `${v.make || ''} ${v.model || ''}`.trim();
  const manufacturer = v.manufacturer || v.make || 'Unknown';
  const year = v.year || v.manufacturingYear || 2023;
  const category = (v.category || 'car').toLowerCase();
  const fuelType = (v.fuelType || 'petrol').toLowerCase();
  const transmission = (v.transmission || 'manual').toLowerCase();
  const dailyRate = v.dailyRate ?? v.dailyRentalPrice ?? 1500;
  const driverChargePerDay = v.driverChargePerDay ?? v.driverCharge ?? (v.chauffeurEnabled ? 700 : undefined);
  const supportedModes = v.supportedModes || [
    ...(v.selfDriveEnabled !== false ? ['self-drive'] : []),
    ...(v.chauffeurEnabled ? ['with-driver'] : []),
  ];
  if (supportedModes.length === 0) supportedModes.push('self-drive');

  const images = Array.isArray(v.images)
    ? v.images.map((img: any) => (typeof img === 'string' ? img : img.imageUrl))
    : ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80'];

  const ownerName = v.ownerName || v.owner?.fullName || 'Verified Host';
  const ownerEmail = v.ownerEmail || v.owner?.email || 'owner@vahanloop.demo';
  const approvalStatus: ApprovalStatus = (v.approvalStatus || 'approved').toLowerCase() as ApprovalStatus;
  const isActive = v.isActive ?? (v.availabilityStatus ? v.availabilityStatus === 'AVAILABLE' : true);
  const isAvailable = v.isAvailable ?? isActive;

  return {
    ...v,
    title,
    manufacturer,
    make: manufacturer,
    year,
    manufacturingYear: year,
    category,
    fuelType,
    transmission,
    seatingCapacity: v.seatingCapacity || 5,
    location: v.location || 'Bengaluru',
    dailyRate,
    dailyRentalPrice: dailyRate,
    driverChargePerDay,
    driverCharge: driverChargePerDay,
    minimumDurationDays: v.minimumDurationDays || 1,
    supportedModes,
    selfDriveEnabled: supportedModes.includes('self-drive'),
    chauffeurEnabled: supportedModes.includes('with-driver'),
    images,
    description: v.description || 'Quality maintained vehicle available for short and long-term rental.',
    ownerId: v.ownerId || 'usr-owner-1',
    ownerName,
    ownerEmail,
    ownerRating: v.ownerRating || 4.9,
    approvalStatus,
    rejectionReason: v.rejectionReason,
    isActive,
    isAvailable,
    availabilityStatus: isActive ? 'AVAILABLE' : 'INACTIVE',
    documents: v.documents && !Array.isArray(v.documents) ? v.documents : {
      rc: 'verified',
      insurance: 'verified',
      puc: 'verified',
      commercialAuthorisation: 'verified',
    },
    rentalConditions: v.rentalConditions || [
      'Original driving licence and Aadhaar card required at pickup.',
      'Refundable security deposit is collected at booking.',
      'Speed limit strictly capped at 80 km/h for safety compliance.',
    ],
    features: v.features || ['Bluetooth Audio', 'Air Conditioning', 'Airbags', 'Fastag Enabled'],
    reviews: v.reviews || [],
    createdAt: v.createdAt ? new Date(v.createdAt).toISOString() : new Date().toISOString(),
  };
}

// Convert DB booking record to UI Booking
function normalizeBooking(b: any): ApiBooking {
  if (!b) return b;
  const startDate = b.startDate || (b.pickupDateTime ? new Date(b.pickupDateTime).toISOString().split('T')[0] : '2024-04-10');
  const endDate = b.endDate || (b.returnDateTime ? new Date(b.returnDateTime).toISOString().split('T')[0] : '2024-04-12');
  const totalDays = b.totalDays || Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000));
  const rentalType = (b.rentalType || 'self-drive').toLowerCase().replace('_', '-');
  const rawStatus = (b.status || 'requested').toLowerCase();
  const status: BookingStatus = rawStatus as BookingStatus;

  const vehicleTitle = b.vehicleTitle || (b.vehicle ? `${b.vehicle.make || ''} ${b.vehicle.model || ''}`.trim() : 'Hyundai i20');
  const vehicleImage = b.vehicleImage || (b.vehicle?.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80');
  const customerName = b.customerName || b.customer?.fullName || 'Guest Customer';
  const customerEmail = b.customerEmail || b.customer?.email || 'customer@vahanloop.demo';

  const totalAmount = b.totalAmount || 5960;
  const securityDeposit = b.securityDeposit || 2000;
  const serviceFee = b.serviceFee || Math.round(totalAmount * 0.1);
  const driverChargeTotal = b.driverChargeTotal || b.driverCharge || 0;
  const dailyRate = b.dailyRate || Math.round((totalAmount - securityDeposit - serviceFee) / totalDays);
  const ownerEarnings = b.ownerEarnings || (totalAmount - serviceFee - securityDeposit);

  return {
    ...b,
    vehicleTitle,
    vehicleImage,
    vehicleCategory: (b.vehicleCategory || b.vehicle?.category || 'car').toLowerCase(),
    customerId: b.customerId || 'usr-customer-1',
    customerName,
    customerEmail,
    customerPhone: b.customerPhone || b.customer?.phone,
    ownerId: b.ownerId || b.vehicle?.ownerId || 'usr-owner-1',
    startDate,
    endDate,
    totalDays,
    rentalType,
    dailyRate,
    driverChargeTotal,
    serviceFee,
    securityDeposit,
    totalAmount,
    ownerEarnings,
    platformCommission: serviceFee,
    status,
    rejectionReason: b.rejectionReason,
    createdAt: b.createdAt ? new Date(b.createdAt).toISOString() : new Date().toISOString(),
  };
}

interface MarketplaceContextType {
  vehicles: ApiVehicle[];
  approvedVehicles: ApiVehicle[];
  bookings: ApiBooking[];
  notifications: NotificationItem[];
  addNotification: (type: 'success' | 'error' | 'info', message: string) => void;
  removeNotification: (id: string) => void;
  refreshData: () => void;
  refreshVehicles: () => Promise<void>;
  refreshBookings: () => Promise<void>;
  addVehicle: (vehicleData: any) => Promise<{ success: boolean; error?: string }>;
  updateVehicleApproval: (id: string, status: ApprovalStatus | 'approve' | 'reject', reason?: string) => Promise<void>;
  toggleVehicleActive: (id: string) => Promise<void>;
  createBooking: (bookingData: any) => Promise<{ success: boolean; error?: string; booking?: ApiBooking }>;
  updateBookingStatus: (
    id: string,
    status: BookingStatus | 'accept' | 'reject' | 'cancel' | 'simulate-payment',
    payment?: SimulatedPayment,
    reason?: string
  ) => Promise<void>;
  resetAllDemoData: () => Promise<void>;
  isLoadingVehicles: boolean;
  isLoadingBookings: boolean;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, primaryRole } = useAuth();
  const [vehicles, setVehicles] = useState<ApiVehicle[]>(INITIAL_VEHICLES.map(normalizeVehicle));
  const [bookings, setBookings] = useState<ApiBooking[]>(INITIAL_BOOKINGS.map(normalizeBooking));
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);

  const addNotification = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4500);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const refreshVehicles = useCallback(async () => {
    setIsLoadingVehicles(true);
    try {
      const url = primaryRole === 'admin'
        ? '/api/admin/vehicles'
        : primaryRole === 'owner'
        ? '/api/owner/vehicles'
        : '/api/vehicles';
      const res = await fetch(url, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.vehicles && data.vehicles.length > 0) {
          setVehicles(data.vehicles.map(normalizeVehicle));
        }
      }
    } catch {
      // keep fallback data
    } finally {
      setIsLoadingVehicles(false);
    }
  }, [primaryRole]);

  const refreshBookings = useCallback(async () => {
    if (!currentUser) return;
    setIsLoadingBookings(true);
    try {
      const url = primaryRole === 'admin'
        ? '/api/admin/bookings'
        : primaryRole === 'owner'
        ? '/api/owner/bookings'
        : '/api/bookings';
      const res = await fetch(url, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.bookings) {
          setBookings(data.bookings.map(normalizeBooking));
        }
      }
    } catch {
      // keep fallback
    } finally {
      setIsLoadingBookings(false);
    }
  }, [currentUser, primaryRole]);

  const refreshData = useCallback(() => {
    refreshVehicles();
    if (currentUser) refreshBookings();
  }, [refreshVehicles, refreshBookings, currentUser]);

  useEffect(() => {
    refreshVehicles();
  }, [refreshVehicles]);

  useEffect(() => {
    if (currentUser) {
      refreshBookings();
    }
  }, [currentUser, refreshBookings]);

  // Vehicle Actions
  const addVehicle = async (vehicleData: any) => {
    try {
      // Map frontend model to API schema if necessary
      const payload = {
        category: (vehicleData.category || 'CAR').toUpperCase(),
        make: vehicleData.manufacturer || vehicleData.make || 'Hyundai',
        model: vehicleData.model || 'i20',
        registrationNumber: vehicleData.registrationNumber || `KA-01-VL-${Math.floor(1000 + Math.random() * 9000)}`,
        manufacturingYear: Number(vehicleData.year || vehicleData.manufacturingYear || 2023),
        fuelType: (vehicleData.fuelType || 'PETROL').toUpperCase(),
        transmission: (vehicleData.transmission || 'MANUAL').toUpperCase(),
        seatingCapacity: Number(vehicleData.seatingCapacity || 5),
        description: vehicleData.description || 'Quality vehicle',
        location: vehicleData.location || 'Bengaluru',
        dailyRentalPrice: Number(vehicleData.dailyRate || vehicleData.dailyRentalPrice || 1500),
        driverCharge: vehicleData.driverChargePerDay ? Number(vehicleData.driverChargePerDay) : null,
        selfDriveEnabled: vehicleData.supportedModes?.includes('self-drive') ?? true,
        chauffeurEnabled: vehicleData.supportedModes?.includes('with-driver') ?? false,
        images: Array.isArray(vehicleData.images)
          ? vehicleData.images.map((img: string) => ({ imageUrl: img, imageType: 'COVER' }))
          : [],
      };

      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        addNotification('info', `Listing submitted for review. Pending administrator approval.`);
        await refreshVehicles();
        return { success: true };
      }
      return { success: false, error: data.error || 'Failed to create listing' };
    } catch {
      // Fallback local update
      const newV = normalizeVehicle({ ...vehicleData, id: `veh-${Date.now()}`, approvalStatus: 'pending' });
      setVehicles((prev) => [newV, ...prev]);
      addNotification('info', `Listing submitted for review.`);
      return { success: true };
    }
  };

  const updateVehicleApproval = async (id: string, statusOrAction: ApprovalStatus | 'approve' | 'reject', reason?: string) => {
    const action = statusOrAction === 'approved' || statusOrAction === 'approve' ? 'approve' : 'reject';
    try {
      const url = `/api/admin/vehicles/${id}/${action}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
        credentials: 'include',
      });
      if (res.ok) {
        await refreshVehicles();
        addNotification(action === 'approve' ? 'success' : 'info', `Vehicle listing ${action === 'approve' ? 'approved' : 'rejected'}.`);
        return;
      }
    } catch {
      // ignore
    }
    // Optimistic fallback
    setVehicles((prev) =>
      prev.map((v) => (v.id === id ? { ...v, approvalStatus: action === 'approve' ? 'approved' : 'rejected', rejectionReason: reason } : v))
    );
    addNotification('info', `Vehicle status updated.`);
  };

  const toggleVehicleActive = async (id: string) => {
    const target = vehicles.find((v) => v.id === id);
    const newStatus = target?.isActive ? 'INACTIVE' : 'AVAILABLE';
    try {
      await fetch(`/api/vehicles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availabilityStatus: newStatus }),
        credentials: 'include',
      });
    } catch {
      // ignore
    }
    setVehicles((prev) =>
      prev.map((v) => (v.id === id ? { ...v, isActive: !v.isActive, isAvailable: !v.isAvailable } : v))
    );
    addNotification('info', `Listing visibility toggled.`);
  };

  // Booking Actions
  const createBooking = async (bookingData: any) => {
    try {
      const payload = {
        vehicleId: bookingData.vehicleId,
        rentalType: (bookingData.rentalType || 'self-drive').toUpperCase().replace('-', '_'),
        pickupDateTime: bookingData.startDate ? new Date(bookingData.startDate).toISOString() : new Date().toISOString(),
        returnDateTime: bookingData.endDate ? new Date(bookingData.endDate).toISOString() : new Date(Date.now() + 86400000).toISOString(),
        pickupLocation: bookingData.pickupLocation || 'Bengaluru',
        dropLocation: bookingData.dropLocation || 'Bengaluru',
      };

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.booking) {
        await refreshBookings();
        addNotification('success', 'Booking request submitted to vehicle partner.');
        return { success: true, booking: normalizeBooking(data.booking) };
      }
      return { success: false, error: data.error || 'Failed to create booking.' };
    } catch {
      // Local optimistic fallback
      const newBk = normalizeBooking({ ...bookingData, id: `bk-${Date.now()}`, status: 'requested' });
      setBookings((prev) => [newBk, ...prev]);
      addNotification('success', 'Booking request submitted.');
      return { success: true, booking: newBk };
    }
  };

  const updateBookingStatus = async (
    id: string,
    actionOrStatus: BookingStatus | 'accept' | 'reject' | 'cancel' | 'simulate-payment',
    payment?: SimulatedPayment,
    reason?: string
  ) => {
    let endpoint = 'cancel';
    if (actionOrStatus === 'awaiting_payment' || actionOrStatus === 'accept') endpoint = 'accept';
    else if (actionOrStatus === 'rejected' || actionOrStatus === 'reject') endpoint = 'reject';
    else if (actionOrStatus === 'confirmed' || actionOrStatus === 'simulate-payment') endpoint = 'simulate-payment';
    else if (actionOrStatus === 'cancelled' || actionOrStatus === 'cancel') endpoint = 'cancel';

    try {
      const res = await fetch(`/api/bookings/${id}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, paymentMethod: payment?.method || 'UPI' }),
        credentials: 'include',
      });
      if (res.ok) {
        await refreshBookings();
        addNotification('success', `Booking updated.`);
        return;
      }
    } catch {
      // ignore
    }

    // Local optimistic fallback
    const targetStatus: BookingStatus =
      endpoint === 'accept' ? 'awaiting_payment'
      : endpoint === 'simulate-payment' ? 'confirmed'
      : endpoint === 'reject' ? 'rejected'
      : 'cancelled';

    setBookings((prev) =>
      prev.map((b) =>
        b.id === id
          ? {
              ...b,
              status: targetStatus,
              paymentSimulated:
                endpoint === 'simulate-payment'
                  ? payment || {
                      paidAt: new Date().toISOString(),
                      method: 'UPI',
                      transactionId: `TXN-VL-${Math.floor(10000 + Math.random() * 90000)}`,
                      amount: b.totalAmount,
                      status: 'simulated_success',
                    }
                  : b.paymentSimulated,
              rejectionReason: reason,
            }
          : b
      )
    );
    addNotification('info', `Booking status updated to ${targetStatus}.`);
  };

  const resetAllDemoData = async () => {
    try {
      await fetch('/api/admin/reset', { method: 'POST', credentials: 'include' });
    } catch {
      // ignore
    }
    setVehicles(INITIAL_VEHICLES.map(normalizeVehicle));
    setBookings(INITIAL_BOOKINGS.map(normalizeBooking));
    addNotification('success', 'Factory demo data restored successfully.');
  };

  const approvedVehicles = vehicles.filter(
    (v) => (v.approvalStatus === 'approved' || (v.approvalStatus as string) === 'APPROVED') && v.isActive
  );

  return (
    <MarketplaceContext.Provider
      value={{
        vehicles,
        approvedVehicles,
        bookings,
        notifications,
        addNotification,
        removeNotification,
        refreshData,
        refreshVehicles,
        refreshBookings,
        addVehicle,
        updateVehicleApproval,
        toggleVehicleActive,
        createBooking,
        updateBookingStatus,
        resetAllDemoData,
        isLoadingVehicles,
        isLoadingBookings,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
};

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
};
