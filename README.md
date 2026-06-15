# AI Quiz Generator

A full-stack web application that allows instructors to generate learning-aligned, scenario-based quiz questions using OpenAI.

## Tech Stack
- **Frontend**: React + Vite + Vanilla CSS (Supabase-inspired clean light theme)
- **Backend**: Python + FastAPI
- **AI**: OpenAI API (gpt-4o-mini) utilizing Pydantic for Structured Outputs

## How to Run Locally

### 1. Start the Backend (The Brain)
1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Create a virtual environment and activate it (Mac/Linux):
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install the required Python libraries:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file inside the `backend` folder and add your OpenAI API Key:
   ```env
   OPENAI_API_KEY=sk-your-api-key-here
   ```
5. Start the FastAPI server:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```
   *The backend is now running at `http://localhost:8000`.*

### 2. Start the Frontend (The Face)
1. Open a **new** terminal window and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install the required Node packages:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your web browser and go to: **http://localhost:5173**
