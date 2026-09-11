import { HttpError, ValidationError } from '@/shared/services'

function isRetryableError(error: unknown): boolean {
  if (error instanceof ValidationError) return false

  if (error instanceof HttpError)
    return error.status === undefined || error.status >= 500

  return false
}

function getErrorMessage(error: unknown): string {
  if (error instanceof ValidationError)
    return 'Something went wrong on our end. Please try again later.'

  if (error instanceof HttpError) {
    if (error.status === undefined)
      return 'Network error. Check your connection and try again.'

    if (error.status === 404)
      return 'We couldn’t find what you were looking for.'

    if (error.status >= 500)
      return 'The server is having issues. Please try again shortly.'

    return 'Something went wrong with that request.'
  }

  return 'An unexpected error occurred.'
}

export { isRetryableError, getErrorMessage }
