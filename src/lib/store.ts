'use client';
import { create } from 'zustand';
import { User } from '@/types';

interface AuthState {
  userData: User | null;
  loading: boolean;
  initialized: boolean;
  setUserData: (data: User | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  userData: null,
  loading: true,
  initialized: false,
  setUserData: (data) => set({ userData: data }),
  setLoading: (loading) => set({ loading }),
  setInitialized: (initialized) => set({ initialized }),
  reset: () => set({ userData: null, loading: false }),
}));

interface AppState {
  sidebarOpen: boolean;
  darkMode: boolean;
  globalSearch: string;
  toggleSidebar: () => void;
  toggleDarkMode: () => void;
  setGlobalSearch: (q: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true,
  darkMode: false,
  globalSearch: '',
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
  setGlobalSearch: (q) => set({ globalSearch: q }),
}));
