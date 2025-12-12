import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthToken, User, LoginCredentials } from '@/types';

interface AuthState {
  token: AuthToken | null;
  user: Omit<User, 'password'> | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
  checkAuth: () => boolean;
}

const STORAGE_KEY = 'brilife_auth';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
          });

          const data = await response.json();

          if (!response.ok || !data.success) {
            set({
              isLoading: false,
              error: data.message || 'Login gagal',
              isAuthenticated: false,
            });
            return false;
          }

          const authToken: AuthToken = data.data;

          set({
            token: authToken,
            user: authToken.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return true;
        } catch (error) {
          set({
            isLoading: false,
            error: 'Terjadi kesalahan jaringan',
            isAuthenticated: false,
          });
          return false;
        }
      },

      logout: async () => {
        set({ isLoading: true });

        try {
          await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${get().token?.accessToken}`,
            },
          });
        } catch {
          // Ignore logout errors
        } finally {
          set({
            token: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      checkAuth: () => {
        const { token } = get();
        if (!token) return false;

        // Check if token is expired
        if (token.expiresAt < Date.now()) {
          set({
            token: null,
            user: null,
            isAuthenticated: false,
          });
          return false;
        }

        return true;
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Helper hook to get auth header
export const useAuthHeader = () => {
  const token = useAuthStore((state) => state.token);
  return token ? { Authorization: `Bearer ${token.accessToken}` } : {};
};
