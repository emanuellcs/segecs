#!/bin/bash
set -e

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_NAME="postgres"
DB_USER="postgres.your-tenant-id"
DB_HOST="localhost"
DB_PORT="6543"
# It's recommended to set PGPASSWORD environment variable or use a .pgpass file
# export PGPASSWORD="your_postgres_password"

mkdir -p "$BACKUP_DIR"

echo "Starting backup of $DB_NAME..."

# Execute pg_dump
# If running on the host, you may need psql client installed
# Alternatively, you can run pg_dump via docker exec on the 'db' container
docker exec supabase-db pg_dump -U postgres "$DB_NAME" > "$BACKUP_DIR/db_backup_$TIMESTAMP.sql"

echo "Backup completed: $BACKUP_DIR/db_backup_$TIMESTAMP.sql"

# Optional: Remove backups older than 30 days
find "$BACKUP_DIR" -type f -name "*.sql" -mtime +30 -delete
echo "Old backups cleaned up."
