/**
 * Trims `search` and collapses internal whitespace runs (spaces, tabs,
 * newlines) into single spaces, e.g. `'  foo   bar '` → `'foo bar'`.
 */
export function normalizeSearch(search: string) {
  return search.trim().replace(/\s+/g, ' ')
}
