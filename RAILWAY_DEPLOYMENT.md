# Railway Deployment Guide

This guide explains how to deploy PhiloAgents on Railway.

## Prerequisites

1. A [Railway account](https://railway.app) (free to sign up)
2. A [MongoDB Atlas](https://www.mongodb.com/atlas) account (free tier available)
3. An API key for your chosen LLM provider (Groq, OpenAI, Gemini, or Anthropic)

## Architecture

The deployment consists of 3 services:

| Service | Description | Port |
|---------|-------------|------|
| **philoagents-api** | FastAPI backend | 8000 |
| **philoagents-ui** | Phaser.js game frontend | 8080 |
| **MongoDB** | Database (MongoDB Atlas recommended) | 27017 |

## Step-by-Step Deployment

### Step 1: Set Up MongoDB Atlas (Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster (M0 Sandbox - Free Forever)
3. Create a database user with password
4. Add `0.0.0.0/0` to IP Access List (allows Railway to connect)
5. Get your connection string:
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 2: Deploy the Backend (philoagents-api)

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository
4. Railway will detect multiple services. Click on the detected service and:
   - Set **Root Directory**: `philoagents-api`
   - Railway will use `Dockerfile.railway` automatically

5. Add environment variables (Settings → Variables):

   ```env
   # MongoDB (REQUIRED)
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority

   # LLM Provider (REQUIRED)
   LLM_PROVIDER=groq
   LLM_MODEL=llama-3.3-70b-versatile
   LLM_MODEL_SUMMARY=llama-3.1-8b-instant
   LLM_MODEL_CONTEXT_SUMMARY=llama-3.1-8b-instant

   # API Keys (REQUIRED)
   OPENAI_API_KEY=your_openai_api_key  # Required for embeddings
   GROQ_API_KEY=your_groq_api_key      # For LLM provider (or use GEMINI/ANTHROPIC)
   # GEMINI_API_KEY=your_gemini_api_key
   # ANTHROPIC_API_KEY=your_anthropic_api_key

   # Optional
   COMET_API_KEY=
   PROMPT_VERSION=v1
   ```

6. Click **"Deploy"**
7. Once deployed, go to **Settings → Networking → Generate Domain**
8. Copy the generated URL (e.g., `https://philoagents-api-production.up.railway.app`)

### Step 3: Deploy the Frontend (philoagents-ui)

1. In the same Railway project, click **"New"** → **"GitHub Repo"**
2. Select your repository again
3. Configure the service:
   - Set **Root Directory**: `philoagents-ui`
   - Railway will use `Dockerfile.railway` automatically

4. Add environment variable (Settings → Variables):

   ```env
   # Set this to your backend URL from Step 2
   API_URL=https://philoagents-api-production.up.railway.app
   ```

5. Click **"Deploy"**
6. Go to **Settings → Networking → Generate Domain**
7. Your game is now live at the generated URL!

## Alternative: One-Click Deploy with Docker Compose

If you prefer to deploy everything together:

1. Fork/clone this repo to your GitHub
2. In Railway, create a new project from GitHub
3. Railway will detect the `docker-compose.yml` (you may need to update it for production)

## Environment Variables Reference

### Backend (philoagents-api)

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URI` | Yes | MongoDB connection string |
| `LLM_PROVIDER` | Yes | `groq`, `gemini`, `openai`, or `anthropic` |
| `LLM_MODEL` | Yes | Main model name |
| `LLM_MODEL_SUMMARY` | Yes | Summary model name |
| `LLM_MODEL_CONTEXT_SUMMARY` | Yes | Context summary model name |
| `OPENAI_API_KEY` | Yes | OpenAI API key (required for embeddings) |
| `GROQ_API_KEY` | If using Groq | Groq API key |
| `GEMINI_API_KEY` | If using Gemini | Google AI API key |
| `ANTHROPIC_API_KEY` | If using Anthropic | Anthropic API key |
| `COMET_API_KEY` | No | For Opik/Comet ML tracking |
| `PROMPT_VERSION` | No | Prompt version (default: v1) |

### Frontend (philoagents-ui)

| Variable | Required | Description |
|----------|----------|-------------|
| `API_URL` | Yes | Full URL to the backend API |

## Pricing Estimate

Railway Hobby Plan ($5/month credit):
- Covers ~500 hours of compute
- 100GB bandwidth
- 10GB storage

For a small app like PhiloAgents, this should be well within the free tier.

MongoDB Atlas Free Tier:
- 512MB storage
- Shared RAM
- Sufficient for development/demo

## Troubleshooting

### Backend not starting
- Check the deploy logs in Railway
- Verify all required environment variables are set
- Ensure MongoDB Atlas IP whitelist includes `0.0.0.0/0`

### Frontend can't connect to backend
- Verify `API_URL` is set correctly (include `https://`)
- Check CORS settings (already configured to allow all origins)
- Ensure backend is deployed and accessible

### WebSocket connection fails
- The backend supports WebSocket at `/ws/chat`
- Ensure your API_URL uses `https://` (will be converted to `wss://` automatically)

## Useful Commands

```bash
# View Railway logs
railway logs

# Connect to Railway shell
railway shell

# Check service status
railway status
```

## Files Created for Railway

- `railway.json` - Root Railway config
- `philoagents-api/railway.toml` - Backend Railway config
- `philoagents-api/Dockerfile.railway` - Production backend Dockerfile
- `philoagents-api/.env.railway.example` - Example environment variables
- `philoagents-ui/railway.toml` - Frontend Railway config
- `philoagents-ui/Dockerfile.railway` - Production frontend Dockerfile
- `philoagents-ui/nginx.conf` - Nginx config for serving static files
- `philoagents-ui/docker-entrypoint.sh` - Docker entrypoint script
