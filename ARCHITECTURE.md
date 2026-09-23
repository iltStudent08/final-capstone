# Taskflow Architecture

## System Flow

```text
Browser
  |
  v
AWS ALB Ingress / Nginx web container
  |-- /       -> static landing page
  |-- /app/*  -> React SPA assets and client-side routes
  `-- /api/*  -> Express API service
                       |
                       v
                 MongoDB service + persistent volume
```

Locally, Docker Compose provides MongoDB, the API, and the combined web container. In EKS, the API and web Deployments run as separate services in the `final-capstone` namespace. The web Nginx container serves the landing page and React build and proxies API requests to the internal API service.

## Technology Stack

- Landing page: semantic HTML5 and responsive CSS
- Client: React 19, TypeScript, Vite, React Router, Axios
- API: Node.js, Express 5, TypeScript
- Persistence: MongoDB 8 and Mongoose 9
- Authentication: bcrypt password hashing and JWT bearer tokens
- Delivery: Docker multi-stage builds, Nginx, Kubernetes, AWS ECR/EKS, GitHub Actions

## Data Model

- `User`: name, unique email, hashed password, and `member` or `admin` role.
- `Project`: name, description, status, and an `owner` reference to `User`.
- `Task`: title, description, status, priority, due date, a `project` reference, an optional `assignee` reference to `User`, and a `createdBy` reference to `User`.

All schemas use timestamps. Mongoose validation enforces required fields, enum values, and string length limits. API responses populate the relevant user and project references for display.

## API and Authentication

Registration creates a hashed user record and returns a two-hour JWT. Login verifies the password and returns a JWT containing the user ID as the subject and the user role as a claim. The React Axios client stores the token locally and sends it as a bearer token. The API middleware rejects missing, invalid, or expired tokens.

The API uses separate routers for authentication, projects, tasks, and dashboard statistics. The error middleware maps duplicate keys and Mongoose validation errors to consistent JSON responses and returns a generic 500 response for unexpected failures.

## Containers

The API Dockerfile builds TypeScript in a Node 22 Alpine build stage, installs production dependencies in a clean runtime stage, and starts the compiled server. The web Dockerfile builds the Vite application and serves both the public landing files and `/app` assets from Nginx. Docker Compose connects the API to MongoDB using the service name `mongo` and exposes the web container at port 3000.

## Deployment Topology

The EKS deployment includes an API Deployment with two replicas and health probes, a web Deployment with two replicas and health probes, a MongoDB Deployment with a persistent volume claim, internal Services, a ConfigMap, and a Secret. The AWS Load Balancer Controller exposes the ingress. GitHub Actions authenticates to AWS with OIDC, publishes immutable commit-tagged images to ECR, applies manifests, and waits for rollouts.

Before production use, configure TLS on the ALB, resource requests and limits, MongoDB backup/availability strategy, and a managed secret rotation process.