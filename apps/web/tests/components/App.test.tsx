import assert from 'node:assert/strict'
import test from 'node:test'

import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import App from '../../src/App'

test('App renders the starter shell content', () => {
  const markup = renderToStaticMarkup(React.createElement(App))

  assert.match(markup, /Final Capstone Web Client/)
  assert.match(markup, /React \+ TypeScript SPA/)
  assert.match(markup, /Express \+ TypeScript API/)
})
