import { Router } from 'express'
import jwt from 'jsonwebtoken'

import { env } from '../config/env'
import { User } from '../models/User'
import { requireFields } from '../middleware/validate'

const createToken = (user: { id: string; role: string }) => {
  return jwt.sign({ role: user.role }, env.jwtSecret, { subject: user.id, expiresIn: '2h' })
}

const publicUser = (user: { id: string; name: string; email: string; role: string }) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
})

export const authRouter = Router()

authRouter.post('/register', requireFields(['name', 'email', 'password']), async (request, response, next) => {
  try {
    const user = await User.create({
      name: request.body.name,
      email: request.body.email,
      password: request.body.password,
    })

    response.status(201).json({ token: createToken(user), user: publicUser(user) })
  } catch (error) {
    next(error)
  }
})

authRouter.post('/login', requireFields(['email', 'password']), async (request, response, next) => {
  try {
    const user = await User.findOne({ email: request.body.email.toLowerCase() }).select('+password')

    if (!user || !(await user.comparePassword(request.body.password))) {
      response.status(401).json({ error: 'Invalid email or password' })
      return
    }

    response.json({ token: createToken(user), user: publicUser(user) })
  } catch (error) {
    next(error)
  }
})