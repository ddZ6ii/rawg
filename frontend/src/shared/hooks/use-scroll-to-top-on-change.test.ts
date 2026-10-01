import { renderHook } from '@testing-library/react'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type MockInstance,
  vi,
} from 'vitest'

import { useScrollToTopOnChange } from './use-scroll-to-top-on-change'

describe('useScrollToTopOnChange', () => {
  let scrollTo: MockInstance<typeof window.scrollTo>

  beforeEach(() => {
    scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(vi.fn())
  })

  afterEach(() => {
    scrollTo.mockRestore()
  })

  it('does not scroll on mount', () => {
    renderHook(() => {
      useScrollToTopOnChange('a')
    })

    expect(scrollTo).not.toHaveBeenCalled()
  })

  it('scrolls to the top when the value changes', () => {
    const { rerender } = renderHook(
      ({ value }) => {
        useScrollToTopOnChange(value)
      },
      { initialProps: { value: 'a' } },
    )

    rerender({ value: 'b' })

    expect(scrollTo).toHaveBeenCalledOnce()
    expect(scrollTo).toHaveBeenCalledWith({ top: 0 })
  })

  it('does not scroll when rerendered with the same value', () => {
    const { rerender } = renderHook(
      ({ value }) => {
        useScrollToTopOnChange(value)
      },
      { initialProps: { value: 'a' } },
    )

    rerender({ value: 'a' })

    expect(scrollTo).not.toHaveBeenCalled()
  })
})
