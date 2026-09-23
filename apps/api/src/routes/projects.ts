import { Router } from 'express'
import mongoose from 'mongoose'

import { requireAuth } from '../middleware/auth'
import { Project } from '../models/Project'
import type { AuthenticatedRequest } from '../types/auth'

const getId = (value: string) => (mongoose.isValidObjectId(value) ? value : undefined)

export const projectRouter = Router()

projectRouter.get('/', requireAuth, async (_request, response, next) => {
  try {
    const projects = await Project.find().populate('owner', 'name email').sort({ createdAt: -1 })
    response.json(projects)
  } catch (error) {
    next(error)
  }
})

projectRouter.post('/', requireAuth, async (request, response, next) => {
  try {
    const authenticatedRequest = request as AuthenticatedRequest
    const project = await Project.create({ ...request.body, owner: authenticatedRequest.user.id })
    response.status(201).json(await project.populate('owner', 'name email'))
  } catch (error) {
    next(error)
  }
})

projectRouter.get('/:id', requireAuth, async (request, response, next) => {
  try {
    const id = getId(String(request.params.id))
    if (!id) {
      response.status(400).json({ error: 'Invalid project id' })
      return
    }

    const project = await Project.findById(id).populate('owner', 'name email')
    if (!project) {
      response.status(404).json({ error: 'Project not found' })
      return
    }

    response.json(project)
  } catch (error) {
    next(error)
  }
})

projectRouter.put('/:id', requireAuth, async (request, response, next) => {
  try {
    const authenticatedRequest = request as AuthenticatedRequest
    const id = getId(String(request.params.id))
    if (!id) {
      response.status(400).json({ error: 'Invalid project id' })
      return
    }

    const project = await Project.findById(id)
    if (!project) {
      response.status(404).json({ error: 'Project not found' })
      return
    }
    if (project.owner.toString() !== authenticatedRequest.user.id && authenticatedRequest.user.role !== 'admin') {
      response.status(403).json({ error: 'You do not have permission to update this project' })
      return
    }

    Object.assign(project, request.body)
    await project.save()
    response.json(await project.populate('owner', 'name email'))
  } catch (error) {
    next(error)
  }
})

projectRouter.delete('/:id', requireAuth, async (request, response, next) => {
  try {
    const authenticatedRequest = request as AuthenticatedRequest
    const id = getId(String(request.params.id))
    if (!id) {
      response.status(400).json({ error: 'Invalid project id' })
      return
    }

    const project = await Project.findById(id)
    if (!project) {
      response.status(404).json({ error: 'Project not found' })
      return
    }
    if (project.owner.toString() !== authenticatedRequest.user.id && authenticatedRequest.user.role !== 'admin') {
      response.status(403).json({ error: 'You do not have permission to delete this project' })
      return
    }

    await project.deleteOne()
    response.status(204).send()
  } catch (error) {
    next(error)
  }
})