import { useEffect, useState } from 'react'

/**
 * Returns whether the referenced element's content is currently
 * truncated (its scrollWidth exceeds its clientWidth). Re-checks on
 * resize and content changes.
 *
 * @param ref - Ref to the element to observe.
 */
export function useIsTruncated(ref: React.RefObject<HTMLElement | null>) {
  const [isTruncated, setIsTruncated] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const checkTruncation = () => {
      setIsTruncated(element.scrollWidth > element.clientWidth)
    }

    checkTruncation()

    const observer = new ResizeObserver(checkTruncation)
    observer.observe(element)
    return () => {
      observer.disconnect()
    }
  }, [ref])

  return isTruncated
}
