import { Router } from 'express'

import { dashboardRouter } from './dashboard'
import { projectRouter } from './projects'
import { taskRouter } from './tasks'

export const rootRouter = Router()
export const apiBasePath = '/api'

rootRouter.get(`${apiBasePath}/health`, (_request, response) => {
  response.status(200).json({ status: 'ok' })
})

rootRouter.get(apiBasePath, (_request, response) => {
  response.status(200).json({
    name: 'final-capstone-api',
    message: 'Starter Express + TypeScript API is ready for resource routes.',
  })
})

rootRouter.use(`${apiBasePath}/projects`, projectRouter)
rootRouter.use(`${apiBasePath}/tasks`, taskRouter)
rootRouter.use(`${apiBasePath}/dashboard`, dashboardRouter)
