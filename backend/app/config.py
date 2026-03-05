"""Configuration helpers for the backend.

Read configuration values from environment variables.
Do NOT store secrets directly in this file.
"""

import os
from typing import Optional


def get_openai_api_key() -> Optional[str]:
	"""Return the OpenAI API key from environment if available."""
	return os.getenv("OPENAI_API_KEY")


def get_allowed_origins() -> list[str]:
	"""Return a list of allowed CORS origins from `ALLOWED_ORIGINS` env var.

	Comma-separated values are supported. Defaults to localhost dev ports.
	"""
	# include both 5173 (original) and 5174 (Vite overflow) plus wildcard localhost for convenience
	env = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174")
	return [o.strip() for o in env.split(",") if o.strip()]

