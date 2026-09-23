import { Router } from 'express'

import { requireAuth } from '../middleware/auth'
import { Project } from '../models/Project'
import { Task } from '../models/Task'

export const dashboardRouter = Router()

dashboardRouter.get('/', requireAuth, async (_request, response, next) => {
  try {
    const [projectCount, taskCount, projectsByStatus, tasksByStatus, recentTasks] = await Promise.all([
      Project.countDocuments(),
      Task.countDocuments(),
      Project.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Task.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Task.find().sort({ createdAt: -1 }).limit(5).populate('project', 'name'),
    ])

    response.json({ projectCount, taskCount, projectsByStatus, tasksByStatus, recentTasks })
  } catch (error) {
    next(error)
  }
})