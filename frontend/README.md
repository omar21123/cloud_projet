# 🛡️ Project Frontend (SecOps Edition)

Welcome to the **frontend repository**.  
This project is fully containerized to guarantee consistency across **development, testing, and production**. By adopting a Docker‑based workflow, we eliminate the classic *“works on my machine”* bugs and enforce a strict boundary between application logic and infrastructure.

---

## 🐳 Infrastructure & Docker Setup

We use a **dual‑Dockerfile strategy** to separate the **Development Experience (DX)** from **Production Reality**.  
This balances developer agility with hardened, secure production artifacts.

### 1. Why Two Dockerfiles?

**`Dockerfile.dev` (Development Environment)**  
- **Goal**: Speed of coding & rapid iteration.  
- **Mechanism**: Source code is mounted (not copied) into the container. Full Node.js runtime supports build tools, linters, and debuggers.  
- **Key Feature**: Hot Reloading — changes on your host are instantly reflected in the container.  
- **Base Image**: `node:18-alpine` for fast pulls and lockfile compatibility.  

**`Dockerfile` (Production Build)**  
- **Goal**: Performance, security, immutability.  
- **Mechanism**: Multi‑stage build.  
  - **Stage 1 (Builder)**: Installs dependencies, compiles React into optimized static assets.  
  - **Stage 2 (Runner)**: Copies only compiled assets into a lightweight Nginx container.  
- **Security Benefit**: Node.js/npm removed → smaller attack surface, no runtime exploits.  
- **Performance**: Nginx excels at serving static files with compression and caching.  

---

### 2. Nginx Configuration Strategy

**The SPA Problem**: Single Page Apps (React) handle routing client‑side. Refreshing `/dashboard` would normally cause a 404.  

**The Solution (`nginx-internal.conf`)**:  
Implements **History API Fallback** — intercepts 404s and serves `index.html`. React Router then renders the correct view seamlessly.

---

## 🚀 How to Run

### Method A: Traditional (Node.js required)
Run directly on your host machine.  
```bash
# Install dependencies
npm install

# Start local dev server at localhost:3000
npm start
```

### Method B: Docker (Recommended)
Run in an isolated container environment for consistency.

**Development Mode**  
```bash
# Build dev image
docker build -f frontend/Dockerfile.dev -t my-app-dev .

# Run with hot reload
docker run -p 3000:3000 \
  -v $(pwd)/frontend:/app \
  -v /app/node_modules \
  my-app-dev
```

**Production Mode**  
```bash
# Build production image
docker build -f frontend/Dockerfile -t my-app-prod .

# Run Nginx container (port 80)
docker run -p 80:80 my-app-prod
```

---

## 📂 File Structure Overview
- `frontend/nginx-internal.conf` → Nginx ruleset for SPA routing.  
- `frontend/Dockerfile.dev` → Mutable dev environment (hot reload).  
- `frontend/Dockerfile` → Immutable multi‑stage production build.  

---
