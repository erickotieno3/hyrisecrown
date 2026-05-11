#!/bin/bash
# Project Export Script for Tesco Price Comparison
# This script creates a complete backup of your project

# Set variables
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="./backups"
PROJECT_NAME="tesco-price-comparison"
BACKUP_FILENAME="${PROJECT_NAME}_backup_${TIMESTAMP}"
DB_BACKUP="database_backup_${TIMESTAMP}.sql"

# Create backup directory if it doesn't exist
echo "Creating backup directory..."
mkdir -p ${BACKUP_DIR}

# Export the database if it exists
if [ ! -z "$DATABASE_URL" ]; then
  echo "Exporting database..."
  pg_dump $DATABASE_URL > "${BACKUP_DIR}/${DB_BACKUP}"
  echo "Database exported to ${BACKUP_DIR}/${DB_BACKUP}"
else
  echo "Warning: DATABASE_URL not set, skipping database export"
fi

# Create a list of files to exclude from the backup
echo "node_modules/" > .backup_exclude
echo ".git/" >> .backup_exclude
echo "backups/" >> .backup_exclude
echo ".backup_exclude" >> .backup_exclude

# Create a zip archive of the project
echo "Creating project archive..."
zip -r "${BACKUP_DIR}/${BACKUP_FILENAME}.zip" . -x@.backup_exclude

# Clean up temporary files
rm .backup_exclude

echo ""
echo "==============================================="
echo "Backup completed successfully!"
echo "Backup file: ${BACKUP_DIR}/${BACKUP_FILENAME}.zip"
if [ ! -z "$DATABASE_URL" ]; then
  echo "Database backup: ${BACKUP_DIR}/${DB_BACKUP}"
fi
echo "==============================================="
echo ""
echo "Next steps:"
echo "1. Download the backup files to your local computer"
echo "2. Keep them in a safe location"
echo "3. Refer to docs/project-export-guide.md for reinstating instructions"
echo ""