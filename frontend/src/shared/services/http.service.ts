import axios from 'axios'
import * as z from 'zod/mini'

import { PaginatedResponseSchema } from '@rawg/shared'

import { apiClient } from '@/shared/services/api-client.service'
import { HttpError } from '@/shared/services/http.error'
import { ValidationError } from '@/shared/services/validation.error'

class HttpService {
  endpoint: string
  constructor(endpoint: string) {
    this.endpoint = endpoint
  }

  async getAll<TSchema extends z.core.SomeType>(
    schema: TSchema,
    signal?: AbortSignal,
  ) {
    try {
      const response = await apiClient.get(this.endpoint, { signal })
      return z.parse(PaginatedResponseSchema(schema), response.data)
    } catch (error) {
      if (axios.isCancel(error)) throw error
      if (error instanceof z.core.$ZodError) throw new ValidationError(error)
      if (axios.isAxiosError(error)) throw new HttpError(error)
      throw error
    }
  }
}

const createHttpService = (endpoint: string) => new HttpService(endpoint)

export { createHttpService }
