import type * as z from 'zod/mini'

class ValidationError extends Error {
  constructor(error: z.core.$ZodError) {
    super('Received an unexpected response shape from the API')
    this.name = 'ValidationError'
    this.cause = error
  }
}

export { ValidationError }
