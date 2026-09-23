import type { NextFunction, Request, Response } from 'express'

export const requireFields = (fields: string[]) => {
  return (request: Request, response: Response, next: NextFunction) => {
    const missingFields = fields.filter((field) => {
      const value = request.body?.[field]
      return typeof value !== 'string' || value.trim().length === 0
    })

    if (missingFields.length > 0) {
      response.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` })
      return
    }

    next()
  }
}