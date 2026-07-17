"""
AI service integration module for ResQAI.
Handles communication with external LLM providers (e.g. OpenRouter).
"""

import json
import logging
from typing import Optional

import httpx

from config import get_settings

settings = get_settings()
logger = logging.getLogger("resqai.ai")


async def call_openrouter(
    prompt: str,
    system_prompt: Optional[str] = None,
    temperature: float = 0.7,
) -> Optional[str]:
    """
    Perform an asynchronous chat completion request to the OpenRouter API.
    Returns the string content of the response, or None if the request failed.
    """
    if not settings.openrouter_api_key:
        logger.warning("OPENROUTER_API_KEY is not configured. Falling back to local heuristics.")
        return None

    headers = {
        "Authorization": f"Bearer {settings.openrouter_api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "ResQAI",
    }

    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})

    payload = {
        "model": settings.openrouter_model,
        "messages": messages,
        "temperature": temperature,
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json=payload,
            )
            if response.status_code != 200:
                logger.error(
                    "OpenRouter API error: Status %d - %s",
                    response.status_code,
                    response.text,
                )
                return None

            data = response.json()
            choices = data.get("choices")
            if not choices:
                logger.error("OpenRouter response has no choices: %s", data)
                return None

            content = choices[0].get("message", {}).get("content")
            return content

    except Exception as exc:
        logger.error("Failed to connect to OpenRouter: %s", exc)
        return None
