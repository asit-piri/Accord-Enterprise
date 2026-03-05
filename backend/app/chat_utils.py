from langchain_openai import ChatOpenAI
import logging
import os
from typing import Optional

logger = logging.getLogger(__name__)

MODEL = "gpt-4o"
TEMPERATURE = 0.7


def get_chat_model(api_key: Optional[str] = None) -> ChatOpenAI:
    """Initialize the OpenAI Chat Model."""
    try:
        final_api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not final_api_key:
            raise ValueError(
                "OPENAI_API_KEY not found. Please set it in config or environment variables."
            )

        return ChatOpenAI(api_key=final_api_key, model=MODEL, temperature=TEMPERATURE)
    except Exception as e:
        logger.error(f"Failed to initialize chat model: {str(e)}")
        raise e


def ask_chat_model(chat_model: ChatOpenAI, prompt: str) -> str:
    """Send a prompt to the chat model and return the response."""
    if chat_model is None:
        return "Chat model is not available. System initialization failed."

    try:
        response = chat_model.invoke(prompt)
        return response.content
    except Exception as e:
        logger.error(f"Error invoking chat model: {str(e)}")
        return "I'm sorry, but I encountered an error while processing your request. Please try again later."
