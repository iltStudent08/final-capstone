import type { ErrorRequestHandler } from 'express'
import mongoose from 'mongoose'

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error?.code === 11000) {
    response.status(409).json({ error: 'A record with that value already exists' })
    return
  }

  if (error instanceof mongoose.Error.ValidationError) {
    response.status(400).json({ error: error.message })
    return
  }

  console.error(error)
  response.status(500).json({ error: 'Internal server error' })
}