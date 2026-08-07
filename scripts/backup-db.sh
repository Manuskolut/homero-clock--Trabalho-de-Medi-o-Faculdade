#!/usr/bin/env bash
# Backup diário do banco SQLite do Homero Clock, com envio para
# armazenamento externo (fora da Hostinger) e retenção automática.
#
# Não roda sozinho — precisa ser agendado via cron no servidor de produção.
# Passo a passo completo (rclone + Google Drive + crontab) em docs/backup.md.

set -euo pipefail

# --- Configuração (sobrescreva via variáveis de ambiente/crontab) ----------
DB_PATH="${DB_PATH:-/var/www/homero-clock/prisma/dev.db}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/homero-clock}"
RCLONE_REMOTE="${RCLONE_REMOTE:-gdrive:homero-clock-backups}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
# -----------------------------------------------------------------------

timestamp="$(date +%F)"
backup_file="$BACKUP_DIR/backup-$timestamp.db"
archive_file="$backup_file.gz"

log() { echo "[$(date '+%F %T')] $*"; }

if [ ! -f "$DB_PATH" ]; then
  log "ERRO: banco não encontrado em $DB_PATH"
  exit 1
fi

if ! command -v sqlite3 >/dev/null 2>&1; then
  log "ERRO: sqlite3 não instalado (apt install sqlite3)"
  exit 1
fi

if ! command -v rclone >/dev/null 2>&1; then
  log "ERRO: rclone não instalado ou não configurado (ver docs/backup.md)"
  exit 1
fi

mkdir -p "$BACKUP_DIR"

# ".backup" usa a API de backup do SQLite: gera uma cópia transacionalmente
# consistente mesmo com o app escrevendo no banco. Um "cp" simples poderia
# copiar o arquivo no meio de uma escrita e gerar um backup corrompido.
log "Gerando snapshot consistente do banco..."
sqlite3 "$DB_PATH" ".backup '$backup_file'"

log "Compactando..."
gzip -f "$backup_file"

log "Enviando para $RCLONE_REMOTE..."
rclone copy "$archive_file" "$RCLONE_REMOTE" --quiet

log "Aplicando retenção local (> $RETENTION_DAYS dias em $BACKUP_DIR)..."
find "$BACKUP_DIR" -name 'backup-*.db.gz' -mtime "+$RETENTION_DAYS" -delete

log "Aplicando retenção remota (> $RETENTION_DAYS dias em $RCLONE_REMOTE)..."
rclone delete "$RCLONE_REMOTE" --min-age "${RETENTION_DAYS}d" --quiet

log "Backup concluído: $archive_file"
