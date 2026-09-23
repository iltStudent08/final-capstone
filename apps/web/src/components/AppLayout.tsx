import { NavLink, Outlet, useNavigate } from 'react-router-dom'

import { useAuth } from '../context/useAuth'

export function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="app-frame">
      <aside className="sidebar">
        <a className="app-brand" href="/app/">
          <span className="brand-mark">T</span>
          <span>Taskflow</span>
        </a>
        <nav className="app-nav" aria-label="Application navigation">
          <NavLink to="/" end>Overview</NavLink>
          <NavLink to="/projects">Projects</NavLink>
          <NavLink to="/tasks">Tasks</NavLink>
        </nav>
        <div className="sidebar-footer">
          <div className="user-chip">
            <span className="avatar">{user?.name.slice(0, 1).toUpperCase()}</span>
            <span><strong>{user?.name}</strong><small>{user?.role}</small></span>
          </div>
          <button className="button button-quiet" onClick={handleLogout}>Log out</button>
        </div>
      </aside>
      <main className="workspace"><Outlet /></main>
    </div>
  )
}