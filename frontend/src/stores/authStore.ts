// frontend/src/stores/authStore.ts
// Authentication store with role-based access control

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'ASSOCIATE' | 'MANAGER' | 'SUPERADMIN';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  teamId?: string;
  teamName?: string;
  managerId?: string;
  managerName?: string;
  avatarUrl?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  setUser: (user: User) => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Invalid credentials');
          }

          const data = await response.json();
          
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Login failed',
          });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      clearError: () => set({ error: null }),

      setUser: (user: User) => set({ user, isAuthenticated: true }),
    }),
    {
      name: 'samay-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Demo users for development (remove in production)
export const DEMO_USERS: Record<string, User> = {
  'associate@samay.io': {
    id: 'usr-001',
    email: 'associate@samay.io',
    firstName: 'Alex',
    lastName: 'Johnson',
    role: 'ASSOCIATE',
    teamId: 'team-001',
    teamName: 'Morning Crew',
    managerId: 'usr-002',
    managerName: 'Sarah Miller',
  },
  'manager@samay.io': {
    id: 'usr-002',
    email: 'manager@samay.io',
    firstName: 'Sarah',
    lastName: 'Miller',
    role: 'MANAGER',
    teamId: 'team-001',
    teamName: 'Morning Crew',
  },
  'admin@samay.io': {
    id: 'usr-003',
    email: 'admin@samay.io',
    firstName: 'Admin',
    lastName: 'User',
    role: 'SUPERADMIN',
  },
};

