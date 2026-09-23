import { useState } from 'react'
import type { ReactNode } from 'react'

import { api } from '../lib/api'
import { AuthContext } from './auth'
import type { User } from './auth'

const storage = typeof window === 'undefined' ? undefined : window.localStorage
const storedUser = storage?.getItem('taskflow-user')

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(storedUser ? JSON.parse(storedUser) as User : null)
  const [token, setToken] = useState<string | null>(storage?.getItem('taskflow-token') ?? null)

  const saveSession = (nextToken: string, nextUser: User) => {
    storage?.setItem('taskflow-token', nextToken)
    storage?.setItem('taskflow-user', JSON.stringify(nextUser))
    setToken(nextToken)
    setUser(nextUser)
  }

  const login = async (email: string, password: string) => {
    const response = await api.post<{ token: string; user: User }>('/auth/login', { email, password })
    saveSession(response.data.token, response.data.user)
  }

  const register = async (name: string, email: string, password: string) => {
    const response = await api.post<{ token: string; user: User }>('/auth/register', { name, email, password })
    saveSession(response.data.token, response.data.user)
  }

  const logout = () => {
    storage?.removeItem('taskflow-token')
    storage?.removeItem('taskflow-user')
    setToken(null)
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, token, login, register, logout }}>{children}</AuthContext.Provider>
}
