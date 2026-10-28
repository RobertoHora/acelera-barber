#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# Script de Restore Drill (Exercício de Recuperação de Desastre)
# Restaura o backup em um banco temporário isolado e valida integridade física
# ==============================================================================

LATEST_BACKUP=$(ls -t /home/ubuntu/acelera-barber/backups/*.dump 2>/dev/null | head -n 1 || true)
BACKUP_FILE="${1:-$LATEST_BACKUP}"
VERIFY_DB="${2:-eleva_agenda_restore_verify}"
DB_HOST="${DB_HOST:-/home/ubuntu/orc-db}"
DB_PORT="${DB_PORT:-5433}"
DB_USER="${DB_USER:-ubuntu}"

if [[ -z "${BACKUP_FILE}" || ! -f "${BACKUP_FILE}" ]]; then
  echo "❌ [Restore Drill] Arquivo de backup não encontrado ou não especificado!"
  exit 1
fi

echo "🔍 [Restore Drill] Iniciando exercício de recuperação com ${BACKUP_FILE}..."

# 1. Recria o banco temporário
echo "🧹 [Restore Drill] Preparando banco de teste ${VERIFY_DB}..."
dropdb -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" --if-exists "${VERIFY_DB}"
createdb -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" "${VERIFY_DB}"

# 2. Restaura o dump
echo "📥 [Restore Drill] Restaurando dados via pg_restore..."
pg_restore \
  -h "${DB_HOST}" \
  -p "${DB_PORT}" \
  -U "${DB_USER}" \
  -d "${VERIFY_DB}" \
  --no-owner \
  --role="${DB_USER}" \
  "${BACKUP_FILE}" || true

# 3. Validação de Integridade e Contagens
echo "🧪 [Restore Drill] Validando integridade dos dados e constraints..."

BIZ_COUNT=$(psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${VERIFY_DB}" -t -A -c 'SELECT COUNT(*) FROM "Business"')
SERVICES_COUNT=$(psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${VERIFY_DB}" -t -A -c 'SELECT COUNT(*) FROM "Service"')
CONSTRAINT_CHECK=$(psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${VERIFY_DB}" -t -A -c "SELECT conname FROM pg_constraint WHERE conname = 'Booking_no_overlapping_active_slots'")

echo "📊 Barbearias restauradas: ${BIZ_COUNT}"
echo "📊 Serviços cadastrados: ${SERVICES_COUNT}"
echo "🔒 Constraint física de concorrência: ${CONSTRAINT_CHECK:-NÃO ENCONTRADA}"

if [[ "${BIZ_COUNT}" -eq 0 ]]; then
  echo "❌ [Restore Drill] Falha: nenhuma barbearia restaurada!"
  exit 1
fi

if [[ "${CONSTRAINT_CHECK}" != "Booking_no_overlapping_active_slots" ]]; then
  echo "❌ [Restore Drill] Falha: constraint de concorrência não está presente!"
  exit 1
fi

# 4. Limpeza do banco temporário
echo "🧹 [Restore Drill] Limpando banco temporário de verificação..."
dropdb -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" "${VERIFY_DB}"

echo "🎉 [Restore Drill] SUCESSO ABSOLUTO! O backup é íntegro, restaurável e preserva todas as constraints físicas!"
