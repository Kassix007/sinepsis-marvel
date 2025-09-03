## MDX Hackathon 2025 winner
**Dive into the Marvel Universe with our multi-service application!** This project brings together the power of modern web technologies to create an immersive experience inspired by your favorite heroes and villains.

## ✨ Features

*   **Dynamic Frontend:** A responsive and interactive user interface built with Node.js.
*   **Robust Backend:** A high-performance Go API handling core logic and data.
*   **Intelligent AI Service:** A Python FastAPI service for AI-powered interactions and utilities.
*   **Engaging Game:** A separate Node.js game module for interactive fun.
*   **Scalable Architecture:** Designed with microservices for flexibility and easy expansion.

## 🚀 Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Ensure you have the following software installed on your system:

*   **Node.js**: `v18+` (LTS recommended) - [Download Node.js](https://nodejs.org/)
*   **Go**: `v1.21+` - [Download Go](https://go.dev/doc/install)
*   **Python**: `3.10+` - [Download Python](https://www.python.org/downloads/)
*   **pip**: Python package installer (usually comes with Python)

### Installation

Follow these steps to get your development environment set up:

1.  **Clone the Repository:**

    ```bash
    git clone https://github.com/ieeemumsb/Sinepsis.git
    cd Sinepsis
    ```

2.  **Install Node.js Dependencies (Frontend & Game):**

    ```bash
    # For the main frontend application
    cd frontend
    npm install

    # For the separate game module
    cd ../game
    npm install
    ```

3.  **Install Go Dependencies (Backend Service):**

    ```bash
    cd ../backend
    go mod tidy
    ```

4.  **Install Python Dependencies (FastAPI Service):**

    ```bash
    cd ../RAGService # Assuming RAGService is the directory for your FastAPI app
    pip install -r requirements.txt
    ```

## ▶️ Running the Services

To bring the Marvel Project to life, you'll need to start each service individually.

### Node.js Frontend

```bash
cd frontend
npm run dev
```

*   **Access at:** `http://localhost:3000`

### Go Backend

```bash
cd backend-go # Or just 'backend' if that's the correct directory name
go run cmd/server/main.go
```

*   **Access at:** `http://localhost:8080`

### FastAPI Backend

```bash
cd RAGService # Or 'backend-fastapi' if that's the correct directory name
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

*   **Access at:** `http://localhost:8000` (Note: Your quick launch script uses port 8000, but your description initially listed 5410. I've standardized to 8000 for consistency with the script.)

### Game

```bash
cd game
npm run dev # Or 'npm start' depending on your package.json scripts
```

*   **Access at:** `http://localhost:5173` (Vite's default port, adjust if different)

---

## ⚡ Quick Launch Script (Windows)

For convenience, you can use this batch script to start all services simultaneously on Windows.

1.  Create a file named `start_all.bat` in the root of your `Sinepsis` project directory.
2.  Paste the following content into the file:

    ```bat
    @echo off
    echo 🚀 Starting Marvel Project Services...

    echo Starting Frontend (Node.js)...
    start cmd /k "cd frontend && npm run dev"

    echo Starting Go Backend...
    start cmd /k "cd backend && go run cmd/server/main.go"

    echo Starting FastAPI Backend...
    start cmd /k "cd RAGService && uvicorn app.main:app --reload --port 8000"

    echo Starting Game (Node.js/Vite)...
    start cmd /k "cd game && npm run dev"

    echo.
    echo All services initiated! Check individual command prompts for status.
    echo Press any key to close this launcher window.
    pause > nul
    ```

3.  Double-click `start_all.bat` to launch all services.

## 🌐 Project Architecture

Our project adopts a microservices architecture, promoting modularity and scalability.

```mermaid
flowchart LR
    A[Frontend (Node.js)] -->|"REST / GraphQL API Calls"| B[Go Backend]
    A -->|"AI / Utility API Calls"| C[FastAPI Service]
    B -->|"Data Persistence"| D[(Database)]
    C -->|"AI Model / Data Processing"| D
    A -->|"WebSockets / Game Logic"| E[Game (Node.js/Vite)]
```

*   **Frontend (Node.js/Next.js):** The user-facing application, consuming APIs from both backends.
*   **Go Backend:** Handles core business logic, user authentication, mission management, and interacts with the database.
*   **FastAPI Service (Python AI/Utility):** Provides intelligent features, potentially including natural language processing, character data retrieval, or other AI-driven utilities.
*   **Game (Node.js/Vite):** A separate interactive game experience, likely communicating with the backend for scores, user data, etc.
*   **Database:** Stores persistent data for the application, such as user profiles, mission details, hero information, and game states.

## 📖 API Endpoints (Sample)

### Go Backend (`http://localhost:8080`)

*   `GET /healthz`: Health check endpoint. Returns `200 OK` if the service is running.
*   `POST /missions`: Create a new Marvel mission.
    *   **Body:** `{ "title": "...", "description": "...", "hero_id": "..." }`
*   `GET /missions/{id}`: Retrieve details for a specific mission.

### FastAPI Backend (`http://localhost:8000`)

*   `POST /chat`: AI-powered assistant for Marvel-related queries.
    *   **Body:** `{ "message": "What can you tell me about Iron Man?" }`
*   `GET /heroes`: Retrieve a list of Marvel heroes.
    *   **Query Params:** `?limit=10&offset=0`
*   `GET /heroes/{id}`: Get detailed information about a specific hero.

## 🤝 Contributing

We welcome contributions to the Marvel Project! If you'd like to contribute, please follow these steps:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/AmazingFeature`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
5.  Push to the branch (`git push origin feature/AmazingFeature`).
6.  Open a Pull Request.

Please ensure your code adheres to the existing style and conventions.


**Developed with 💙 by Sinepsis**
