import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '@/store/authStore';

// Mock fetch
global.fetch = vi.fn();

describe('AuthStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have null user initially', () => {
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('login', () => {
    it('should set loading state when logging in', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: {
              accessToken: 'test-token',
              expiresAt: Date.now() + 3600000,
              user: {
                id: '1',
                username: 'admin',
                role: 'ADMIN',
                name: 'Admin',
              },
            },
          }),
      });

      const loginPromise = useAuthStore
        .getState()
        .login({ username: 'admin', password: 'admin123' });

      // Check loading state is set
      expect(useAuthStore.getState().isLoading).toBe(true);

      await loginPromise;

      // After login completes
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('should set user and token on successful login', async () => {
      const mockUser = {
        id: '1',
        username: 'admin',
        role: 'ADMIN',
        name: 'Admin',
      };
      const mockAuthData = {
        accessToken: 'test-token-123',
        expiresAt: Date.now() + 3600000,
        user: mockUser,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: mockAuthData,
          }),
      });

      const result = await useAuthStore
        .getState()
        .login({ username: 'admin', password: 'admin123' });

      expect(result).toBe(true);
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.token).toEqual(mockAuthData);
      expect(state.user).toEqual(mockUser);
      expect(state.error).toBeNull();
    });

    it('should set error on failed login', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: () =>
          Promise.resolve({
            success: false,
            message: 'Invalid credentials',
          }),
      });

      const result = await useAuthStore
        .getState()
        .login({ username: 'wrong', password: 'credentials' });

      expect(result).toBe(false);
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.error).toBe('Invalid credentials');
    });

    it('should handle network errors gracefully', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const result = await useAuthStore
        .getState()
        .login({ username: 'admin', password: 'admin123' });

      expect(result).toBe(false);
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBe('Terjadi kesalahan jaringan');
    });
  });

  describe('logout', () => {
    it('should clear user state on logout', async () => {
      // First set up authenticated state
      useAuthStore.setState({
        user: {
          id: '1',
          username: 'admin',
          role: 'ADMIN',
          name: 'Admin',
        } as any,
        token: {
          accessToken: 'test-token',
          expiresAt: Date.now() + 3600000,
        } as any,
        isAuthenticated: true,
      });

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      await useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('clearError', () => {
    it('should clear error state', () => {
      useAuthStore.setState({ error: 'Some error' });

      useAuthStore.getState().clearError();

      expect(useAuthStore.getState().error).toBeNull();
    });
  });
});
