#!/bin/bash
set -e

# ==============================================================================
# SEGECS - School On-Premises Deployment Script
# ==============================================================================
# WARNING: This script should ONLY be executed after the GitHub Action (CI Pipeline) 
# turns green, validating the types, linting, tests, and the docker build.
#
# This script simulates the IT administrator's job on the local server.
# It pulls the latest code, safely tears down the old container, rebuilds,
# and restarts the frontend attached to the local Supabase network.
# ==============================================================================

echo "Starting Deployment Process..."

# 1. Pull the latest code from the main branch
echo "[1/4] Pulling latest code from main branch..."
git fetch origin main
git checkout main
git pull origin main

# 2. Tear down the old frontend container safely
echo "[2/4] Tearing down the old frontend container..."
docker compose stop frontend || true
docker compose rm -f frontend || true

# 3. Rebuild the Docker container using the latest code
echo "[3/4] Rebuilding the frontend Docker image..."
# We assume the .env file is already present on the server with VITE_PUBLIC_SUPABASE_URL
docker compose build frontend

# 4. Restart the container attached to the Supabase network
echo "[4/4] Starting the newly built frontend container..."
docker compose up -d frontend

# Note: Database migrations for Supabase are handled by the Supabase CLI.
# If migrations exist, they can be run via:
# supabase db push --db-url "postgresql://postgres:[PASSWORD]@localhost:5432/postgres"
# Or through Supavisor on port 6543 if exposed.
# For now, it's skipped unless explicitly configured.

echo "Deployment complete! The application is now running."