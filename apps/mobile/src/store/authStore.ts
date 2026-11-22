import { create } from 'zustand';
import { UserProfile, UserRoleType } from '@vahanloop/shared';
import { apiClient, setStoredToken, removeStoredToken, getStoredToken } from '../api/client';

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  activeRole: UserRoleType;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  loadSession: () => Promise<void>;
  login: (email: string, password?: string) => Promise<boolean>;
  loginDemo: (role: 'customer' | 'owner' | 'driver') => Promise<boolean>;
  register: (payload: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    role: 'CUSTOMER' | 'OWNER';
    ownerType?: 'INDIVIDUAL' | 'BUSINESS';
    businessName?: string;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  switchRole: (role: UserRoleType) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  activeRole: 'CUSTOMER',
  isLoading: false,
  isInitialized: false,
  error: null,

  loadSession: async () => {
    set({ isLoading: true });
    try {
      const token = await getStoredToken();
      if (!token) {
        set({ isInitialized: true, isLoading: false, user: null, token: null });
        return;
      }

      const res = await apiClient<{ user: UserProfile }>('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res?.user) {
        const primaryRole: UserRoleType = res.user.roles?.includes('OWNER')
          ? 'OWNER'
          : res.user.roles?.includes('DRIVER')
          ? 'DRIVER'
          : 'CUSTOMER';

        set({
          user: res.user,
          token,
          activeRole: primaryRole,
          isInitialized: true,
          isLoading: false,
        });
      } else {
        await removeStoredToken();
        set({ user: null, token: null, isInitialized: true, isLoading: false });
      }
    } catch {
      await removeStoredToken();
      set({ user: null, token: null, isInitialized: true, isLoading: false });
    }
  },

  login: async (email: string, password = 'Demo@123456') => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient<{ token?: string; user: UserProfile; message?: string }>(
        '/api/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
        }
      );

      if (res?.user) {
        const token = res.token || `fallback_jwt_${res.user.id}`;
        await setStoredToken(token);

        const primaryRole: UserRoleType = res.user.roles?.includes('OWNER')
          ? 'OWNER'
          : res.user.roles?.includes('DRIVER')
          ? 'DRIVER'
          : 'CUSTOMER';

        set({
          user: res.user,
          token,
          activeRole: primaryRole,
          isLoading: false,
          error: null,
        });
        return true;
      }
      set({ isLoading: false, error: 'Login failed' });
      return false;
    } catch (err: any) {
      set({ isLoading: false, error: err?.message || 'Login failed. Please check credentials.' });
      return false;
    }
  },

  loginDemo: async (role: 'customer' | 'owner' | 'driver') => {
    const emailMap = {
      customer: 'customer@vahanloop.demo',
      owner: 'owner@vahanloop.demo',
      driver: 'customer@vahanloop.demo', // drivers authenticated in platform
    };
    return get().login(emailMap[role], 'Demo@123456');
  },

  register: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient<{ token?: string; user: UserProfile }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res?.user) {
        const token = res.token || `fallback_jwt_${res.user.id}`;
        await setStoredToken(token);

        set({
          user: res.user,
          token,
          activeRole: payload.role,
          isLoading: false,
          error: null,
        });
        return true;
      }
      set({ isLoading: false, error: 'Registration failed' });
      return false;
    } catch (err: any) {
      set({ isLoading: false, error: err?.message || 'Registration failed' });
      return false;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await apiClient('/api/auth/logout', { method: 'POST' }).catch(() => {});
    } finally {
      await removeStoredToken();
      set({
        user: null,
        token: null,
        activeRole: 'CUSTOMER',
        isLoading: false,
        error: null,
      });
    }
  },

  switchRole: (role: UserRoleType) => {
    set({ activeRole: role });
  },

  clearError: () => {
    set({ error: null });
  },
}));
