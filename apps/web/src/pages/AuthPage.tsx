import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../context/useAuth'
import { getApiError } from '../lib/api'

export function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const isRegister = mode === 'register'
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isRegister) {
        await register(name, email, password)
      } else {
        await login(email, password)
      }
      navigate(location.state?.from?.pathname ?? '/')
    } catch (requestError) {
      setError(getApiError(requestError))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <a className="app-brand" href="/">Taskflow</a>
        <p className="eyebrow">Project task tracker</p>
        <h1>{isRegister ? 'Create your workspace.' : 'Welcome back.'}</h1>
        <p className="auth-copy">{isRegister ? 'Bring your team and next steps into focus.' : 'Pick up where your team left off.'}</p>
        <form className="form-stack" onSubmit={submit}>
          {isRegister && <label>Name<input value={name} onChange={(event) => setName(event.target.value)} required minLength={2} /></label>}
          <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
          <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} /></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button button-primary" disabled={loading}>{loading ? 'Working...' : isRegister ? 'Create account' : 'Sign in'}</button>
        </form>
        <p className="auth-switch">{isRegister ? 'Already have an account?' : 'New to Taskflow?'} <Link to={isRegister ? '/login' : '/register'}>{isRegister ? 'Sign in' : 'Create an account'}</Link></p>
      </section>
    </main>
  )
}