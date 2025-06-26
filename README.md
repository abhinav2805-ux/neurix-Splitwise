# 🚀 Splitlyze: A Full-Stack Expense Splitting Application

Splitlyze is a full-stack, sci-fi themed web application designed to help users manage and split shared expenses within groups. It provides a clean, intuitive interface for tracking who paid for what, calculating balances, and settling debts. The project also includes an AI-powered assistant to answer questions about your expenses.

This application is built with a modern technology stack, containerized with Docker for easy setup, and features a complete CI/CD pipeline for automated testing and deployment.

---
##  System Design Architecture
![System Design Architecture](systemSplitwise.png)

---

## 🛠️ Technology Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Backend:** Python, FastAPI, SQLAlchemy
- **Database:** PostgreSQL
- **AI:** Groq API with Llama3
- **Containerization:** Docker, Docker Compose

---

## ⚡ Getting Started

You can run the application in three ways: with Docker (recommended), in production mode, or locally with Node/Python for development.

### 🧑‍💻 1. Local Development (No Docker)

This is for developers who want to run the frontend and backend directly on their machine.

**Prerequisites:**
- Node.js (v18+) and npm
- Python 3.11+
- PostgreSQL running locally (or use SQLite for quick testing)

**Setup:**
1. Clone the repository.
2. Set up environment files:
   - **Backend AI Key:** `server/.env`
     ```env
     GROQ_API_KEY=YOUR_GROQ_API_KEY
     DATABASE_URL=postgresql://postgres:password@localhost:5432/splitwise
     ```
     (Or use `sqlite:///splitwise.db` for quick local testing)
   - **Frontend API URL:** `client/.env`
     ```env
     VITE_API_BASE=http://localhost:8000
     ```
3. Install dependencies and run the backend:
   ```bash
   cd server
   pip install -r requirements.txt
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```
4. In a new terminal, install dependencies and run the frontend:
   ```bash
   cd client
   npm install
   npm run dev
   ```
- The frontend will be available at [http://localhost:5173](http://localhost:5173)
- The backend API will be available at [http://localhost:8000](http://localhost:8000)

### 🧑‍💻 2. Development Mode (Docker)

This is the recommended mode for local development, as it provides hot-reloading for both the frontend and backend.

**Prerequisites:**
- Docker and Docker Compose installed.

**Setup:**
1. Clone the repository.
2. Create the following environment files:
   - **Backend AI Key:** `server/.env`
     ```env
     GROQ_API_KEY=YOUR_GROQ_API_KEY
     ```
   - **Frontend API URL:** `client/.env`
     ```env
     VITE_API_BASE=http://localhost:8000
     ```
   - **Database credentials** are set by default in `docker-compose.yml` for development (see the file for details).
3. Run the application using Docker Compose:
   ```bash
   docker-compose up --build
   ```
- The frontend will be available at [http://localhost:5173](http://localhost:5173)
- The backend API will be available at [http://localhost:8000](http://localhost:8000)

### 🚢 3. Production Mode (Docker)

This mode uses optimized, multi-stage Docker builds to create lightweight images suitable for deployment.

**Prerequisites:**
- Docker and Docker Compose installed.

**Setup:**
1. Clone the repository.
2. Create the following environment files:
   - **Root .env** (for Docker Compose):
     ```env
     POSTGRES_DB=splitwise
     POSTGRES_USER=postgres
     POSTGRES_PASSWORD=password
     GROQ_API_KEY=YOUR_GROQ_API_KEY
     ```
   - **Frontend API URL:** `client/.env`
     ```env
     VITE_API_BASE=http://server:8000
     ```
     (Or set to your deployed backend URL)
3. Run the application using the production Docker Compose file:
   ```bash
   docker-compose -f docker-compose.prod.yml up --build
   ```
- The application will be served by Nginx on [http://localhost:80](http://localhost:80)

---

## 📚 API Documentation

> **Note:** This project does **not** include Swagger or ReDoc auto-generated docs. All API endpoints are documented below for your convenience.

### 👤 Users

- `POST /users`  
  ➡️ **Create a new user**  
  **Body:** `{ "name": "string" }`

- `GET /users`  
  ➡️ **List all users**

- `GET /users/{user_id}/balances`  
  ➡️ **Get a user's balance across all groups**

- `DELETE /users/{user_id}`  
  ➡️ **Delete a user**

---

### 👥 Groups

- `POST /groups`  
  ➡️ **Create a new group**  
  **Body:** `{ "name": "string", "user_ids": [1, 2, ...] }`

- `GET /groups`  
  ➡️ **List all groups (with members and total expenses)**

- `GET /groups/{group_id}`  
  ➡️ **Get details for a specific group**

- `DELETE /groups/{group_id}`  
  ➡️ **Delete a group**

- `POST /groups/{group_id}/expenses`  
  ➡️ **Add an expense to a group**  
  **Body:** `{ "description": "string", "amount": float, "paid_by": int, "split_type": "equal" | "percentage", "splits": [{ "user_id": int, "amount": float, "percentage": float }] }`

- `GET /groups/{group_id}/expenses`  
  ➡️ **List all expenses for a group**

- `GET /groups/{group_id}/balances`  
  ➡️ **Get current balance for each group member**

- `GET /groups/{group_id}/settle`  
  ➡️ **Get the simplest set of transactions to settle all debts in a group**

- `POST /groups/{group_id}/settleup`  
  ➡️ **Create settlement expenses to zero out all balances in a group**

---

### 🤖 Chatbot

- `POST /chatbot`  
  ➡️ **Ask a question to the AI assistant**  
  **Body:** `{ "query": "string" }`

---

## 📝 Assumptions

- **Database:** The application is configured to use PostgreSQL. For local development, a `splitwise.db` (SQLite) file might be created initially but is not used by the Docker setup.
- **AI Assistant:** The chatbot feature requires a valid API key from [Groq](https://groq.com/).
- **Environment:** The setup instructions assume a Unix-like environment (Linux, macOS, or WSL on Windows).
