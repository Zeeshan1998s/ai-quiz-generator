from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import openai
import os
from dotenv import load_dotenv

# 1. SETUP & CONFIGURATION
# Load environment variables (like our secret OPENAI_API_KEY) from the .env file
load_dotenv()

# Initialize the OpenAI client so we can talk to the AI model
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Create the FastAPI application instance. This is the core of our backend server.
app = FastAPI(title="AI Quiz Generator API")

# 2. CORS (Cross-Origin Resource Sharing)
# This allows our React frontend (running on a different port) to talk to this Python backend.
# Without this, the browser would block the requests for security reasons.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow requests from any origin (good for local dev)
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# 3. DATA MODELS (Pydantic)
# These classes define the EXACT structure of the data we expect to receive and send.
# This prevents errors and forces the AI to reply in a predictable format.

# What we expect to receive FROM the React frontend
class QuizRequest(BaseModel):
    course: str
    topic: str
    difficulty: str
    num_questions: int
    question_type: str

# What we expect the AI to generate for a single question
class Question(BaseModel):
    # 'Field' provides descriptions to the AI so it knows exactly what to generate
    question: str = Field(description="The text of the quiz question")
    options: Optional[List[str]] = Field(description="List of possible options. Leave empty if short answer.")
    correct_answer: str = Field(description="The correct answer from the options, or the ideal short answer.")
    explanation: str = Field(description="Detailed explanation of why the answer is correct.")
    difficulty: str = Field(description="The difficulty level of this specific question.")

# What we will send BACK to the React frontend (A list of questions)
class QuizResponse(BaseModel):
    questions: List[Question]

# 4. THE API ENDPOINT
# This is the route the frontend calls when the user clicks "Generate Quiz"
@app.post("/api/generate_quiz", response_model=QuizResponse)
async def generate_quiz(request: QuizRequest):
    try:
        # Step 4a: Prompt Engineering
        # We give the AI a "Persona" and strict rules to avoid boring, generic questions.
        system_prompt = """
        You are an expert instructional designer and subject matter expert. 
        Your task is to generate high-quality, learning-aligned quiz questions.
        
        CRITICAL REQUIREMENTS:
        - DO NOT create generic or rote-memorization questions.
        - Questions MUST test true understanding and application of the concepts.
        - Use realistic workplace scenarios where possible.
        - Avoid ambiguity in the questions and the options.
        - Provide a clear, educational explanation for the correct answer.
        """

        # We pass the specific details the user typed into the React form
        user_prompt = f"""
        Please generate {request.num_questions} {request.question_type} questions.
        
        Course: {request.course}
        Topic: {request.topic}
        Target Difficulty: {request.difficulty}
        """

        # Step 4b: Call OpenAI API
        # We use .parse() instead of .create() to enforce "Structured Outputs".
        # We pass 'response_format=QuizResponse' so the AI knows it MUST return JSON matching our Pydantic model.
        response = client.beta.chat.completions.parse(
            model="gpt-4o-mini", # Using a fast and cost-effective OpenAI model
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format=QuizResponse,
        )

        # Step 4c: Return the data
        # Extract the parsed JSON data from the AI's response and send it back to React
        quiz_data = response.choices[0].message.parsed
        return quiz_data

    # If anything goes wrong, catch the error and send a 500 Internal Server Error back to the frontend
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 5. SERVER RUNNER
# This starts the web server on port 8000 when you run this python file
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
