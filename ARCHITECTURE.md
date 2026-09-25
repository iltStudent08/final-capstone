# Taskflow Architecture

## AWS Request and Data Flow

The production deployment runs in Amazon EKS. The Kubernetes AWS Load Balancer Controller creates an internet-facing Application Load Balancer (ELB) from the Ingress resource. The ALB sends traffic to pod IPs through the Kubernetes Services because the Ingress uses `target-type: ip`.

Live application: [http://a794b709ac78d482196544e09b62ec7c-237943726.us-east-1.elb.amazonaws.com/](http://a794b709ac78d482196544e09b62ec7c-237943726.us-east-1.elb.amazonaws.com/)

```text
                  Internet
                    |
                    v
              AWS Application Load Balancer
                (internet-facing ELB)
                    |
                    v
          Kubernetes Ingress: final-capstone-ingress
              namespace: final-capstone
                /                 \
               /                   \
         /api/*                         /*
           |                             |
           v                             v
  final-capstone-api Service       final-capstone-web Service
       ClusterIP:4000                     port 80
           |                             |
           v                             v
    API Pod 1 / API Pod 2          Web Pod 1 / Web Pod 2
     Node.js + Express              Nginx static server
           |                       |       |
           |                       |       +--> / landing page
           |                       +----------> /app React SPA
           |                               (client-side routes)
           v
  final-capstone-mongodb Service
          port 27017
           |
           v
     MongoDB Pod (one replica)
           |
           v
  PersistentVolumeClaim (5 GiB, gp2)
```

### Request lifecycle

1. A browser sends an HTTP request to the ALB endpoint. TLS is not configured in the current Ingress manifest, so HTTPS requires adding an ACM certificate and ALB TLS annotations.
2. The ALB forwards the request to the EKS Ingress. Requests beginning with `/api` go to `final-capstone-api`; all other requests go to `final-capstone-web`.
3. The web Nginx pod serves the static landing page at `/` and the Vite-built React application under `/app`. React Router handles navigation after the SPA loads.
4. The API pods run the Express application on port 4000. Authentication requests create or verify JWTs; protected requests include the token in the `Authorization: Bearer` header.
5. API pods connect to MongoDB using the internal DNS name `final-capstone-mongodb`. MongoDB stores users, projects, and tasks on the PVC mounted at `/data/db`.
6. Kubernetes readiness and liveness probes remove unhealthy API or web pods from service and allow the Deployments to replace them.

The current web Nginx configuration also contains an internal `/api/` proxy to `final-capstone-api:4000`. In the EKS Ingress path above, `/api` is routed directly to the API Service before it reaches Nginx. Because Docker Compose names the API container `api` rather than `final-capstone-api`, the Nginx proxy target must be made environment-specific (or given a matching network alias) for `/api` requests to work through the local client container.

## Technology Stack

- Landing page: semantic HTML5 and responsive CSS
- Client: React 19, TypeScript, Vite, React Router, Axios
- API: Node.js, Express 5, TypeScript
- Persistence: MongoDB 8 and Mongoose 9
- Authentication: bcrypt password hashing and JWT bearer tokens
- Delivery: Docker multi-stage builds, Nginx, Kubernetes, AWS ECR/EKS, AWS Load Balancer Controller, GitHub Actions
- Cluster resources: Deployments, ClusterIP Services, an internet-facing ALB Ingress, ConfigMap, Secret, and a gp2-backed PersistentVolumeClaim

## Data Model

- `User`: name, unique email, hashed password, and `member` or `admin` role.
- `Project`: name, description, status, and an `owner` reference to `User`.
- `Task`: title, description, status, priority, due date, a `project` reference, an optional `assignee` reference to `User`, and a `createdBy` reference to `User`.

All schemas use timestamps. Mongoose validation enforces required fields, enum values, and string length limits. API responses populate the relevant user and project references for display.

## API and Authentication

Registration creates a hashed user record and returns a two-hour JWT. Login verifies the password and returns a JWT containing the user ID as the subject and the user role as a claim. The React Axios client stores the token locally and sends it as a bearer token. The API middleware rejects missing, invalid, or expired tokens.

The API uses separate routers for authentication, projects, tasks, and dashboard statistics. The error middleware maps duplicate keys and Mongoose validation errors to consistent JSON responses and returns a generic 500 response for unexpected failures.

## Containers

The API Dockerfile builds TypeScript in a Node 20 Alpine build stage, installs production dependencies in a clean runtime stage, and starts the compiled server. The web Dockerfile builds the Vite application and serves both the public landing files and `/app` assets from Nginx. Docker Compose connects the API to MongoDB using the service name `mongo` and exposes the web container at port 3000.

## Local Docker Compose Flow

```text
Browser :3000
  |
  v
client container (Nginx)
  |-- /       -> landing page
  |-- /app/*  -> React SPA
  `-- /api/*  -> api:4000
             |
             v
          mongo:27017
             |
             v
          mongo-data volume
```

Compose exposes the API separately on port 4000 for development, but the browser normally reaches it through the Nginx client container. The API uses `mongodb://mongo:27017/final-capstone`; Kubernetes uses the MongoDB Service DNS name instead.

## Deployment Topology

The EKS deployment includes an API Deployment with two replicas and health probes, a web Deployment with two replicas and health probes, a single MongoDB Deployment with a persistent volume claim, internal Services, a ConfigMap, and a Secret. The AWS Load Balancer Controller exposes the Ingress as an internet-facing ALB. The web Service is also declared as a `LoadBalancer` Service in the current manifest; the Ingress is the intended path for `/` and `/api` traffic, so this Service type can create an additional cloud load balancer and may be changed to `ClusterIP` to avoid duplicate public entry points.

## Build and Release Flow

```text
Developer push
  |
  v
GitHub Actions CI
  install -> lint -> test -> build
  |
  v
GitHub Actions CD (OIDC)
  |
  +--> Build API image  -> Amazon ECR
  +--> Build web image  -> Amazon ECR
  |
  v
kubectl apply manifests to EKS
  |
  v
Rolling Deployments -> readiness checks -> updated pods receive traffic
```

The CD workflow builds and pushes immutable commit-SHA image tags, but the checked-in deployment manifests currently reference `latest` rather than the `REPLACE_WITH_*` placeholders expected by the workflow. The manifests and workflow must be aligned before the cluster will reliably deploy the exact image built by each release.

Before production use, configure TLS on the ALB, resource requests and limits, MongoDB backup/availability strategy, and a managed secret rotation process.