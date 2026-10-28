#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# Script de Backup Automático - Eleva & Agenda ORC
# Salva dump completo de eleva_agenda_production
# ==============================================================================

BACKUP_DIR="${BACKUP_DIR:-/home/ubuntu/acelera-barber/backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/eleva_agenda_prod_${TIMESTAMP}.dump"
DB_NAME="${1:-eleva_agenda_production}"
DB_HOST="${DB_HOST:-/home/ubuntu/orc-db}"
DB_PORT="${DB_PORT:-5433}"
DB_USER="${DB_USER:-ubuntu}"

mkdir -p "${BACKUP_DIR}"

echo "📦 [Backup ORC] Iniciando backup de ${DB_NAME}..."
echo "📍 Destino: ${BACKUP_FILE}"

pg_dump \
  -h "${DB_HOST}" \
  -p "${DB_PORT}" \
  -U "${DB_USER}" \
  -d "${DB_NAME}" \
  -F c \
  -b \
  -v \
  -f "${BACKUP_FILE}"

FILESIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
echo "✅ [Backup ORC] Backup concluído com sucesso!"
echo "📊 Arquivo: ${BACKUP_FILE} (${FILESIZE})"
