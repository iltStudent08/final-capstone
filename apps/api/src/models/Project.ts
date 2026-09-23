import { model, Schema, Types } from 'mongoose'

export type ProjectStatus = 'planning' | 'active' | 'completed' | 'archived'

export type ProjectDocument = {
  name: string
  description?: string
  status: ProjectStatus
  owner: Types.ObjectId
}

const projectSchema = new Schema<ProjectDocument>(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 1000 },
    status: { type: String, enum: ['planning', 'active', 'completed', 'archived'], default: 'planning' },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
)

export const Project = model<ProjectDocument>('Project', projectSchema)