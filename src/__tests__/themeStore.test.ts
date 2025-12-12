import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useThemeStore } from '@/store/themeStore';

describe('ThemeStore', () => {
  beforeEach(() => {
    // Reset store state
    useThemeStore.setState({
      theme: 'system',
      resolvedTheme: 'light',
    });
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have system theme by default', () => {
      const state = useThemeStore.getState();
      expect(state.theme).toBe('system');
    });
  });

  describe('setTheme', () => {
    it('should set theme to dark', () => {
      useThemeStore.getState().setTheme('dark');

      const state = useThemeStore.getState();
      expect(state.theme).toBe('dark');
      expect(state.resolvedTheme).toBe('dark');
    });

    it('should set theme to light', () => {
      useThemeStore.getState().setTheme('light');

      const state = useThemeStore.getState();
      expect(state.theme).toBe('light');
      expect(state.resolvedTheme).toBe('light');
    });

    it('should set theme to system and resolve based on preference', () => {
      // Mock prefers-color-scheme: dark
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }));

      useThemeStore.getState().setTheme('system');

      expect(useThemeStore.getState().theme).toBe('system');
    });

    it('should update DOM when changing theme', () => {
      // Spy on document.documentElement.classList
      const addSpy = vi.spyOn(document.documentElement.classList, 'add');
      const removeSpy = vi.spyOn(document.documentElement.classList, 'remove');

      useThemeStore.getState().setTheme('dark');

      expect(removeSpy).toHaveBeenCalledWith('light', 'dark');
      expect(addSpy).toHaveBeenCalledWith('dark');
    });

    it('should handle light theme correctly', () => {
      const addSpy = vi.spyOn(document.documentElement.classList, 'add');

      useThemeStore.getState().setTheme('light');

      expect(addSpy).toHaveBeenCalledWith('light');
    });
  });
});
