import { useEffect, useState } from 'react'

const mq = (breakpoint: number) =>
  `screen and (max-width: ${String(breakpoint - 1)}px)`

/**
 * Returns whether the viewport is narrower than the given breakpoint.
 * Subscribes to media query changes and re-renders on resize.
 *
 * @param breakpoint - Max viewport width (px) before considered mobile. Defaults to 1024.
 * @returns `true` when the viewport width is below the breakpoint.
 */
export function useIsMobile(breakpoint = 1024) {
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia(mq(breakpoint)).matches,
  )

  useEffect(() => {
    const mql = window.matchMedia(mq(breakpoint))
    const onChange = () => {
      setIsMobile(mql.matches)
    }
    mql.addEventListener('change', onChange)
    return () => {
      mql.removeEventListener('change', onChange)
    }
  }, [breakpoint])

  return isMobile
}
