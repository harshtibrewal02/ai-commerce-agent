from fastapi import FastAPI
from pydantic import BaseModel

from app.llm.client import ask_llm


app = FastAPI()


class ChatRequest(BaseModel):
    message: str


@app.get("/")
def root():
    return {
        "message": "AI Commerce Agent Backend is running"
    }


@app.post("/chat")
def chat(request: ChatRequest):

    response = ask_llm(request.message)

    return {
        "response": response
    }