import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useDebounce } from '@/hooks/useDebounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500))
    expect(result.current).toBe('initial')
  })

  it('should debounce value updates', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    )

    // Initial value
    expect(result.current).toBe('initial')

    // Update value
    rerender({ value: 'updated' })
    
    // Value should not change immediately
    expect(result.current).toBe('initial')

    // Fast forward 250ms (half the delay)
    act(() => {
      vi.advanceTimersByTime(250)
    })
    expect(result.current).toBe('initial')

    // Fast forward remaining 250ms
    act(() => {
      vi.advanceTimersByTime(250)
    })
    expect(result.current).toBe('updated')
  })

  it('should reset timer on new value', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    )

    rerender({ value: 'first' })
    
    act(() => {
      vi.advanceTimersByTime(300)
    })
    
    // Update again before timer expires
    rerender({ value: 'second' })
    
    act(() => {
      vi.advanceTimersByTime(300)
    })
    
    // Still should be initial because timer was reset
    expect(result.current).toBe('initial')
    
    act(() => {
      vi.advanceTimersByTime(200)
    })
    
    // Now should be 'second'
    expect(result.current).toBe('second')
  })

  it('should use default delay of 500ms', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      { initialProps: { value: 'initial' } }
    )

    rerender({ value: 'updated' })
    
    act(() => {
      vi.advanceTimersByTime(499)
    })
    expect(result.current).toBe('initial')
    
    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(result.current).toBe('updated')
  })

  it('should work with different types', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 100),
      { initialProps: { value: 0 } }
    )

    expect(result.current).toBe(0)

    rerender({ value: 42 })
    
    act(() => {
      vi.advanceTimersByTime(100)
    })
    
    expect(result.current).toBe(42)
  })
})
