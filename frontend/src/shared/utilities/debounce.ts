/**
 * Returns a debounced version of `cbFn` that delays invocation until after
 * `delay` ms have elapsed since the last call.
 *
 * @param cbFn - The function to debounce.
 * @param delay - Quiet period in milliseconds (default `1000`).
 * @returns The debounced function, with a `.cancel()` method to abort any
 *   pending invocation.
 */
export function debounce<Args extends unknown[]>(
  cbFn: (...args: Args) => void,
  delay = 1000,
) {
  let id: ReturnType<typeof setTimeout> | null = null

  function cancel() {
    if (id !== null) {
      clearTimeout(id)
      id = null
    }
  }

  function debounced(...args: Args) {
    cancel()
    id = setTimeout(() => {
      id = null
      cbFn(...args)
    }, delay)
  }

  debounced.cancel = cancel
  return debounced
}
