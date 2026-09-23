import jwt from 'jsonwebtoken'
import type { NextFunction, Request, Response } from 'express'

import { env } from '../config/env'
import type { AuthenticatedRequest, AuthUser } from '../types/auth'

export const requireAuth = (request: Request, response: Response, next: NextFunction) => {
  const authenticatedRequest = request as AuthenticatedRequest
  const header = request.header('authorization')
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined

  if (!token) {
    response.status(401).json({ error: 'Authentication required' })
    return
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret)

    if (typeof payload !== 'object' || !payload.sub || !('role' in payload)) {
      response.status(401).json({ error: 'Invalid authentication token' })
      return
    }

    authenticatedRequest.user = { id: payload.sub, role: payload.role as AuthUser['role'] }
    next()
  } catch {
    response.status(401).json({ error: 'Invalid or expired authentication token' })
  }
}