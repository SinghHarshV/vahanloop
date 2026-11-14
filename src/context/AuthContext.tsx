'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User, UserRole } from '@/types';

// API-backed user shape (matches /api/auth/me response)
export interface ApiUser {
  id: string;
  fullName: string;
  name?: string; // legacy alias
  email: string;
  phone: string;
  roles: string[]; // ['CUSTOMER'] | ['OWNER','CUSTOMER'] | ['ADMIN']
  role?: UserRole; // legacy alias
  accountStatus: string;
  ownerProfileId?: string;
  joinedDate?: string;
}

export type PrimaryRole = 'customer' | 'owner' | 'admin';

function getPrimaryRole(user: ApiUser): PrimaryRole {
  if (user.roles?.includes('ADMIN') || (user.role as string) === 'admin') return 'admin';
  if (user.roles?.includes('OWNER') || (user.role as string) === 'owner') return 'owner';
  return 'customer';
}

function normalizeUser(u: any): ApiUser {
  if (!u) return u;
  const fullName = u.fullName || u.name || 'User';
  const roles = u.roles || (u.role ? [u.role.toUpperCase()] : ['CUSTOMER']);
  const primaryRole: UserRole = roles.includes('ADMIN') ? 'admin' : roles.includes('OWNER') ? 'owner' : 'customer';
  return {
    ...u,
    fullName,
    name: fullName,
    roles,
    role: primaryRole,
    phone: u.phone || '',
    joinedDate: u.createdAt || u.joinedDate || '2024-01-01',
  };
}

interface AuthContextType {
  currentUser: ApiUser | null;
  primaryRole: PrimaryRole | null;
  availableUsers: ApiUser[];
  isLoaded: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  checkAuth: () => Promise<void>;
  switchRole: (role: UserRole) => Promise<void>;
  hasRole: (role: string) => boolean;
}

export interface RegisterData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: 'customer' | 'owner';
  ownerType?: 'INDIVIDUAL' | 'BUSINESS';
  businessName?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<ApiUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(normalizeUser(data.user));
      } else {
        setCurrentUser(null);
      }
    } catch {
      setCurrentUser(null);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, password: string = 'Demo@123456') => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setCurrentUser(normalizeUser(data.user));
        return { success: true };
      }
      return { success: false, error: data.error || 'Login failed' };
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } finally {
      setCurrentUser(null);
      setIsLoading(false);
      router.push('/login');
    }
  };

  const switchRole = async (role: UserRole) => {
    const emailMap: Record<UserRole, string> = {
      customer: 'customer@vahanloop.demo',
      owner: 'owner@vahanloop.demo',
      admin: 'admin@vahanloop.demo',
    };
    await login(emailMap[role]);
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      const result = await res.json();
      if (res.ok && result.user) {
        setCurrentUser(normalizeUser(result.user));
        return { success: true };
      }
      return { success: false, error: result.error || 'Registration failed' };
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const hasRole = (role: string) => {
    if (!currentUser) return false;
    return currentUser.roles?.includes(role.toUpperCase()) || currentUser.role === role.toLowerCase();
  };

  const primaryRole = currentUser ? getPrimaryRole(currentUser) : null;

  const availableUsers: ApiUser[] = [
    {
      id: 'usr-customer-1',
      fullName: 'Rahul Sharma',
      name: 'Rahul Sharma',
      email: 'customer@vahanloop.demo',
      phone: '+919876543210',
      roles: ['CUSTOMER'],
      role: 'customer',
      accountStatus: 'ACTIVE',
    },
    {
      id: 'usr-owner-1',
      fullName: 'Vikramaditya Verma',
      name: 'Vikramaditya Verma',
      email: 'owner@vahanloop.demo',
      phone: '+919123456789',
      roles: ['OWNER', 'CUSTOMER'],
      role: 'owner',
      accountStatus: 'ACTIVE',
    },
    {
      id: 'usr-admin-1',
      fullName: 'Priya Deshmukh',
      name: 'Priya Deshmukh',
      email: 'admin@vahanloop.demo',
      phone: '+919988776655',
      roles: ['ADMIN'],
      role: 'admin',
      accountStatus: 'ACTIVE',
    },
  ];

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        primaryRole,
        availableUsers,
        isLoaded,
        isLoading,
        login,
        logout,
        register,
        checkAuth,
        switchRole,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
