# 📝 TaskNest

**TaskNest** is a full-stack productivity app that helps you manage your life — tasks, notes, journal entries, calendar view, and Pomodoro timer — all in one beautiful interface.

Built with a **Flask** backend and **React** frontend, it supports **JWT-based authentication** and is fully **Dockerized** for easy deployment and CI/CD automation.

---

## 🚀 Features

- 🔐 JWT Auth with secure login
- ✅ Task creation, completion, and filtering (user-specific)
- 📝 Notes and Journal with Edit/Delete support
- 📆 Calendar View
- ⏱️ Pomodoro Timer with Start/Pause
- 🌗 Dark Mode toggle (persists via `localStorage`)
- 🐳 Docker + Docker Compose support
- 🔁 GitHub Actions-based CI/CD pipeline

---

## 🧱 Tech Stack

| Layer      | Technologies                           |
|------------|----------------------------------------|
| Frontend   | React (Vite), Axios, date-fns          |
| Backend    | Flask, SQLAlchemy, PyJWT               |
| Database   | SQLite (for development)               |
| DevOps     | Docker, Docker Compose, GitHub Actions |

---

## 📦 Getting Started (with Docker)

Clone the repo and start the app using Docker:

git clone https://github.com/SparshaPrakash/tasknest-app
cd TaskNest

# Start all services (frontend + backend)
docker compose up --build

Frontend: http://localhost:5173

Backend API: http://localhost:5000

-------------------------
⚙️ Local Development (Hot Reload)
Backend

cd backend
python3 -m venv venv
source venv/bin/activate     # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python app.py

Frontend
cd frontend
npm install
npm run dev

--------------------------------------
🐳 Frontend Docker (for Live Dev)
For active frontend development with binary compatibility:
ci.yml:

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

--------------------------------------------------
🔁 CI/CD – GitHub Actions
This project includes a CI/CD pipeline that:

✅ Installs backend dependencies & runs unit tests

✅ Lints code with flake8

✅ Builds Docker images for frontend & backend

✅ Pushes images to GitHub Container Registry (GHCR)

Workflow file: .github/workflows/ci.yml

----------------------------------------------------------

🚀 Live Deployment via Docker Pull
Run the app anywhere without building locally — just pull and run:

Backend
docker pull ghcr.io/sparshaprakash/tasknest-backend:latest
docker run -p 5000:5000 ghcr.io/sparshaprakash/tasknest-backend:latest

Frontend
docker pull ghcr.io/sparshaprakash/tasknest-frontend:latest
docker run -p 3000:3000 ghcr.io/sparshaprakash/tasknest-frontend:latest

--------------------------------------------------------------
🧪 Testing & Linting
From the backend/ folder:

pip install -r requirements.txt
pytest       # Run tests
flake8 .     # Run linter

