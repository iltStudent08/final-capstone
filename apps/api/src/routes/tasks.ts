import { Router } from 'express'
import mongoose from 'mongoose'

import { requireAuth } from '../middleware/auth'
import { Project } from '../models/Project'
import { Task } from '../models/Task'
import type { AuthenticatedRequest } from '../types/auth'

const getId = (value: string) => (mongoose.isValidObjectId(value) ? value : undefined)

export const taskRouter = Router()

taskRouter.get('/', requireAuth, async (request, response, next) => {
  try {
    const projectId = request.query.project ? getId(String(request.query.project)) : undefined
    const filter = projectId ? { project: projectId } : {}
    const tasks = await Task.find(filter)
      .populate('project', 'name status')
      .populate('assignee', 'name email')
      .sort({ createdAt: -1 })
    response.json(tasks)
  } catch (error) {
    next(error)
  }
})

taskRouter.post('/', requireAuth, async (request, response, next) => {
  try {
    const authenticatedRequest = request as AuthenticatedRequest
    if (!getId(String(request.body.project))) {
      response.status(400).json({ error: 'A valid project is required' })
      return
    }
    if (!(await Project.exists({ _id: request.body.project }))) {
      response.status(400).json({ error: 'Project not found' })
      return
    }

    const task = await Task.create({ ...request.body, createdBy: authenticatedRequest.user.id })
    response.status(201).json(
      await task.populate([
        { path: 'project', select: 'name status' },
        { path: 'assignee', select: 'name email' },
      ]),
    )
  } catch (error) {
    next(error)
  }
})

taskRouter.get('/:id', requireAuth, async (request, response, next) => {
  try {
    const id = getId(String(request.params.id))
    if (!id) {
      response.status(400).json({ error: 'Invalid task id' })
      return
    }

    const task = await Task.findById(id)
      .populate('project', 'name status')
      .populate('assignee', 'name email')
    if (!task) {
      response.status(404).json({ error: 'Task not found' })
      return
    }

    response.json(task)
  } catch (error) {
    next(error)
  }
})

taskRouter.put('/:id', requireAuth, async (request, response, next) => {
  try {
    const authenticatedRequest = request as AuthenticatedRequest
    const id = getId(String(request.params.id))
    if (!id) {
      response.status(400).json({ error: 'Invalid task id' })
      return
    }

    const task = await Task.findById(id)
    if (!task) {
      response.status(404).json({ error: 'Task not found' })
      return
    }
    if (task.createdBy.toString() !== authenticatedRequest.user.id && authenticatedRequest.user.role !== 'admin') {
      response.status(403).json({ error: 'You do not have permission to update this task' })
      return
    }

    Object.assign(task, request.body)
    await task.save()
    response.json(
      await task.populate([
        { path: 'project', select: 'name status' },
        { path: 'assignee', select: 'name email' },
      ]),
    )
  } catch (error) {
    next(error)
  }
})

taskRouter.delete('/:id', requireAuth, async (request, response, next) => {
  try {
    const authenticatedRequest = request as AuthenticatedRequest
    const id = getId(String(request.params.id))
    if (!id) {
      response.status(400).json({ error: 'Invalid task id' })
      return
    }

    const task = await Task.findById(id)
    if (!task) {
      response.status(404).json({ error: 'Task not found' })
      return
    }
    if (task.createdBy.toString() !== authenticatedRequest.user.id && authenticatedRequest.user.role !== 'admin') {
      response.status(403).json({ error: 'You do not have permission to delete this task' })
      return
    }

    await task.deleteOne()
    response.status(204).send()
  } catch (error) {
    next(error)
  }
})