import { model, Schema, Types } from 'mongoose'

export type TaskStatus = 'todo' | 'in-progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'

export type TaskDocument = {
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  dueDate?: Date
  project: Types.ObjectId
  assignee?: Types.ObjectId
  createdBy: Types.ObjectId
}

const taskSchema = new Schema<TaskDocument>(
  {
    title: { type: String, required: true, trim: true, minlength: 2, maxlength: 160 },
    description: { type: String, trim: true, maxlength: 2000 },
    status: { type: String, enum: ['todo', 'in-progress', 'done'], default: 'todo' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    dueDate: { type: Date },
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    assignee: { type: Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
)

export const Task = model<TaskDocument>('Task', taskSchema)