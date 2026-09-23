import axios from 'axios'

export const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('taskflow-token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== '/app/login') {
      localStorage.removeItem('taskflow-token')
      localStorage.removeItem('taskflow-user')
      window.location.href = '/app/login'
    }
    return Promise.reject(error)
  },
)

export const getApiError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error ?? 'The request could not be completed.'
  }
  return 'The request could not be completed.'
}