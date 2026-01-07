FROM python:3.11-slim

# Install uv.
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Set the working directory.
WORKDIR /app

# Install the application dependencies.
COPY uv.lock pyproject.toml README.md ./
RUN uv sync --no-cache

# Copy the application into the container.
COPY src/philoagents philoagents/
COPY tools tools/

# Railway provides PORT env var, default to 8000 for local
ENV PORT=8000
EXPOSE ${PORT}

# Use shell form to allow variable substitution
CMD /app/.venv/bin/fastapi run philoagents/infrastructure/api.py --port ${PORT} --host 0.0.0.0
