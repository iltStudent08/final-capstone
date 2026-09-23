import { useEffect, useState } from 'react'

import { api, getApiError } from '../lib/api'

type Project = { _id: string; name: string }
type Task = { _id: string; title: string; status: string; priority: string; project?: Project }

export function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [title, setTitle] = useState('')
  const [project, setProject] = useState('')
  const [priority, setPriority] = useState('medium')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { Promise.all([api.get<Task[]>('/tasks'), api.get<Project[]>('/projects')]).then(([taskResponse, projectResponse]) => { setTasks(taskResponse.data); setProjects(projectResponse.data); if (projectResponse.data[0]) setProject(projectResponse.data[0]._id) }).catch((requestError) => setError(getApiError(requestError))).finally(() => setLoading(false)) }, [])

  const createTask = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try { const response = await api.post<Task>('/tasks', { title, project, priority }); setTasks((current) => [response.data, ...current]); setTitle('') } catch (requestError) { setError(getApiError(requestError)) }
  }
  const updateStatus = async (task: Task, status: string) => {
    try { const response = await api.put<Task>(`/tasks/${task._id}`, { status }); setTasks((current) => current.map((item) => item._id === task._id ? response.data : item)) } catch (requestError) { setError(getApiError(requestError)) }
  }
  const deleteTask = async (id: string) => { try { await api.delete(`/tasks/${id}`); setTasks((current) => current.filter((task) => task._id !== id)) } catch (requestError) { setError(getApiError(requestError)) } }

  return <div className="page-content"><header className="page-header"><div><p className="eyebrow">Make progress visible</p><h1>Tasks</h1></div></header><div className="resource-layout"><form className="panel form-stack" onSubmit={createTask}><h2>Add a task</h2><label>Task title<input value={title} onChange={(event) => setTitle(event.target.value)} required minLength={2} /></label><label>Project<select value={project} onChange={(event) => setProject(event.target.value)} required><option value="" disabled>Select a project</option>{projects.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select></label><label>Priority<select value={priority} onChange={(event) => setPriority(event.target.value)}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label><button className="button button-primary" disabled={!projects.length}>Create task</button></form><section className="panel"><div className="panel-heading"><h2>Work queue</h2><span className="muted">{tasks.length} total</span></div>{error && <p className="form-error">{error}</p>}{loading ? <p className="empty-state">Loading tasks...</p> : tasks.length === 0 ? <p className="empty-state">No tasks yet.</p> : <ul className="resource-list">{tasks.map((task) => <li key={task._id}><div><strong>{task.title}</strong><p>{task.project?.name ?? 'No project'} · {task.priority} priority</p></div><div className="resource-actions"><select aria-label={`Status for ${task.title}`} value={task.status} onChange={(event) => void updateStatus(task, event.target.value)}><option value="todo">To do</option><option value="in-progress">In progress</option><option value="done">Done</option></select><button className="button button-danger" onClick={() => void deleteTask(task._id)}>Delete</button></div></li>)}</ul>}</section></div></div>
}