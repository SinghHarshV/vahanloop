import { Vehicle, Booking, User, ApprovalStatus, BookingStatus, SimulatedPayment } from '@/types';
import { DEMO_USERS, INITIAL_VEHICLES, INITIAL_BOOKINGS } from '@/data/seedData';

const STORAGE_KEYS = {
  USERS: 'vahanloop_users',
  CURRENT_USER: 'vahanloop_current_user',
  VEHICLES: 'vahanloop_vehicles',
  BOOKINGS: 'vahanloop_bookings',
};

function isClient(): boolean {
  return typeof window !== 'undefined';
}

export const storageService = {
  // Initialize storage on client boot
  init(): void {
    if (!isClient()) return;

    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEMO_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      // Default to customer role
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(DEMO_USERS[0]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.VEHICLES)) {
      localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(INITIAL_VEHICLES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(INITIAL_BOOKINGS));
    }
  },

  // Reset to factory seed data
  resetDemoData(): void {
    if (!isClient()) return;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEMO_USERS));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(DEMO_USERS[0]));
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(INITIAL_VEHICLES));
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(INITIAL_BOOKINGS));
  },

  // Users
  getUsers(): User[] {
    if (!isClient()) return DEMO_USERS;
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    return raw ? JSON.parse(raw) : DEMO_USERS;
  },

  getCurrentUser(): User {
    if (!isClient()) return DEMO_USERS[0];
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return raw ? JSON.parse(raw) : DEMO_USERS[0];
  },

  setCurrentUser(user: User): void {
    if (!isClient()) return;
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  },

  // Vehicles
  getVehicles(): Vehicle[] {
    if (!isClient()) return INITIAL_VEHICLES;
    const raw = localStorage.getItem(STORAGE_KEYS.VEHICLES);
    return raw ? JSON.parse(raw) : INITIAL_VEHICLES;
  },

  getApprovedVehicles(): Vehicle[] {
    const list = this.getVehicles();
    return list.filter((v) => v.approvalStatus === 'approved' && v.isActive);
  },

  getVehicleById(id: string): Vehicle | undefined {
    const list = this.getVehicles();
    return list.find((v) => v.id === id);
  },

  saveVehicle(vehicle: Vehicle): void {
    if (!isClient()) return;
    const list = this.getVehicles();
    const idx = list.findIndex((v) => v.id === vehicle.id);
    if (idx >= 0) {
      list[idx] = vehicle;
    } else {
      list.unshift(vehicle);
    }
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(list));
  },

  updateVehicleApproval(id: string, status: ApprovalStatus, rejectionReason?: string): void {
    if (!isClient()) return;
    const list = this.getVehicles();
    const idx = list.findIndex((v) => v.id === id);
    if (idx >= 0) {
      list[idx].approvalStatus = status;
      if (rejectionReason) {
        list[idx].rejectionReason = rejectionReason;
      }
      localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(list));
    }
  },

  toggleVehicleActive(id: string): boolean {
    if (!isClient()) return false;
    const list = this.getVehicles();
    const idx = list.findIndex((v) => v.id === id);
    if (idx >= 0) {
      list[idx].isActive = !list[idx].isActive;
      localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(list));
      return list[idx].isActive;
    }
    return false;
  },

  // Bookings
  getBookings(): Booking[] {
    if (!isClient()) return INITIAL_BOOKINGS;
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    return raw ? JSON.parse(raw) : INITIAL_BOOKINGS;
  },

  getBookingById(id: string): Booking | undefined {
    const list = this.getBookings();
    return list.find((b) => b.id === id);
  },

  checkAvailability(vehicleId: string, startDate: string, endDate: string): boolean {
    const bookings = this.getBookings().filter(
      (b) => b.vehicleId === vehicleId && (b.status === 'confirmed' || b.status === 'awaiting_payment')
    );

    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    for (const b of bookings) {
      const bStart = new Date(b.startDate).getTime();
      const bEnd = new Date(b.endDate).getTime();

      // Overlap condition
      if (start <= bEnd && end >= bStart) {
        return false;
      }
    }
    return true;
  },

  createBooking(booking: Booking): { success: boolean; error?: string } {
    if (!isClient()) return { success: false, error: 'Client only' };

    // Prevent overlapping confirmed / awaiting payment bookings
    const isAvail = this.checkAvailability(booking.vehicleId, booking.startDate, booking.endDate);
    if (!isAvail) {
      return {
        success: false,
        error: 'This vehicle is already reserved for the selected dates. Please choose another date range.',
      };
    }

    const list = this.getBookings();
    list.unshift(booking);
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(list));
    return { success: true };
  },

  updateBookingStatus(
    id: string,
    status: BookingStatus,
    paymentSimulated?: SimulatedPayment,
    rejectionReason?: string
  ): void {
    if (!isClient()) return;
    const list = this.getBookings();
    const idx = list.findIndex((b) => b.id === id);
    if (idx >= 0) {
      list[idx].status = status;
      if (paymentSimulated) {
        list[idx].paymentSimulated = paymentSimulated;
      }
      if (rejectionReason) {
        list[idx].rejectionReason = rejectionReason;
      }
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(list));
    }
  },
};
