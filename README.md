# 📝 TaskNest

**TaskNest** is a full-stack productivity app that helps you manage your life — tasks, notes, journal entries, calendar view, and Pomodoro timer, all in one beautiful interface. Built with a Flask backend and a modern React frontend, it supports JWT-based authentication and is fully Dockerized for easy deployment.

🚀 Features

🔐 JWT Auth with secure login

✅ Task creation, completion, and filtering (user-specific)

📝 Notes and Journal with Edit/Delete support

🗕️ Calendar View

⏱️ Pomodoro Timer with Start/Pause

🌗 Dark Mode toggle (persists via localStorage)

🛣️ Docker + Docker Compose support

🔁 GitHub Actions-based CI/CD


🧱 Tech Stack

Layer                 Tech

Frontend     React (Vite), Axios, date-fns

Backend      Flask, SQLAlchemy, JWT

Database     SQLite (dev)

DevOps       Docker, Docker Compose, GitHub Actions


📦 Getting Started (Docker)

Clone and spin up both frontend and backend in containers:

git clone https://github.com/SparshaPrakash/tasknest-app
cd TaskNest

# Start all services
docker compose up --build

Frontend: http://localhost:5173

Backend API: http://localhost:5000

⚙️ Local Development (Hot Reload)

Backend:

cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py

Frontend:

cd frontend
npm install
npm run dev

🐳 Docker Notes (Frontend Dev)

For active development with platform-specific binaries:

docker-compose.yml:

services:
  frontend:
    build:
      context: ./frontend
    volumes:
      - ./frontend:/app
      - frontend_node_modules:/app/node_modules
    ports:
      - "5173:5173"
    command: npm run dev

volumes:
  frontend_node_modules:

🔁 CI/CD – GitHub Actions

This project includes a GitHub Actions pipeline that:

Installs backend dependencies and runs tests

Installs frontend packages and builds production assets

-------------
## 🚀 Live Setup (via Docker Pull)

You can run the app from anywhere without cloning or building! Just pull and run the Docker images:

### 🔧 Run Backend:

```bash
docker pull ghcr.io/sparshaprakash/tasknest-backend:latest
docker run -p 5000:5000 ghcr.io/sparshaprakash/tasknest-backend:latest
```

### 🔧 Run Frontend:

```bash
docker pull ghcr.io/sparshaprakash/tasknest-frontend:latest
docker run -p 3000:3000 ghcr.io/sparshaprakash/tasknest-frontend:latest
```

---

## 🧪 Testing

```bash
cd backend
pip install -r requirements.txt
pytest
flake8 .
```

Includes unit tests for `/login` and route availability.

---

## 🔄 CI/CD Pipeline

- ✅ GitHub Actions for automated testing + linting
- ✅ Builds & pushes backend/frontend Docker images
- ✅ Publishes to GitHub Container Registry (GHCR)

Workflow file: `.github/workflows/ci.yml`

---

## 🐳 Docker Build (if you want to build manually)

```bash
# Backend
cd backend
docker build -t tasknest-backend .
docker run -p 5000:5000 tasknest-backend

# Frontend
cd frontend
docker build -t tasknest-frontend .
docker run -p 3000:3000 tasknest-frontend