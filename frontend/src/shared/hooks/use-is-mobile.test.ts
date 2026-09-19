import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useIsMobile } from '@/shared/hooks/use-is-mobile'

// Factory to create a controllable mock for each test
function makeMql(matches: boolean) {
  const listeners = new Map<string, EventListener>()
  const mql = {
    matches,
    media: '',
    onchange: null,
    addEventListener: vi.fn((event: string, cb: EventListener) => {
      listeners.set(event, cb)
    }),
    removeEventListener: vi.fn((event: string) => {
      listeners.delete(event)
    }),
    dispatchEvent: vi.fn(),
    fire() {
      mql.matches = !mql.matches
      listeners.get('change')?.({} as Event)
    },
  }
  return mql
}

describe('useIsMobile', () => {
  let mql: ReturnType<typeof makeMql>
  let matchMediaMock: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    mql = makeMql(false)
    matchMediaMock = vi
      .spyOn(window, 'matchMedia')
      .mockReturnValue(mql as unknown as MediaQueryList)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns false when viewport is above breakpoint', () => {
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
  })

  it('returns true when matchMedia initially matches', () => {
    mql = makeMql(true)
    vi.spyOn(window, 'matchMedia').mockReturnValue(
      mql as unknown as MediaQueryList,
    )
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
  })

  it('updates to true when media query fires', () => {
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
    act(() => {
      mql.fire()
    })
    expect(result.current).toBe(true)
  })

  it('updates to false when media query fires again', () => {
    mql = makeMql(true)
    vi.spyOn(window, 'matchMedia').mockReturnValue(
      mql as unknown as MediaQueryList,
    )
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
    act(() => {
      mql.fire()
    })
    expect(result.current).toBe(false)
  })

  it('removes event listener on unmount', () => {
    const { unmount } = renderHook(() => useIsMobile())
    unmount()
    expect(mql.removeEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function),
    )
  })

  it('uses custom breakpoint', () => {
    renderHook(() => useIsMobile(768))
    expect(matchMediaMock).toHaveBeenCalledWith('screen and (max-width: 767px)')
  })

  it('re-subscribes when breakpoint changes', () => {
    const { rerender } = renderHook(({ bp }) => useIsMobile(bp), {
      initialProps: { bp: 1024 },
    })
    rerender({ bp: 768 })
    expect(matchMediaMock).toHaveBeenCalledWith('screen and (max-width: 767px)')
    expect(mql.removeEventListener).toHaveBeenCalled()
  })
})
