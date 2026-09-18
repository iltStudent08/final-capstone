import assert from 'node:assert/strict'
import { once } from 'node:events'
import { createServer } from 'node:http'
import test from 'node:test'

import { createApp } from '../../src/app'

const listen = async () => {
  const server = createServer(createApp())
  server.listen(0)
  await once(server, 'listening')
  const address = server.address()

  if (!address || typeof address === 'string') {
    server.close()
    throw new Error('Expected the test server to bind to an ephemeral port')
  }

  return {
    server,
    baseUrl: `http://127.0.0.1:${address.port}`,
  }
}

test('GET /api/health returns service health', async () => {
  const { server, baseUrl } = await listen()

  try {
    const response = await fetch(`${baseUrl}/api/health`)
    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), { status: 'ok' })
  } finally {
    server.close()
    await once(server, 'close')
  }
})

test('GET /api returns starter metadata', async () => {
  const { server, baseUrl } = await listen()

  try {
    const response = await fetch(`${baseUrl}/api`)
    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), {
      name: 'final-capstone-api',
      message: 'Starter Express + TypeScript API is ready for resource routes.',
    })
  } finally {
    server.close()
    await once(server, 'close')
  }
})
