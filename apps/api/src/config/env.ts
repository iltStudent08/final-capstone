import dotenv from 'dotenv'

dotenv.config()

const toNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

export const env = {
  port: toNumber(process.env.PORT, 4000),
  mongodbUri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/final-capstone',
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
}
