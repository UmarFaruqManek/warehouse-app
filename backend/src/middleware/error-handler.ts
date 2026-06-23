import { Request, Response, NextFunction } from 'express'
import { AppError } from '../lib/safe-id'

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(err.stack)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ success: false, error: err.message })
  }
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  })
}
