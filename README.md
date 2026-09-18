# final-capstone

Base project scaffold for a static welcome page, a React + TypeScript single-page application, and an Express + TypeScript REST API backed by MongoDB.

## Project structure

```text
.
├── apps
│   ├── api
│   │   ├── src
│   │   └── tests
│   ├── static-page
│   │   └── tests
│   └── web
│       ├── src
│       └── tests
├── .github/workflows
├── docker-compose.yml
└── k8s
```

## Local setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start MongoDB locally before starting the API:
   ```bash
   docker compose up -d mongo
   ```
3. Copy the API environment template if you want to override defaults:
   ```bash
   cp apps/api/.env.example apps/api/.env
   ```
4. Start the React app:
   ```bash
   npm run dev:web
   ```
5. Start the API:
   ```bash
   npm run dev:api
   ```
6. Serve the static welcome page:
   ```bash
   npm run start:static
   ```

## Containers

Build and run the local stack with Docker Compose:

```bash
docker compose up --build
```

## Kubernetes / EKS

Starter manifests live in `/k8s` and include:

- namespace and shared API configuration
- an example secret manifest for the MongoDB connection string
- deployments and services for the static page, React SPA, and API
- an ingress resource with AWS Load Balancer Controller annotations suitable for EKS

## CI/CD

GitHub Actions workflows are included for:

- CI validation on pushes and pull requests
- container build/publish plus EKS deployment scaffolding
