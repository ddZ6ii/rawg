import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { GAMES_SEARCH_MAX_LENGTH } from '@rawg/shared'

import { RenderWithProvider } from '@/tests/utilities/render-with-provider'

import { REMAINING_CHARS_THRESHOLD } from '../utilities'
import { DEBOUNCE_DELAY_MS, SearchInput } from './search-input'

function renderSearchInput(isPending?: boolean) {
  const onSearch = vi.fn()
  const view = render(
    <SearchInput isPending={isPending} onSearch={onSearch} />,
    { wrapper: RenderWithProvider },
  )
  return { ...view, onSearch, input: screen.getByTestId('search-input') }
}

// fireEvent is used instead of user.type because user.type hangs under fake
// timers.
function type(input: HTMLElement, value: string) {
  fireEvent.change(input, { target: { value } })
}

afterEach(() => {
  vi.useRealTimers()
})

describe('SearchInput', () => {
  it('starts empty', () => {
    const { input } = renderSearchInput()

    expect(input).toHaveValue('')
  })

  it('updates the input immediately but emits only after the delay', () => {
    vi.useFakeTimers()
    const search = 'mario'
    const { input, onSearch } = renderSearchInput()

    type(input, search)

    expect(input).toHaveValue(search)
    expect(onSearch).not.toHaveBeenCalled()

    vi.advanceTimersByTime(DEBOUNCE_DELAY_MS)
    expect(onSearch).toHaveBeenCalledExactlyOnceWith(search)
  })

  it('emits a trimmed term', () => {
    vi.useFakeTimers()
    const { input, onSearch } = renderSearchInput()

    type(input, ' zelda ')
    vi.advanceTimersByTime(DEBOUNCE_DELAY_MS)

    expect(onSearch).toHaveBeenCalledExactlyOnceWith('zelda')
  })

  it('keeps the raw input but emits collapsed whitespace', () => {
    vi.useFakeTimers()
    const { input, onSearch } = renderSearchInput()

    type(input, 'zelda   mario')
    vi.advanceTimersByTime(DEBOUNCE_DELAY_MS)

    expect(input).toHaveValue('zelda   mario')
    expect(onSearch).toHaveBeenCalledExactlyOnceWith('zelda mario')
  })

  it('emits null for a whitespace-only term', () => {
    vi.useFakeTimers()
    const { input, onSearch } = renderSearchInput()

    type(input, '   ')
    vi.advanceTimersByTime(DEBOUNCE_DELAY_MS)

    expect(onSearch).toHaveBeenCalledExactlyOnceWith(null)
  })

  it('emits once after rapid typing', () => {
    vi.useFakeTimers()
    const KEYSTROKE_INTERVAL = 100
    const search = 'zelda'
    const { input, onSearch } = renderSearchInput()

    // Simulate typing one char every 100ms (< 350ms delay) so each keystroke
    // resets the debounce timer.
    for (let i = 0; i < search.length; i++) {
      type(input, search.slice(0, i + 1))
      vi.advanceTimersByTime(KEYSTROKE_INTERVAL)
    }

    expect(input).toHaveValue(search)
    expect(onSearch).not.toHaveBeenCalled()

    vi.advanceTimersByTime(DEBOUNCE_DELAY_MS - KEYSTROKE_INTERVAL)
    expect(onSearch).toHaveBeenCalledExactlyOnceWith(search)
  })

  it('shows no spinner by default', () => {
    renderSearchInput()

    expect(
      screen.queryByRole('status', { name: 'Loading' }),
    ).not.toBeInTheDocument()
  })

  it('shows a spinner while pending', () => {
    renderSearchInput(true)

    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument()
  })

  it('hides the clear button when empty', () => {
    renderSearchInput()

    expect(
      screen.queryByRole('button', { name: 'Clear search' }),
    ).not.toBeInTheDocument()
  })

  it('clears the input, emits null and refocuses on clear', async () => {
    const user = userEvent.setup()
    const { input, onSearch } = renderSearchInput()

    await user.type(input, 'zelda')
    await user.click(screen.getByRole('button', { name: 'Clear search' }))

    expect(input).toHaveValue('')
    expect(input).toHaveFocus()
    expect(onSearch).toHaveBeenCalledExactlyOnceWith(null)
  })

  it('drops a pending typed term on clear', () => {
    vi.useFakeTimers()
    const { input, onSearch } = renderSearchInput()

    type(input, 'zel')
    fireEvent.click(screen.getByRole('button', { name: 'Clear search' }))
    vi.advanceTimersByTime(DEBOUNCE_DELAY_MS)

    expect(onSearch).toHaveBeenCalledExactlyOnceWith(null)
  })

  describe('validation', () => {
    const tooLong = 'a'.repeat(GAMES_SEARCH_MAX_LENGTH + 1)
    const maxLength = 'a'.repeat(GAMES_SEARCH_MAX_LENGTH)

    it('accepts a term at the max length', () => {
      vi.useFakeTimers()
      const { input, onSearch } = renderSearchInput()

      type(input, maxLength)
      vi.advanceTimersByTime(DEBOUNCE_DELAY_MS)

      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      expect(onSearch).toHaveBeenCalledExactlyOnceWith(maxLength)
    })

    it('shows an error and emits nothing when the term is too long', () => {
      vi.useFakeTimers()
      const { input, onSearch } = renderSearchInput()

      type(input, tooLong)
      vi.advanceTimersByTime(DEBOUNCE_DELAY_MS)

      expect(input).toHaveValue(tooLong)
      expect(input).toHaveAttribute('aria-invalid', 'true')
      expect(screen.getByRole('alert')).toHaveTextContent(
        `Search must be ${String(GAMES_SEARCH_MAX_LENGTH)} characters or fewer`,
      )
      expect(onSearch).not.toHaveBeenCalled()
    })

    it('drops a pending valid term once the term becomes too long', () => {
      vi.useFakeTimers()
      const { input, onSearch } = renderSearchInput()

      type(input, maxLength)
      type(input, tooLong)
      vi.advanceTimersByTime(DEBOUNCE_DELAY_MS)

      expect(onSearch).not.toHaveBeenCalled()
    })

    it('clears the error and emits once the term is shortened', () => {
      vi.useFakeTimers()
      const { input, onSearch } = renderSearchInput()

      type(input, tooLong)
      type(input, maxLength)
      vi.advanceTimersByTime(DEBOUNCE_DELAY_MS)

      expect(input).toHaveAttribute('aria-invalid', 'false')
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      expect(onSearch).toHaveBeenCalledExactlyOnceWith(maxLength)
    })

    it('ignores surrounding whitespace when checking the length', () => {
      vi.useFakeTimers()
      const { input, onSearch } = renderSearchInput()

      type(input, `  ${maxLength}  `)
      vi.advanceTimersByTime(DEBOUNCE_DELAY_MS)

      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      expect(onSearch).toHaveBeenCalledExactlyOnceWith(maxLength)
    })

    it('clears the error on clear', () => {
      const { input } = renderSearchInput()

      type(input, tooLong)
      fireEvent.click(screen.getByRole('button', { name: 'Clear search' }))

      expect(input).toHaveAttribute('aria-invalid', 'false')
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })

  describe('character counter', () => {
    const counter = () => screen.getByTestId('search-char-counter')
    const nearLimit = 'a'.repeat(
      GAMES_SEARCH_MAX_LENGTH - REMAINING_CHARS_THRESHOLD,
    )
    const thresholdLeft = `${String(REMAINING_CHARS_THRESHOLD)} characters left`

    it('stays empty while far from the limit', () => {
      const { input } = renderSearchInput()

      type(input, nearLimit.slice(1))

      expect(counter()).toBeEmptyDOMElement()
      expect(input).not.toHaveAttribute('aria-describedby')
    })

    it('shows used/max and the remaining count near the limit', () => {
      const { input } = renderSearchInput()

      type(input, nearLimit)

      expect(counter()).toHaveTextContent(
        `${String(nearLimit.length)}/${String(GAMES_SEARCH_MAX_LENGTH)}`,
      )
      expect(counter()).toHaveTextContent(thresholdLeft)
      expect(input).toHaveAttribute('aria-describedby', counter().id)
    })

    it('uses the singular for one character left', () => {
      const { input } = renderSearchInput()

      type(input, 'a'.repeat(GAMES_SEARCH_MAX_LENGTH - 1))

      expect(counter()).toHaveTextContent('1 character left')
    })

    it('ignores whitespace that is not validated', () => {
      const { input } = renderSearchInput()

      // Normalizes to nearLimit's length once padding is trimmed and the
      // inner run collapses to a single space
      const [head, tail] = [nearLimit.slice(0, 10), nearLimit.slice(11)]
      type(input, `   ${head}     ${tail}   `)

      expect(counter()).toHaveTextContent(thresholdLeft)
    })

    it('hides the counter once over the limit', () => {
      const { input } = renderSearchInput()

      type(input, 'a'.repeat(GAMES_SEARCH_MAX_LENGTH + 1))

      expect(counter()).toBeEmptyDOMElement()
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })
})
