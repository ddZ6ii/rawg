import type { Genre, Platform } from '@rawg/shared'

import { capitalize } from './capitalize'

export function getPageTitle(
  genreName: Genre['name'] | undefined,
  platformName: Platform['name'] | undefined,
) {
  if (genreName && platformName) {
    return `${capitalize(genreName)} for ${platformName}`
  }
  if (genreName) {
    return capitalize(genreName)
  }
  if (platformName) {
    return `All Games for ${platformName}`
  }
  return 'All Games'
}
