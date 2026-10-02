import type { Game, Genre, Platform } from '@rawg/shared'

// Factories build valid entities with neutral defaults. Pass the fields a test
// asserts on as overrides so they stay visible in the test.

function createGame(overrides: Partial<Game> = {}): Game {
  return {
    id: 1,
    name: 'Game',
    background_image: null,
    metacritic: null,
    parent_platforms: null,
    rating_top: null,
    ...overrides,
  }
}

function createGenre(overrides: Partial<Genre> = {}): Genre {
  return {
    id: 1,
    name: 'Genre',
    image_background: null,
    ...overrides,
  }
}

function createPlatform(overrides: Partial<Platform> = {}): Platform {
  return {
    id: 1,
    name: 'Platform',
    slug: 'platform',
    ...overrides,
  }
}

/** Wraps `results` in the API's paginated response shape. */
function toPaginatedResponse<T>(results: T[], count = results.length) {
  return { count, next: null, previous: null, results }
}

export { createGame, createGenre, createPlatform, toPaginatedResponse }
