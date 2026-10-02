import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useTheme } from '@/shared/hooks'

import { ThemeContextProvider } from './theme-context-provider'

const STORAGE_KEY = 'test-prefs'

function mockSystemPrefersDark(matches: boolean) {
  vi.spyOn(window, 'matchMedia').mockReturnValue({
    matches,
  } as MediaQueryList)
}

function renderUseTheme() {
  return renderHook(() => useTheme(), {
    wrapper: ({ children }) => (
      <ThemeContextProvider storageKey={STORAGE_KEY}>
        {children}
      </ThemeContextProvider>
    ),
  })
}

describe('ThemeContextProvider', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it.each([
    { systemPrefersDark: true, expected: 'dark' },
    { systemPrefersDark: false, expected: 'light' },
  ])(
    'starts with "$expected" when nothing is saved and system prefers dark is $systemPrefersDark',
    ({ systemPrefersDark, expected }) => {
      mockSystemPrefersDark(systemPrefersDark)

      const { result } = renderUseTheme()

      expect(result.current.theme).toBe(expected)
      expect(document.documentElement.classList.contains('dark')).toBe(
        systemPrefersDark,
      )
    },
  )

  it.each([
    { saved: 'light', systemPrefersDark: true },
    { saved: 'dark', systemPrefersDark: false },
  ] as const)(
    'prefers the saved "$saved" theme over the system preference',
    ({ saved, systemPrefersDark }) => {
      mockSystemPrefersDark(systemPrefersDark)
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ theme: saved }))

      const { result } = renderUseTheme()

      expect(result.current.theme).toBe(saved)
      expect(document.documentElement.classList.contains('dark')).toBe(
        saved === 'dark',
      )
    },
  )

  it('falls back to the system preference when the saved theme is no longer valid', () => {
    mockSystemPrefersDark(true)
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ theme: 'system' }))

    const { result } = renderUseTheme()

    expect(result.current.theme).toBe('dark')
  })

  it('does not save the detected system preference on mount', () => {
    mockSystemPrefersDark(true)

    renderUseTheme()

    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('applies and saves the theme on update', () => {
    mockSystemPrefersDark(false)
    const { result } = renderUseTheme()

    act(() => {
      result.current.updateTheme('dark')
    })

    expect(result.current.theme).toBe('dark')
    expect(document.documentElement).toHaveClass('dark')
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '')).toEqual({
      theme: 'dark',
    })
  })

  it('still applies the theme when storage is unavailable', () => {
    mockSystemPrefersDark(false)
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('access denied')
    })
    const { result } = renderUseTheme()

    act(() => {
      result.current.updateTheme('dark')
    })

    expect(result.current.theme).toBe('dark')
    expect(document.documentElement).toHaveClass('dark')
  })
})
