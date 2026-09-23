import assert from 'node:assert/strict'
import test from 'node:test'

import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'

import App from '../../src/App'
import { AuthProvider } from '../../src/context/AuthContext'
import { AuthPage } from '../../src/pages/AuthPage'
import { ProjectsPage } from '../../src/pages/ProjectsPage'

test('App renders the unauthenticated application entry point', () => {
  const markup = renderToStaticMarkup(
    React.createElement(MemoryRouter, { initialEntries: ['/login'] }, React.createElement(AuthProvider, null, React.createElement(App))),
  )

  assert.match(markup, /Welcome back/)
  assert.match(markup, /Sign in/)
})

test('Registration page renders account fields', () => {
  const markup = renderToStaticMarkup(
    React.createElement(MemoryRouter, { initialEntries: ['/register'] }, React.createElement(AuthProvider, null, React.createElement(AuthPage, { mode: 'register' }))),
  )

  assert.match(markup, /Create your workspace/)
  assert.match(markup, /Name/)
  assert.match(markup, /Create account/)
})

test('Projects page renders the project creation form', () => {
  const markup = renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(ProjectsPage)))

  assert.match(markup, /Start a project/)
  assert.match(markup, /Create project/)
  assert.match(markup, /Description/)
})
