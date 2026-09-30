import { SearchIcon, XIcon } from 'lucide-react'
import { useId, useRef, useState } from 'react'

import { GAMES_SEARCH_MAX_LENGTH, GamesSearchSchema } from '@rawg/shared'

import { getCharCounter, normalizeSearch } from '@/features/search/utilities'
import {
  Field,
  FieldError,
  FieldLabel,
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  Spinner,
  useDebouncedCallback,
} from '@/shared'

const DEBOUNCE_DELAY_MS = 350

function SearchInput({
  isPending = false,
  onSearch,
}: {
  isPending?: boolean
  onSearch: (value: string | null) => void
}) {
  const counterId = useId()
  const errorId = useId()
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [inputValue, setInputValue] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const debouncedSearch = useDebouncedCallback(onSearch, DEBOUNCE_DELAY_MS)

  const counter = getCharCounter(inputValue)

  const handleChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = e.target.value
    setInputValue(nextValue) // instant UI, untouched so the caret stays put
    const nextSearch = normalizeSearch(nextValue)

    const result = GamesSearchSchema.safeParse(nextSearch)
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Invalid search')
      debouncedSearch.cancel() // never emit an invalid term
      return
    }

    setError(null)
    debouncedSearch(nextSearch || null)
  }

  const handleClear = () => {
    setInputValue('')
    setError(null)
    debouncedSearch.cancel() // drop any pending typed term
    onSearch(null)
    inputRef.current?.focus()
  }

  return (
    <Field className="gap-0.5" data-invalid={error !== null}>
      <FieldLabel
        htmlFor={inputId}
        className="text-muted-foreground text-xs whitespace-nowrap"
      >
        Search
      </FieldLabel>

      <InputGroup>
        <InputGroupAddon>
          {isPending ? <Spinner /> : <SearchIcon />}
        </InputGroupAddon>

        <InputGroupInput
          ref={inputRef}
          id={inputId}
          data-testid="search-input"
          type="search"
          enterKeyHint="search"
          placeholder="Search games..."
          className="[&::-webkit-search-cancel-button]:appearance-none"
          value={inputValue}
          aria-invalid={error !== null}
          aria-describedby={
            [error && errorId, counter.visible && counterId]
              .filter(Boolean)
              .join(' ') || undefined
          }
          onChange={handleChangeSearch}
        />

        {inputValue.length > 0 && (
          <InputGroupAddon align="inline-end">
            {/* Live region mounts with the addon (first keystroke), before its
                text changes, so the first announcement isn't skipped. */}
            <span
              id={counterId}
              aria-live="polite"
              data-testid="search-char-counter"
              className="text-xs whitespace-nowrap tabular-nums"
            >
              {counter.visible && (
                <>
                  <span aria-hidden="true">
                    {`${String(counter.length)}/${String(GAMES_SEARCH_MAX_LENGTH)}`}
                  </span>
                  <span className="sr-only">
                    {`${String(counter.remaining)} ${counter.remaining === 1 ? 'character' : 'characters'} left`}
                  </span>
                </>
              )}
            </span>

            <InputGroupButton size="icon-xs" onClick={handleClear}>
              <XIcon />
              <span className="sr-only">Clear search</span>
            </InputGroupButton>
          </InputGroupAddon>
        )}
      </InputGroup>

      {error && (
        <FieldError id={errorId} className="mt-1 text-xs">
          {error}
        </FieldError>
      )}
    </Field>
  )
}

export { DEBOUNCE_DELAY_MS, SearchInput }
