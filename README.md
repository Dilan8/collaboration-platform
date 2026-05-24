# 🚀 CollabPlatform — Scalable Microservices on Kubernetes

**Cloud Automation Technologies**

A production-grade real-time collaboration platform built with Node.js microservices,
orchestrated with Kubernetes (Docker Desktop), backed by MongoDB, and featuring a
professional React frontend with real-time notifications.

---

## Table of Contents

- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Kubernetes Concepts Used](#kubernetes-concepts-used)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [ULO Achievement](#ulo-achievement)

---

## Architecture

```
React Frontend (localhost:5173)
        │
        │  All API calls go through Gateway
        ▼
API Gateway (localhost:30000)        ←── Single entry point
   ├── /api/users         → User Service (ClusterIP:3001)
   ├── /api/messages      → Messaging Service (ClusterIP:3002)
   └── /api/notifications → Notification Service (NodePort:30003)

User Service    ──┐
                  ├── MongoDB StatefulSet (ClusterIP:27017)
Messaging Service─┘
        │
        └── fires ──▶ Notification Service
                              │
                              └── SSE push ──▶ React Frontend (real-time)
```

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, React Router, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB (Kubernetes StatefulSet) |
| Containerisation | Docker |
| Orchestration | Kubernetes (Docker Desktop) |
| Real-time | Server-Sent Events (SSE) |
| Authentication | bcryptjs password hashing |

---

## Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| Docker Desktop | 4.x+ | Containers and Kubernetes |
| Node.js | 20+ | Local development |
| kubectl | Bundled with Docker Desktop | Kubernetes management |
| Git Bash | Any | Running shell scripts on Windows |

---

## Getting Started

### Option A — Docker Compose (Local Development)

Quickest way to run everything locally without Kubernetes.

```bash
docker-compose up --build
```

| Service | URL |
|---|---|
| React Frontend | http://localhost:5173 |
| API Gateway | http://localhost:3000 |
| User Service | http://localhost:3001 |
| Messaging Service | http://localhost:3002 |
| Notification Service | http://localhost:3003 |

---

### Option B — Kubernetes (Full Deployment)

#### Step 1 — Enable Kubernetes in Docker Desktop

```
Docker Desktop → Settings → Kubernetes → Enable Kubernetes → Apply & Restart
```

#### Step 2 — Set kubectl context

```bash
kubectl config use-context docker-desktop
```

#### Step 3 — Build and Deploy

```bash
bash build-and-deploy.sh
```

This will:
- Build Docker images for all 4 services
- Apply all Kubernetes manifests
- Wait for MongoDB StatefulSet to be ready
- Deploy all services
- Wait for all deployments to roll out

#### Step 4 — Run React Frontend

```bash
cd frontend
npm install
npm run dev
```

Open browser at `http://localhost:5173`

#### Step 5 — Teardown

```bash
bash teardown.sh
```

---

## Access Points (Kubernetes)

| Service | Type | URL |
|---|---|---|
| API Gateway | NodePort | http://localhost:30000 |
| Notification SSE | NodePort | http://localhost:30003 |
| React Frontend | Vite Dev Server | http://localhost:5173 |

---

## Kubernetes Concepts Used

### Namespace
All resources are isolated inside the `collaboration` namespace.

```bash
kubectl get all -n collaboration
```

### Deployments
All backend services run as Deployments with multiple replicas.

```bash
kubectl get deployments -n collaboration
```

### StatefulSet
MongoDB runs as a StatefulSet with persistent storage to ensure data survives pod restarts.

```bash
kubectl get statefulset -n collaboration
```

### Services
ClusterIP for internal service communication. NodePort for external access.

```bash
kubectl get services -n collaboration
```

### ConfigMap
All environment configuration stored centrally and injected into all services.

```bash
kubectl get configmap -n collaboration
kubectl describe configmap platform-config -n collaboration
```

### Secrets
Sensitive credentials stored as base64 encoded Kubernetes Secrets.

```bash
kubectl get secrets -n collaboration
```

### Horizontal Pod Autoscaler
Automatically scales API Gateway, Messaging Service, and User Service based on CPU usage.

```bash
kubectl get hpa -n collaboration
```

| Service | Min Replicas | Max Replicas | Scale Trigger |
|---|---|---|---|
| API Gateway | 2 | 5 | CPU > 70% |
| Messaging Service | 2 | 5 | CPU > 70% |
| User Service | 2 | 4 | CPU > 70% |

---

## Useful kubectl Commands

```bash
# Check all pods
kubectl get pods -n collaboration

# Watch pods in real time
kubectl get pods -n collaboration -w

# Check all services
kubectl get services -n collaboration

# Check HPA status
kubectl get hpa -n collaboration

# View logs
kubectl logs -f deployment/api-gateway -n collaboration
kubectl logs -f deployment/user-service -n collaboration
kubectl logs -f deployment/messaging-service -n collaboration
kubectl logs -f deployment/notification-service -n collaboration
kubectl logs -f statefulset/mongodb -n collaboration

# Describe a pod for debugging
kubectl describe pod <pod-name> -n collaboration

# Scale manually
kubectl scale deployment messaging-service --replicas=3 -n collaboration

# Port forward alternative to NodePort
kubectl port-forward svc/api-gateway 3000:3000 -n collaboration
kubectl port-forward svc/notification-service 3003:3003 -n collaboration

# Watch events
kubectl get events -n collaboration --sort-by='.lastTimestamp'

# Delete everything
bash teardown.sh
```

---

## API Reference

All requests go through the API Gateway on port 30000 (Kubernetes) or 3000 (Docker Compose).

### User Service `/api/users`

| Method | Endpoint | Description | Body |
|---|---|---|---|
| GET | `/api/users` | List all users | - |
| POST | `/api/users` | Register user | `{ username, email, password, displayName? }` |
| POST | `/api/users/login` | Login | `{ email, password }` |
| GET | `/api/users/:id` | Get user by ID | - |
| PUT | `/api/users/:id` | Update user | `{ username, displayName }` |
| DELETE | `/api/users/:id` | Delete user | - |

### Messaging Service `/api/messages`

| Method | Endpoint | Description | Body |
|---|---|---|---|
| GET | `/api/messages` | List messages | - |
| POST | `/api/messages` | Send message | `{ senderId, senderName, content, receiverId? }` |
| GET | `/api/messages/:id` | Get message | - |
| PATCH | `/api/messages/:id/read` | Mark as read | - |
| DELETE | `/api/messages/:id` | Delete message | - |

### Notification Service `/api/notifications`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/notifications` | List notifications |
| GET | `/notifications/stream` | SSE real-time stream |
| PATCH | `/api/notifications/:id/read` | Mark as read |
| DELETE | `/api/notifications/:id` | Delete notification |

---

## Project Structure

```
collaboration-platform/
│
├── api-gateway/                  # Single entry point, routes all requests
│   ├── src/
│   │   └── index.js              # Express proxy middleware
│   ├── package.json
│   ├── Dockerfile
│   └── .env
│
├── user-service/                 # User management microservice
│   ├── src/
│   │   ├── index.js              # Express server + MongoDB connection
│   │   ├── routes/
│   │   │   └── users.js          # Controller — CRUD + login routes
│   │   └── models/
│   │       └── User.js           # Mongoose schema + bcrypt hashing
│   ├── package.json
│   ├── Dockerfile
│   └── .env
│
├── messaging-service/            # Message handling microservice
│   ├── src/
│   │   ├── index.js              # Express server + MongoDB connection
│   │   ├── routes/
│   │   │   └── messages.js       # Controller — CRUD + notification trigger
│   │   └── models/
│   │       └── Message.js        # Mongoose schema
│   ├── package.json
│   ├── Dockerfile
│   └── .env
│
├── notification-service/         # Real-time notification microservice
│   ├── src/
│   │   └── index.js              # In-memory store + SSE push
│   ├── package.json
│   ├── Dockerfile
│   └── .env
│
├── frontend/                     # React application
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx     # Login and Register
│   │   │   ├── ChatPage.jsx      # Real-time global chat
│   │   │   ├── UsersPage.jsx     # Registered users list
│   │   │   ├── NotificationsPage.jsx  # Real-time notifications
│   │   │   └── HealthPage.jsx    # Service health dashboard
│   │   ├── components/
│   │   │   └── Layout.jsx        # Sidebar navigation wrapper
│   │   ├── services/
│   │   │   └── api.js            # All API calls centralised
│   │   ├── App.jsx               # Routes + SSE connection
│   │   └── index.css             # Global dark theme styles
│   ├── package.json
│   └── .env
│
├── k8s/                          # Kubernetes manifests
│   ├── namespace.yaml            # collaboration namespace
│   ├── configmap.yaml            # Environment configuration
│   ├── secrets.yaml              # Sensitive credentials
│   ├── hpa.yaml                  # Horizontal Pod Autoscaler
│   ├── mongodb/
│   │   └── deployment.yaml       # StatefulSet + headless service
│   ├── api-gateway/
│   │   └── deployment.yaml       # Deployment + NodePort service
│   ├── user-service/
│   │   └── deployment.yaml       # Deployment + ClusterIP service
│   ├── messaging-service/
│   │   └── deployment.yaml       # Deployment + ClusterIP service
│   └── notification-service/
│       └── deployment.yaml       # Deployment + NodePort service
│
├── docker-compose.yml            # Local development without Kubernetes
├── build-and-deploy.sh           # Build images + deploy to Kubernetes
├── teardown.sh                   # Remove all Kubernetes resources
└── README.md                     # This file
```

---

## ULO Achievement

### ULO1 — Cloud Computing Concepts
Demonstrated through practical implementation of Kubernetes abstractions including Pods, Services, Deployments, StatefulSets, ConfigMaps, and Secrets. The project shows how cloud infrastructure manages distributed applications.

### ULO2 — Kubernetes Deployment and Management
All services deployed using YAML manifests. Practical experience gained with Deployments, StatefulSets, Services, ConfigMaps, Secrets, and HPA. Health checks configured on all services using readiness and liveness probes.

### ULO3 — Evaluation of Cloud Impact
HPA demonstrates dynamic scaling under varying workloads. StatefulSet shows understanding of persistent data management. Microservices architecture demonstrates improved flexibility and fault tolerance compared to monolithic systems.

### ULO4 — DevOps Practices
Docker containerisation, Kubernetes configuration files, Git version control, modular service design, and environment separation via ConfigMaps and Secrets all reflect DevOps principles.

### ULO5 — Independent Research and Deployment
Independent implementation of SSE for real-time communication, bcrypt for security, Mongoose for data modelling, React for frontend, and troubleshooting of real deployment issues throughout the project.

---

## References

- Kubernetes Documentation: https://kubernetes.io/docs/
- MongoDB Documentation: https://www.mongodb.com/docs/
- Docker Documentation: https://docs.docker.com/
- Node.js Documentation: https://nodejs.org/en/docs/
- Express Documentation: https://expressjs.com/
- React Documentation: https://react.dev/