import bcrypt from 'bcryptjs'
import { model, Schema } from 'mongoose'

import type { UserRole } from '../types/auth'

export type UserDocument = {
  name: string
  email: string
  password: string
  role: UserRole
  comparePassword(password: string): Promise<boolean>
}

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ['member', 'admin'], default: 'member' },
  },
  { timestamps: true },
)

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) {
    return
  }

  this.password = await bcrypt.hash(this.password, 12)
})

userSchema.methods.comparePassword = function comparePassword(password: string) {
  return bcrypt.compare(password, this.password)
}

export const User = model<UserDocument>('User', userSchema)