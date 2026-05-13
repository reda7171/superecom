#!/bin/bash

# Configuration
CONTAINER_NAME="riwaya_mysql"
DB_NAME="riwaya_db"
DB_USER="riwaya_user"
DB_PASS="riwaya_pass"
BACKUP_DIR="./backups"
DATE=$(date +"%Y-%m-%d_%H-%M-%S")
FILENAME="backup_${DB_NAME}_${DATE}.sql"

# Créer le dossier de backup s'il n'existe pas
mkdir -p $BACKUP_DIR

echo "🚀 Début du backup de la base de données (UTF8mb4)..."

# Exécution du mysqldump via Docker
# --default-character-set=utf8mb4 garantit le support complet de l'arabe
docker exec $CONTAINER_NAME /usr/bin/mysqldump \
  --default-character-set=utf8mb4 \
  -u$DB_USER \
  -p$DB_PASS \
  $DB_NAME > $BACKUP_DIR/$FILENAME

if [ $? -eq 0 ]; then
  echo "✅ Backup terminé avec succès : $BACKUP_DIR/$FILENAME"
  # Optionnel : compresser le backup
  gzip $BACKUP_DIR/$FILENAME
  echo "📦 Backup compressé : $BACKUP_DIR/$FILENAME.gz"
else
  echo "❌ Erreur lors du backup"
  exit 1
fi
