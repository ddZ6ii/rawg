import { queryOptions } from '@tanstack/react-query'

import {
  GenreSchema,
  GenresParamsSchema,
  InvalidInputError,
  type Genre,
  type GenresParams,
} from '@rawg/shared'

import { createHttpService } from '@/shared/services'

const GENRE_KEYS = {
  // Query keys
  all: ['genres'] as const,
}

const genreService = createHttpService('/genres')

function createGenresQueryOptions<TData = Genre[]>({
  options = {},
  select,
}: {
  options?: GenresParams
  select?: (genres: Genre[]) => TData
} = {}) {
  const parsedOptions = GenresParamsSchema.safeParse(options)
  if (!parsedOptions.success) {
    throw new InvalidInputError(
      parsedOptions.error,
      'Invalid query options passed to createGenresQueryOptions',
    )
  }

  const params = parsedOptions.data

  return queryOptions({
    queryKey:
      Object.keys(params).length > 0
        ? [...GENRE_KEYS.all, params]
        : GENRE_KEYS.all,
    queryFn: ({ signal }) => genreService.getAll(GenreSchema, signal, params),
    select: (response) =>
      (select ? select(response.results) : response.results) as TData,
  })
}

export { createGenresQueryOptions }
