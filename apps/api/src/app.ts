import cors from 'cors'
import express from 'express'

import { env } from './config/env'
import { errorHandler } from './middleware/errorHandler'
import { authRouter } from './routes/auth'
import { rootRouter } from './routes'

export const createApp = () => {
  const app = express()

  app.use(
    cors({
      origin: env.clientOrigin,
    }),
  )
  app.use(express.json())
  app.use('/api/auth', authRouter)
  app.use(rootRouter)
  app.use(errorHandler)

  return app
}
