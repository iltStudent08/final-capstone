import mongoose from 'mongoose'

export const connectToDatabase = async (connectionString: string) => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection
  }

  return mongoose.connect(connectionString)
}
