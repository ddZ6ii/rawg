import { queryOptions } from '@tanstack/react-query'

import {
  InvalidInputError,
  PlatformSchema,
  PlatformsParamsSchema,
  type Platform,
  type PlatformsParams,
} from '@rawg/shared'

import { createHttpService } from '@/shared/services'

const PLATFORM_KEYS = {
  // Query keys
  all: ['platforms'] as const,
}

const platformService = createHttpService('/platforms')

function createPlatformsQueryOptions<TData = Platform[]>({
  options = {},
  select,
}: {
  options?: PlatformsParams
  select?: (platforms: Platform[]) => TData
} = {}) {
  const parsedOptions = PlatformsParamsSchema.safeParse(options)
  if (!parsedOptions.success) {
    throw new InvalidInputError(
      parsedOptions.error,
      'Invalid query options passed to createPlatformsQueryOptions',
    )
  }

  const params = parsedOptions.data

  return queryOptions({
    queryKey:
      Object.keys(params).length > 0
        ? [...PLATFORM_KEYS.all, params]
        : PLATFORM_KEYS.all,
    queryFn: ({ signal }) =>
      platformService.getAll(PlatformSchema, signal, params),
    select: (response) =>
      (select ? select(response.results) : response.results) as TData,
  })
}

export { createPlatformsQueryOptions }
