import { Navigate, Route, Routes } from 'react-router-dom'

import { AppLayout } from './components/AppLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { useAuth } from './context/useAuth'
import { AuthPage } from './pages/AuthPage'
import { DashboardPage } from './pages/DashboardPage'
import { ProjectsPage } from './pages/ProjectsPage'
import { TasksPage } from './pages/TasksPage'

function App() {
  const { token } = useAuth()
  return <Routes>
    <Route path="/login" element={token ? <Navigate to="/" replace /> : <AuthPage mode="login" />} />
    <Route path="/register" element={token ? <Navigate to="/" replace /> : <AuthPage mode="register" />} />
    <Route element={<ProtectedRoute />}>
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/tasks" element={<TasksPage />} />
      </Route>
    </Route>
    <Route path="*" element={<Navigate to={token ? '/' : '/login'} replace />} />
  </Routes>
}

export default App
