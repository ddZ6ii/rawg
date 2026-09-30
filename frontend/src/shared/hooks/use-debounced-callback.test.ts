import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useDebouncedCallback } from './use-debounced-callback'

const DEBOUNCE_DELAY_MS = 200

beforeEach(() => {
  vi.useFakeTimers()
})
afterEach(() => {
  vi.useRealTimers()
})

describe('useDebouncedCallback', () => {
  it('calls cb once after delay with the latest args', () => {
    const cb = vi.fn()
    const { result } = renderHook(() =>
      useDebouncedCallback(cb, DEBOUNCE_DELAY_MS),
    )

    result.current('first')
    result.current('second')
    expect(cb).not.toHaveBeenCalled()

    vi.advanceTimersByTime(DEBOUNCE_DELAY_MS)
    expect(cb).toHaveBeenCalledOnce()
    expect(cb).toHaveBeenCalledWith('second')
  })

  it('returns a stable function across renders', () => {
    const { result, rerender } = renderHook(
      ({ cb }) => useDebouncedCallback(cb, DEBOUNCE_DELAY_MS),
      { initialProps: { cb: vi.fn() } },
    )
    const first = result.current

    rerender({ cb: vi.fn() })

    expect(result.current).toBe(first)
  })

  it('invokes the latest cb passed in', () => {
    const staleCb = vi.fn()
    const latestCb = vi.fn()
    const { result, rerender } = renderHook(
      ({ cb }) => useDebouncedCallback(cb, DEBOUNCE_DELAY_MS),
      { initialProps: { cb: staleCb } },
    )

    result.current()
    rerender({ cb: latestCb })
    vi.advanceTimersByTime(DEBOUNCE_DELAY_MS)

    expect(staleCb).not.toHaveBeenCalled()
    expect(latestCb).toHaveBeenCalledOnce()
  })

  it('cancels the pending call on unmount', () => {
    const cb = vi.fn()
    const { result, unmount } = renderHook(() =>
      useDebouncedCallback(cb, DEBOUNCE_DELAY_MS),
    )

    result.current()
    unmount()
    vi.advanceTimersByTime(DEBOUNCE_DELAY_MS)

    expect(cb).not.toHaveBeenCalled()
  })
})
