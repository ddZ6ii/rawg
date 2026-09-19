import type * as z from 'zod/mini'

class InvalidInputError extends Error {
  constructor(error: z.core.$ZodError, message = 'Invalid input') {
    super(message)
    this.name = 'InvalidInputError'
    this.cause = error
  }
}

export { InvalidInputError }
