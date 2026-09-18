import { Router } from 'express'

export const rootRouter = Router()

rootRouter.get('/health', (_request, response) => {
  response.status(200).json({ status: 'ok' })
})

rootRouter.get('/', (_request, response) => {
  response.status(200).json({
    name: 'final-capstone-api',
    message: 'Starter Express + TypeScript API is ready for resource routes.',
  })
})
