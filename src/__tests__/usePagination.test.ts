import { usePagination } from '@/hooks/usePagination';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('usePagination', () => {
  const mockItems = Array.from({ length: 25 }, (_, i) => ({
    id: i + 1,
    name: `Item ${i + 1}`,
  }));

  it('should return initial page and items', () => {
    const { result } = renderHook(() => usePagination(mockItems));

    expect(result.current.currentPage).toBe(1);
    expect(result.current.pageSize).toBe(10);
    expect(result.current.totalItems).toBe(25);
    expect(result.current.totalPages).toBe(3);
    expect(result.current.currentItems).toHaveLength(10);
  });

  it('should paginate correctly', () => {
    const { result } = renderHook(() =>
      usePagination(mockItems, { initialPageSize: 10 })
    );

    // First page
    expect(result.current.currentItems[0].id).toBe(1);
    expect(result.current.currentItems[9].id).toBe(10);

    // Go to page 2
    act(() => {
      result.current.goToPage(2);
    });

    expect(result.current.currentPage).toBe(2);
    expect(result.current.currentItems[0].id).toBe(11);
    expect(result.current.currentItems[9].id).toBe(20);
  });

  it('should handle next and previous page', () => {
    const { result } = renderHook(() => usePagination(mockItems));

    expect(result.current.hasPrevPage).toBe(false);
    expect(result.current.hasNextPage).toBe(true);

    act(() => {
      result.current.nextPage();
    });

    expect(result.current.currentPage).toBe(2);
    expect(result.current.hasPrevPage).toBe(true);
    expect(result.current.hasNextPage).toBe(true);

    act(() => {
      result.current.prevPage();
    });

    expect(result.current.currentPage).toBe(1);
  });

  it('should not go below page 1', () => {
    const { result } = renderHook(() => usePagination(mockItems));

    act(() => {
      result.current.prevPage();
    });

    expect(result.current.currentPage).toBe(1);
  });

  it('should not go above total pages', () => {
    const { result } = renderHook(() => usePagination(mockItems));

    act(() => {
      result.current.goToPage(10); // More than total pages
    });

    expect(result.current.currentPage).toBe(3); // Should be capped at 3
  });

  it('should change page size and reset to page 1', () => {
    const { result } = renderHook(() => usePagination(mockItems));

    act(() => {
      result.current.goToPage(2);
    });
    expect(result.current.currentPage).toBe(2);

    act(() => {
      result.current.setPageSize(5);
    });

    expect(result.current.currentPage).toBe(1); // Should reset to page 1
    expect(result.current.pageSize).toBe(5);
    expect(result.current.totalPages).toBe(5);
    expect(result.current.currentItems).toHaveLength(5);
  });

  it('should calculate startIndex and endIndex correctly', () => {
    const { result } = renderHook(() =>
      usePagination(mockItems, { initialPageSize: 10 })
    );

    expect(result.current.startIndex).toBe(1);
    expect(result.current.endIndex).toBe(10);

    act(() => {
      result.current.goToPage(3);
    });

    expect(result.current.startIndex).toBe(21);
    expect(result.current.endIndex).toBe(25); // Last page has only 5 items
  });

  it('should handle empty array', () => {
    const { result } = renderHook(() => usePagination([]));

    expect(result.current.currentItems).toHaveLength(0);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.totalPages).toBe(0);
    expect(result.current.startIndex).toBe(0);
    expect(result.current.endIndex).toBe(0);
  });

  it('should provide pageSizeOptions', () => {
    const { result } = renderHook(() =>
      usePagination(mockItems, { pageSizeOptions: [5, 10, 25, 50] })
    );

    expect(result.current.pageSizeOptions).toEqual([5, 10, 25, 50]);
  });

  it('should respect initialPage option', () => {
    const { result } = renderHook(() =>
      usePagination(mockItems, { initialPage: 2, initialPageSize: 10 })
    );

    expect(result.current.currentPage).toBe(2);
    expect(result.current.currentItems[0].id).toBe(11);
  });
});
