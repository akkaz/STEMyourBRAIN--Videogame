ifeq (,$(wildcard philoagents-api/.env))
$(error .env file is missing at philoagents-api/.env. Please create one based on .env.example)
endif

include philoagents-api/.env

# --- Infrastructure ---

infrastructure-build:
	docker compose build

infrastructure-up:
	docker compose up --build -d

infrastructure-stop:
	docker compose stop

check-docker-image:
	@if [ -z "$$(docker images -q philoagents-course-api 2> /dev/null)" ]; then \
		echo "Error: philoagents-course-api Docker image not found."; \
		echo "Please run 'make infrastructure-build' first to build the required images."; \
		exit 1; \
	fi

# --- Offline Pipelines ---

call-agent: check-docker-image
	docker run --rm --network=philoagents-network --env-file philoagents-api/.env philoagents-course-api uv run python -m tools.call_agent --philosopher-id "nicolo" --query "Ciao! Chi sei?"
