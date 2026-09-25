# Taskflow

Taskflow is a full-stack project task tracker. Teams can register, create projects, manage tasks, update task status, and review dashboard statistics.

## Features

- Custom HTML/CSS landing page at `/`
- React + TypeScript application at `/app/`
- JWT registration, login, logout, and protected routes
- Project and Task CRUD backed by MongoDB and Mongoose
- Project/User and Task/Project/User references with ownership checks
- Dashboard counts, status aggregations, and recent tasks
- Docker Compose for local services
- Kubernetes manifests and GitHub Actions deployment scaffolding for EKS

## Project Structure

```text
apps/
  api/                 Express + TypeScript + Mongoose service
    src/models/        User, Project, and Task schemas
    src/routes/        auth, projects, tasks, and dashboard routes
  web/                 React + TypeScript + Vite client
    public/             root landing page served by Nginx
k8s/                   EKS manifests
.github/workflows/     CI and CD workflows
docker-compose.yml     local MongoDB, API, and web stack
ARCHITECTURE.md        system and deployment overview
```

## Local Development

Prerequisites: Node.js 20, npm, and Docker Desktop.

```bash
npm ci
cp apps/api/.env.example apps/api/.env
docker compose up --build
```

Open `http://localhost:3000/` for the landing page and `http://localhost:3000/app/` for the application. The API is available through `http://localhost:3000/api`; its health endpoint is `GET /api/health`.

For separate development processes, start MongoDB with `docker compose up -d mongo`, then run `npm run dev:api` and `npm run dev:web`. The Vite development server serves the React client; the production path contract is `/app/`.

## API Routes

| Method | Route | Purpose | Auth |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Create a user and return a JWT | No |
| POST | `/api/auth/login` | Authenticate and return a JWT | No |
| GET | `/api/projects` | List projects | Yes |
| POST | `/api/projects` | Create a project | Yes |
| GET/PUT/DELETE | `/api/projects/:id` | Read, update, or delete a project | Yes |
| GET | `/api/tasks` | List tasks, optionally filtered by project | Yes |
| POST | `/api/tasks` | Create a task | Yes |
| GET/PUT/DELETE | `/api/tasks/:id` | Read, update, or delete a task | Yes |
| GET | `/api/dashboard` | Return aggregate project/task statistics | Yes |

Write operations are protected by JWT middleware. Project and task mutations enforce ownership unless the authenticated user has the `admin` role. Errors use JSON responses with an `error` field.

## Quality Checks

```bash
npm run lint
npm test
npm run build
```

## AWS / EKS

The deployment workflow builds API and web images, pushes them to ECR, creates the Kubernetes secret, applies the manifests, and waits for API and web rollouts. Configure these GitHub values before enabling CD:

- `AWS_REGION` and `EKS_CLUSTER_NAME` repository variables
- `AWS_ROLE_TO_ASSUME` repository secret for GitHub OIDC
- `MONGODB_URI` and `JWT_SECRET` repository secrets
- `CLIENT_ORIGIN` in `k8s/configmap.yaml`
- `storageClassName` in `k8s/mongodb-deployment.yaml` for the target cluster

The ALB ingress routes `/api` to the API service and all other traffic to the web service. Configure an ACM certificate and HTTPS listener before exposing production traffic.

Live application: [http://a794b709ac78d482196544e09b62ec7c-237943726.us-east-1.elb.amazonaws.com/](http://a794b709ac78d482196544e09b62ec7c-237943726.us-east-1.elb.amazonaws.com/)

## Team

Members:
Kris Penn
Suyash Tiwari
