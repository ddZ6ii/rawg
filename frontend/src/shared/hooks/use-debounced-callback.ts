import { useEffect, useLayoutEffect, useRef, useState } from 'react'

import { debounce } from '@/shared/utilities'

/**
 * Returns a stable debounced version of `cb` that always invokes the latest
 * `cb` passed in. Any pending invocation is cancelled on unmount.
 *
 * @param cb - The callback to debounce.
 * @param delay - Quiet period in milliseconds (default `1000`). Only read on
 *   mount.
 * @returns The debounced callback, with a `.cancel()` method to abort any
 *   pending invocation.
 */
export function useDebouncedCallback<Args extends unknown[]>(
  cb: (...args: Args) => void,
  delay?: number,
) {
  const cbRef = useRef(cb)

  useLayoutEffect(() => {
    cbRef.current = cb
  })

  // useState initializer guarantees a stable identity across renders
  // eslint-disable-next-line react-hooks/refs -- cbRef is only read when the timer fires, not during render
  const [debounced] = useState(() =>
    debounce((...args: Args) => {
      cbRef.current(...args)
    }, delay),
  )

  useEffect(() => debounced.cancel, [debounced])

  return debounced
}
