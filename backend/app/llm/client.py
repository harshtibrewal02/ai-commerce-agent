import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


def ask_llm(message: str):

    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            {
                "role": "system",
                "content": """
                You are an AI commerce assistant.

                Analyze the customer's request and identify:
                - intent
                - category
                - budget
                - use_case

                Return the result as JSON.
                """
            },
            {
                "role": "user",
                "content": message
            }
        ],
        response_format={"type": "json_object"}
    )

    return response.choices[0].message.content