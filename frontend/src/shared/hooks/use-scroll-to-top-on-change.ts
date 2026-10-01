import { useEffect, useRef } from 'react'

/** Scrolls the window to the top whenever `value` changes (not on mount). */
export function useScrollToTopOnChange(value: unknown) {
  const previous = useRef(value)

  useEffect(() => {
    if (Object.is(previous.current, value)) return
    previous.current = value
    window.scrollTo({ top: 0 })
  }, [value])
}
