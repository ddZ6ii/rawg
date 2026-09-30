import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { debounce } from './debounce'

const DEBOUNCE_DELAY_MS = 200
const HALF_DELAY_MS = DEBOUNCE_DELAY_MS / 2

beforeEach(() => {
  vi.useFakeTimers()
})
afterEach(() => {
  vi.useRealTimers()
})

describe('debounce', () => {
  it('calls fn after delay', () => {
    const fn = vi.fn()
    const debouncedFn = debounce(fn, DEBOUNCE_DELAY_MS)

    debouncedFn()
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(DEBOUNCE_DELAY_MS)
    expect(fn).toHaveBeenCalledOnce()
  })

  it('resets timer on each call, only fires once', () => {
    const fn = vi.fn()
    const debouncedFn = debounce(fn, DEBOUNCE_DELAY_MS)

    debouncedFn()
    vi.advanceTimersByTime(HALF_DELAY_MS)
    debouncedFn()
    vi.advanceTimersByTime(HALF_DELAY_MS)
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(HALF_DELAY_MS)
    expect(fn).toHaveBeenCalledOnce()
  })

  it('passes latest args to fn', () => {
    const fn = vi.fn()
    const debouncedFn = debounce(fn, DEBOUNCE_DELAY_MS)

    debouncedFn('first')
    debouncedFn('second')
    vi.advanceTimersByTime(DEBOUNCE_DELAY_MS)

    expect(fn).toHaveBeenCalledWith('second')
  })
})

describe('cancel', () => {
  it('prevents pending trailing call', () => {
    const fn = vi.fn()
    const debouncedFn = debounce(fn, DEBOUNCE_DELAY_MS)

    debouncedFn()
    debouncedFn.cancel()
    vi.advanceTimersByTime(DEBOUNCE_DELAY_MS)

    expect(fn).not.toHaveBeenCalled()
  })

  it('is safe to call when no timer is pending', () => {
    const fn = vi.fn()
    const debouncedFn = debounce(fn, DEBOUNCE_DELAY_MS)

    expect(() => {
      debouncedFn.cancel()
    }).not.toThrow()
  })

  it('allows new calls after cancellation', () => {
    const fn = vi.fn()
    const debouncedFn = debounce(fn, DEBOUNCE_DELAY_MS)

    debouncedFn()
    debouncedFn.cancel()
    debouncedFn()
    vi.advanceTimersByTime(DEBOUNCE_DELAY_MS)

    expect(fn).toHaveBeenCalledOnce()
  })
})
