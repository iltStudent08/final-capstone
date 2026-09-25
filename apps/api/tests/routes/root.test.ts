import assert from 'node:assert/strict'
import { once } from 'node:events'
import { createServer } from 'node:http'
import test from 'node:test'
import jwt from 'jsonwebtoken'

import { createApp } from '../../src/app'
import { env } from '../../src/config/env'

const authToken = jwt.sign({ role: 'member' }, env.jwtSecret, { subject: 'user-123' })

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

test('protected project routes reject requests without a token', async () => {
  const { server, baseUrl } = await listen()

  try {
    const response = await fetch(`${baseUrl}/api/projects`)
    assert.equal(response.status, 401)
    assert.deepEqual(await response.json(), { error: 'Authentication required' })
  } finally {
    server.close()
    await once(server, 'close')
  }
})

test('protected dashboard route rejects an invalid token', async () => {
  const { server, baseUrl } = await listen()

  try {
    const response = await fetch(`${baseUrl}/api/dashboard`, {
      headers: { authorization: 'Bearer invalid-token' },
    })
    assert.equal(response.status, 401)
    assert.deepEqual(await response.json(), { error: 'Invalid or expired authentication token' })
  } finally {
    server.close()
    await once(server, 'close')
  }
})

test('registration validates required fields before database access', async () => {
  const { server, baseUrl } = await listen()

  try {
    const response = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'missing-name@example.com', password: 'password123' }),
    })
    assert.equal(response.status, 400)
    assert.deepEqual(await response.json(), { error: 'Missing required fields: name' })
  } finally {
    server.close()
    await once(server, 'close')
  }
})

test('login validates required fields before database access', async () => {
  const { server, baseUrl } = await listen()

  try {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'missing-password@example.com' }),
    })
    assert.equal(response.status, 400)
    assert.deepEqual(await response.json(), { error: 'Missing required fields: password' })
  } finally {
    server.close()
    await once(server, 'close')
  }
})

test('registration rejects whitespace-only required fields', async () => {
  const { server, baseUrl } = await listen()

  try {
    const response = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: '  ', email: 'valid@example.com', password: 'password123' }),
    })
    assert.equal(response.status, 400)
    assert.deepEqual(await response.json(), { error: 'Missing required fields: name' })
  } finally {
    server.close()
    await once(server, 'close')
  }
})

test('project detail rejects an invalid project id', async () => {
  const { server, baseUrl } = await listen()

  try {
    const response = await fetch(`${baseUrl}/api/projects/not-an-object-id`, {
      headers: { authorization: `Bearer ${authToken}` },
    })
    assert.equal(response.status, 400)
    assert.deepEqual(await response.json(), { error: 'Invalid project id' })
  } finally {
    server.close()
    await once(server, 'close')
  }
})

test('task detail rejects an invalid task id', async () => {
  const { server, baseUrl } = await listen()

  try {
    const response = await fetch(`${baseUrl}/api/tasks/not-an-object-id`, {
      headers: { authorization: `Bearer ${authToken}` },
    })
    assert.equal(response.status, 400)
    assert.deepEqual(await response.json(), { error: 'Invalid task id' })
  } finally {
    server.close()
    await once(server, 'close')
  }
})

test('task creation rejects an invalid project reference', async () => {
  const { server, baseUrl } = await listen()

  try {
    const response = await fetch(`${baseUrl}/api/tasks`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${authToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ title: 'Task without a project', project: 'not-an-object-id' }),
    })
    assert.equal(response.status, 400)
    assert.deepEqual(await response.json(), { error: 'A valid project is required' })
  } finally {
    server.close()
    await once(server, 'close')
  }
})
