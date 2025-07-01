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

.github/workflows/ci.yml:

name: CI/CD

on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: 3.11

      - name: Install backend dependencies
        working-directory: ./backend
        run: |
          python -m venv venv
          source venv/bin/activate
          pip install -r requirements.txt

      - name: Run backend tests
        working-directory: ./backend
        run: |
          source venv/bin/activate
          pytest

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18

      - name: Install frontend dependencies
        working-directory: ./frontend
        run: npm install

      - name: Build frontend
        working-directory: ./frontend
        run: npm run build

