const sections = [
  {
    title: 'React + TypeScript SPA',
    description: 'The browser application shell lives in apps/web and is ready for feature development.',
  },
  {
    title: 'Express + TypeScript API',
    description: 'The API service exposes starter routes and a MongoDB connection bootstrap in apps/api.',
  },
  {
    title: 'Platform Tooling',
    description: 'Docker, Kubernetes manifests for EKS, and GitHub Actions workflows are provided at the repo root.',
  },
]

function App() {
  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">Single-page application</p>
        <h1>Final Capstone Web Client</h1>
        <p className="summary">
          This setup-only React starter keeps the initial frontend footprint small while establishing the
          structure needed for future pages, state management, and API integration.
        </p>
      </section>

      <section className="feature-grid" aria-label="Project foundations">
        {sections.map((section) => (
          <article key={section.title} className="feature-card">
            <h2>{section.title}</h2>
            <p>{section.description}</p>
          </article>
        ))}
      </section>
    </main>
  )
}

export default App
