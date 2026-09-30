import { GAMES_SEARCH_MAX_LENGTH } from '@rawg/shared'

import { normalizeSearch } from './normalize-search'

export const REMAINING_CHARS_THRESHOLD = 20

export function getCharCounter(value: string) {
  const length = normalizeSearch(value).length
  const remaining = GAMES_SEARCH_MAX_LENGTH - length

  return {
    length,
    remaining,
    visible: remaining >= 0 && remaining <= REMAINING_CHARS_THRESHOLD,
  }
}
