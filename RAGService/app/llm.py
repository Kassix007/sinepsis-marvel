# app/llm.py
from fastapi import HTTPException
from google import genai
from .settings import settings

def generate(prompt: str) -> str:
    api_key = settings.gemini_api_key  # make sure this is set securely

    try:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model=settings.generation_model,  # e.g. "gemini-2.5-flash"
            contents=prompt
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating with Gemini: {e}"
        )

    text = response.text.strip()
    if not text:
        raise HTTPException(
            status_code=502,
            detail="Gemini returned an empty response"
        )

    return text
