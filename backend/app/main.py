import json

from fastapi import FastAPI
from pydantic import BaseModel

from app.llm.client import ask_llm
from app.schemas.intent import CustomerIntent


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

    structured_response = json.loads(response)

    intent = CustomerIntent(**structured_response)

    return intent