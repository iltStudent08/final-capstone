import { createApp } from './app'
import { connectToDatabase } from './config/database'
import { env } from './config/env'

const startServer = async () => {
  await connectToDatabase(env.mongodbUri)

  const app = createApp()
  app.listen(env.port, () => {
    console.log(`API server listening on port ${env.port}`)
  })
}

void startServer().catch((error: unknown) => {
  console.error('Failed to start API server', error)
  process.exit(1)
})
