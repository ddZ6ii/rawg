import axios from 'axios'
import type { NextFunction, Request, Response } from 'express'
import * as z from 'zod/mini'

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 502
    res.status(status).json({ error: 'Upstream RAWG API request failed' })
    return
  }

  if (error instanceof z.core.$ZodError) {
    res
      .status(502)
      .json({ error: 'Upstream RAWG API response failed validation' })
    return
  }

  console.error(error)
  res.status(500).json({ error: 'Internal server error' })
}
