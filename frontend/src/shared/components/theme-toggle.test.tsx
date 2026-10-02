import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ThemeContextProvider } from '@/shared/providers'

import { ThemeToggle } from './theme-toggle'

const STORAGE_KEY = 'test-prefs'

function renderToggle({ systemPrefersDark = false } = {}) {
  vi.spyOn(window, 'matchMedia').mockReturnValue({
    matches: systemPrefersDark,
  } as MediaQueryList)

  render(
    <ThemeContextProvider storageKey={STORAGE_KEY}>
      <ThemeToggle />
    </ThemeContextProvider>,
  )

  return screen.getByRole('switch', { name: 'Dark mode' })
}

describe('ThemeToggle', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('is unchecked in light mode', () => {
    const toggle = renderToggle({ systemPrefersDark: false })

    expect(toggle).not.toBeChecked()
  })

  it('is checked in dark mode', () => {
    const toggle = renderToggle({ systemPrefersDark: true })

    expect(toggle).toBeChecked()
  })

  it('switches to dark mode when turned on', async () => {
    const user = userEvent.setup()
    const toggle = renderToggle()

    await user.click(toggle)

    expect(toggle).toBeChecked()
    expect(document.documentElement).toHaveClass('dark')
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '')).toEqual({
      theme: 'dark',
    })
  })

  it('switches back to light mode when turned off', async () => {
    const user = userEvent.setup()
    const toggle = renderToggle({ systemPrefersDark: true })

    await user.click(toggle)

    expect(toggle).not.toBeChecked()
    expect(document.documentElement).not.toHaveClass('dark')
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '')).toEqual({
      theme: 'light',
    })
  })

  it('toggles when its label is clicked', async () => {
    const user = userEvent.setup()
    const toggle = renderToggle()

    await user.click(screen.getByText('Dark mode'))

    expect(toggle).toBeChecked()
  })

  it('toggles with the keyboard', async () => {
    const user = userEvent.setup()
    const toggle = renderToggle()

    await user.tab()
    expect(toggle).toHaveFocus()

    await user.keyboard(' ')

    expect(toggle).toBeChecked()
  })

  it('keeps the same accessible name in both states', async () => {
    const user = userEvent.setup()
    const toggle = renderToggle()

    await user.click(toggle)

    expect(screen.getByRole('switch', { name: 'Dark mode' })).toBe(toggle)
  })
})
