import { useEffect, useState } from 'react'

import { getApiError, api } from '../lib/api'

type Dashboard = { projectCount: number; taskCount: number; projectsByStatus: { _id: string; count: number }[]; tasksByStatus: { _id: string; count: number }[]; recentTasks: { _id: string; title: string; status: string; project?: { name: string } }[] }

export function DashboardPage() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get<Dashboard>('/dashboard').then((response) => setDashboard(response.data)).catch((requestError) => setError(getApiError(requestError)))
  }, [])

  if (error) return <div className="page-state form-error">{error}</div>
  if (!dashboard) return <div className="page-state">Loading your overview...</div>

  return (
    <div className="page-content">
      <header className="page-header"><div><p className="eyebrow">Workspace overview</p><h1>Good work starts with a clear next step.</h1></div></header>
      <section className="metric-grid" aria-label="Project statistics">
        <article className="metric-card"><span>Projects</span><strong>{dashboard.projectCount}</strong><small>Across your workspace</small></article>
        <article className="metric-card metric-card-accent"><span>Tasks</span><strong>{dashboard.taskCount}</strong><small>Total work items</small></article>
        <article className="metric-card"><span>Open tasks</span><strong>{dashboard.tasksByStatus.filter((item) => item._id !== 'done').reduce((total, item) => total + item.count, 0)}</strong><small>Still in motion</small></article>
      </section>
      <section className="dashboard-grid">
        <article className="panel"><div className="panel-heading"><h2>Recent tasks</h2><span className="muted">Latest activity</span></div>{dashboard.recentTasks.length === 0 ? <p className="empty-state">No tasks yet. Create one to get moving.</p> : <ul className="task-list">{dashboard.recentTasks.map((task) => <li key={task._id}><span><strong>{task.title}</strong><small>{task.project?.name ?? 'No project'}</small></span><span className={`status status-${task.status}`}>{task.status}</span></li>)}</ul>}</article>
        <article className="panel"><div className="panel-heading"><h2>Task status</h2><span className="muted">Current mix</span></div><div className="status-bars">{dashboard.tasksByStatus.map((item) => <div className="status-row" key={item._id}><span>{item._id}</span><div><i style={{ width: `${dashboard.taskCount ? (item.count / dashboard.taskCount) * 100 : 0}%` }} /></div><strong>{item.count}</strong></div>)}</div></article>
      </section>
    </div>
  )
}