import type { AxiosError } from 'axios'
import * as z from 'zod/mini'
import { describe, expect, it } from 'vitest'

import { HttpError, ValidationError } from '@/shared/services'

import { getErrorMessage, isRetryableError } from './error'

function createHttpError(status?: number): HttpError {
  return new HttpError({
    message: 'Request failed',
    response: status === undefined ? undefined : { status },
  } as AxiosError)
}

function createValidationError(): ValidationError {
  const result = z.safeParse(z.object({ id: z.number() }), {})
  if (result.success) throw new Error('Expected validation to fail')

  return new ValidationError(result.error)
}

describe('isRetryableError', () => {
  it('returns false for ValidationError', () => {
    expect(isRetryableError(createValidationError())).toBe(false)
  })

  it('returns true for HttpError with no status', () => {
    expect(isRetryableError(createHttpError(undefined))).toBe(true)
  })

  it('returns true for HttpError with 5xx status', () => {
    expect(isRetryableError(createHttpError(500))).toBe(true)
    expect(isRetryableError(createHttpError(503))).toBe(true)
  })

  it('returns false for HttpError with 4xx status', () => {
    expect(isRetryableError(createHttpError(400))).toBe(false)
    expect(isRetryableError(createHttpError(404))).toBe(false)
  })

  it('returns false for unknown errors', () => {
    expect(isRetryableError(new Error('oops'))).toBe(false)
    expect(isRetryableError('oops')).toBe(false)
    expect(isRetryableError(undefined)).toBe(false)
  })
})

describe('getErrorMessage', () => {
  it('returns generic server message for ValidationError', () => {
    expect(getErrorMessage(createValidationError())).toBe(
      'Something went wrong on our end. Please try again later.',
    )
  })

  it('returns network message for HttpError with no status', () => {
    expect(getErrorMessage(createHttpError(undefined))).toBe(
      'Network error. Check your connection and try again.',
    )
  })

  it('returns not-found message for 404', () => {
    expect(getErrorMessage(createHttpError(404))).toBe(
      'We couldn’t find what you were looking for.',
    )
  })

  it('returns server-issues message for 5xx', () => {
    expect(getErrorMessage(createHttpError(500))).toBe(
      'The server is having issues. Please try again shortly.',
    )
  })

  it('returns generic request message for other statuses', () => {
    expect(getErrorMessage(createHttpError(400))).toBe(
      'Something went wrong with that request.',
    )
  })

  it('returns generic fallback for unknown errors', () => {
    expect(getErrorMessage(new Error('oops'))).toBe(
      'An unexpected error occurred.',
    )
    expect(getErrorMessage('oops')).toBe('An unexpected error occurred.')
  })
})
