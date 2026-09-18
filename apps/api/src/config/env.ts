import { existsSync } from 'node:fs'
import path from 'node:path'

import dotenv from 'dotenv'

const envPathCandidates = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'apps/api/.env'),
  typeof __dirname === 'string' ? path.resolve(__dirname, '../../.env') : undefined,
].filter((candidate): candidate is string => typeof candidate === 'string')

const envPath = envPathCandidates.find((candidate) => existsSync(candidate))

if (envPath) {
  dotenv.config({ path: envPath })
} else {
  dotenv.config()
}

const toNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

export const env = {
  port: toNumber(process.env.PORT, 4000),
  mongodbUri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/final-capstone',
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
}
