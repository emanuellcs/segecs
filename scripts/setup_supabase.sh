#!/bin/bash
set -e

echo "Setting up self-hosted Supabase stack..."

# Clone the official Supabase repository
if [ ! -d "supabase" ]; then
    git clone --depth 1 https://github.com/supabase/supabase
fi

# Create your project directory
mkdir -p supabase-project

# Copy the compose files and initial environment from the official docker directory
cp -rf supabase/docker/* supabase-project/
cp -n supabase/docker/.env.example supabase-project/.env

echo "Supabase setup files copied to 'supabase-project/'."
echo "NEXT STEPS:"
echo "1. Go to 'supabase-project/'."
echo "2. Run 'sh ./utils/generate-keys.sh' to secure your keys."
echo "3. Update 'SITE_URL', 'SUPABASE_PUBLIC_URL', and 'API_EXTERNAL_URL' in 'supabase-project/.env' with your server LAN IP."
echo "4. Update 'POSTGRES_PASSWORD' and 'DASHBOARD_PASSWORD'."
echo "5. Add 'supabase-network' to 'supabase-project/docker-compose.yml' or rely on the default bridge if both stacks are in the same network."
