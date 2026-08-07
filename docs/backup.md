# Backup diário do banco (SQLite → Google Drive)

Este runbook só se aplica **no deploy em produção** (VPS Hostinger), não no
ambiente de desenvolvimento local. A Hostinger já faz backup semanal do
servidor inteiro; isto aqui é um backup diário adicional, específico do
banco, guardado fora da Hostinger — para o caso de problema na própria conta
ou servidor.

Script: `scripts/backup-db.sh`.

## 1. Instalar dependências no servidor

```bash
sudo apt update
sudo apt install -y sqlite3
curl https://rclone.org/install.sh | sudo bash
```

## 2. Configurar o rclone com o Google Drive

Rodar **interativamente**, uma vez, logado no servidor (abre um link para
autorizar a conta Google — pode ser feito via `rclone authorize` numa
máquina com navegador se o servidor não tiver um):

```bash
rclone config
```

- `n` (novo remote) → nome: `gdrive`
- Tipo: `drive` (Google Drive)
- Client ID / Secret: deixe em branco para usar os padrões do rclone, ou
  crie os seus em https://console.cloud.google.com se quiser um app próprio
- Escopo: `drive` (acesso completo) ou `drive.file` (só arquivos criados
  pelo rclone — mais restrito, recomendado)
- Siga o fluxo de autorização (login na conta Google que vai guardar os
  backups)

No Google Drive, crie uma pasta dedicada (ex: `homero-clock-backups`) e
confirme o caminho com:

```bash
rclone lsd gdrive:
```

## 3. Copiar o script para o servidor e ajustar variáveis

O script lê `DB_PATH`, `BACKUP_DIR`, `RCLONE_REMOTE` e `RETENTION_DAYS` de
variáveis de ambiente (com defaults genéricos no topo do arquivo). Ajuste
para o caminho real de deploy, por exemplo:

```bash
sudo mkdir -p /var/backups/homero-clock
sudo chmod +x /var/www/homero-clock/scripts/backup-db.sh
```

Teste rodando manualmente antes de agendar:

```bash
DB_PATH=/var/www/homero-clock/prisma/dev.db \
BACKUP_DIR=/var/backups/homero-clock \
RCLONE_REMOTE=gdrive:homero-clock-backups \
RETENTION_DAYS=30 \
/var/www/homero-clock/scripts/backup-db.sh
```

Confirme que o arquivo apareceu no Drive (`rclone ls gdrive:homero-clock-backups`).

## 4. Agendar via cron (3h da manhã)

```bash
crontab -e
```

Adicione (ajustando os caminhos conforme o passo 3):

```cron
0 3 * * * DB_PATH=/var/www/homero-clock/prisma/dev.db BACKUP_DIR=/var/backups/homero-clock RCLONE_REMOTE=gdrive:homero-clock-backups RETENTION_DAYS=30 /var/www/homero-clock/scripts/backup-db.sh >> /var/log/homero-clock-backup.log 2>&1
```

## 5. Retenção

O script já apaga sozinho, a cada execução:
- backups **locais** com mais de `RETENTION_DAYS` dias (`$BACKUP_DIR`)
- backups **no Google Drive** com mais de `RETENTION_DAYS` dias

Padrão: 30 dias. Ajuste a variável `RETENTION_DAYS` se quiser outra janela.

## 6. Como restaurar um backup

```bash
rclone copy gdrive:homero-clock-backups/backup-2026-08-03.db.gz .
gunzip backup-2026-08-03.db.gz
# com a aplicação parada:
cp backup-2026-08-03.db /var/www/homero-clock/prisma/dev.db
```

Teste a restauração ao menos uma vez logo após configurar o backup, para
confirmar que o arquivo gerado é válido — um backup nunca testado não é
um backup confiável.
