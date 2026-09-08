import type { AxiosError } from 'axios'

class HttpError extends Error {
  status?: number

  constructor(error: AxiosError) {
    super(error.message)
    this.name = 'HttpError'
    this.status = error.response?.status
    this.cause = error
  }
}

export { HttpError }
