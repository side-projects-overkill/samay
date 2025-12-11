// frontend/src/stores/authStore.ts
// Authentication store with role-based access control - Connected to backend

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
  validateToken: () => Promise<void>;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
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
        // Call logout endpoint (fire and forget)
        const token = get().token;
        if (token) {
          fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          }).catch(() => {});
        }
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      clearError: () => set({ error: null }),

      setUser: (user: User) => set({ 
        user, 
        isAuthenticated: true,
        // Generate a temporary token for demo mode
        token: btoa(JSON.stringify({ 
          userId: user.id, 
          email: user.email, 
          role: user.role,
          exp: Date.now() + 24 * 60 * 60 * 1000 
        })),
      }),

      validateToken: async () => {
        const token = get().token;
        if (!token) {
          set({ user: null, isAuthenticated: false });
          return;
        }

        try {
          const response = await fetch(`${API_URL}/auth/validate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
          });

          if (!response.ok) {
            throw new Error('Token invalid');
          }

          const user = await response.json();
          set({ user, isAuthenticated: true });
        } catch {
          // Token is invalid, clear auth state
          set({ user: null, token: null, isAuthenticated: false });
        }
      },
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

