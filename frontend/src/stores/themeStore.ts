// frontend/src/stores/themeStore.ts
// Theme store for light/dark mode

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      
      setTheme: (theme: Theme) => {
        set({ theme });
        updateDocumentTheme(theme);
      },
      
      toggleTheme: () => {
        const newTheme = get().theme === 'dark' ? 'light' : 'dark';
        set({ theme: newTheme });
        updateDocumentTheme(newTheme);
      },
    }),
    {
      name: 'samay-theme',
      onRehydrateStorage: () => (state) => {
        // Apply theme on app load
        if (state?.theme) {
          updateDocumentTheme(state.theme);
        }
      },
    }
  )
);

// Apply theme class to document
function updateDocumentTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.add('light');
    root.classList.remove('dark');
  }
}

// Initialize theme on module load
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('samay-theme');
  if (stored) {
    try {
      const { state } = JSON.parse(stored);
      updateDocumentTheme(state.theme || 'dark');
    } catch {
      updateDocumentTheme('dark');
    }
  }
}

