import { useEffect, useState } from 'react'

import { api, getApiError } from '../lib/api'

type Project = { _id: string; name: string; description?: string; status: string }

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const loadProjects = () => api.get<Project[]>('/projects').then((response) => setProjects(response.data)).catch((requestError) => setError(getApiError(requestError))).finally(() => setLoading(false))
  useEffect(() => { void loadProjects() }, [])

  const createProject = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      const response = await api.post<Project>('/projects', { name, description })
      setProjects((current) => [response.data, ...current])
      setName('')
      setDescription('')
    } catch (requestError) { setError(getApiError(requestError)) }
  }

  const deleteProject = async (id: string) => {
    try { await api.delete(`/projects/${id}`); setProjects((current) => current.filter((project) => project._id !== id)) } catch (requestError) { setError(getApiError(requestError)) }
  }

  return <div className="page-content"><header className="page-header"><div><p className="eyebrow">Organize the work</p><h1>Projects</h1></div></header><div className="resource-layout"><form className="panel form-stack" onSubmit={createProject}><h2>Start a project</h2><label>Name<input value={name} onChange={(event) => setName(event.target.value)} required minLength={2} /></label><label>Description<textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} /></label><button className="button button-primary">Create project</button></form><section className="panel"><div className="panel-heading"><h2>All projects</h2><span className="muted">{projects.length} total</span></div>{error && <p className="form-error">{error}</p>}{loading ? <p className="empty-state">Loading projects...</p> : projects.length === 0 ? <p className="empty-state">Your project list is empty.</p> : <ul className="resource-list">{projects.map((project) => <li key={project._id}><div><strong>{project.name}</strong><p>{project.description || 'No description yet.'}</p></div><div className="resource-actions"><span className={`status status-${project.status}`}>{project.status}</span><button className="button button-danger" onClick={() => void deleteProject(project._id)}>Delete</button></div></li>)}</ul>}</section></div></div>
}