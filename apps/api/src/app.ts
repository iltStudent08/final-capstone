import cors from 'cors'
import express from 'express'

import { env } from './config/env'
import { rootRouter } from './routes'

export const createApp = () => {
  const app = express()

  app.use(
    cors({
      origin: env.clientOrigin,
    }),
  )
  app.use(express.json())
  app.use(rootRouter)

  return app
}
