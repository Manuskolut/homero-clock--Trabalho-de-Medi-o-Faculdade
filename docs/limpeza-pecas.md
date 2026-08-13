# Limpeza automática de peças vendidas (6 meses)

Este runbook só se aplica **no deploy em produção** (VPS Hostinger), não no
ambiente de desenvolvimento local. O script apaga do banco as peças com
status `VENDIDA` cuja `dataVenda` passou de 180 dias (6 meses) — depois
desse prazo elas já não podem mais ser reativadas (limite de 7 dias), então
deixam de ter função no sistema.

Script: `scripts/limpar-pecas-vendidas.ts`.

**Silencioso por design**: o script não grava nenhum log, arquivo ou
registro do que foi excluído. Se ele falhar (ex: banco inacessível), o erro
sobe normalmente pro cron — isso é só diagnóstico de execução, não um
rastro das exclusões.

## 1. Testar manualmente antes de agendar

Rodar uma vez à mão pra confirmar que está tudo certo (o `tsx` não carrega
`.env` sozinho, então as variáveis de ambiente — `DATABASE_URL` — precisam
ser exportadas antes):

```bash
cd /var/www/homeroclock
set -a; . ./.env; set +a
./node_modules/.bin/tsx scripts/limpar-pecas-vendidas.ts
```

Não há saída em caso de sucesso (mesmo se nada for excluído). Para conferir
o efeito, olhe a contagem de peças `VENDIDA` no banco antes e depois.

## 2. Agendar via cron (mensal, dia 1 às 3h da manhã)

```bash
crontab -e
```

Adicione (ajustando o caminho do projeto conforme o servidor):

```cron
0 3 1 * * cd /var/www/homeroclock && { echo "[$(date -Iseconds)] iniciando limpeza de pecas vendidas"; set -a; . ./.env; set +a; ./node_modules/.bin/tsx scripts/limpar-pecas-vendidas.ts; echo "[$(date -Iseconds)] finalizado com status $?"; } >> /var/log/homeroclock-limpeza-pecas.log 2>&1
```

A saída vai pro arquivo `/var/log/homeroclock-limpeza-pecas.log`, só com
timestamps de início/fim e o código de saída da execução — isso serve para
confirmar que o cron rodou e teve sucesso, sem quebrar o design silencioso:
nenhuma exclusão individual é logada, só o fato de que a rotina executou.
Se quiser ser avisado apenas quando o comando falhar (não quando ele roda
normalmente), configure `MAILTO` no crontab do usuário; o cron só envia
e-mail quando o comando retorna código de erro.

## 3. O que o script faz

1. Calcula a data limite: hoje menos 180 dias.
2. Busca todas as peças com `status = VENDIDA` e `dataVenda` anterior a esse
   limite.
3. Numa única transação: apaga primeiro os registros de `PecaEvento`
   associados a essas peças (a FK `PecaEvento → Peca` é `ON DELETE
   RESTRICT`, então a peça não pode ser apagada enquanto os eventos dela
   existirem), depois apaga as peças.

Se não houver nenhuma peça além do prazo, o script não faz nada.

## 4. Importante

- Isso é uma exclusão permanente e definitiva — diferente da regra de
  "nunca excluir peça vendida" (ver regras de negócio do módulo de peças),
  aqui a peça já passou do prazo de reativação e do período útil de
  histórico consultável pelas lojas.
- Não rode esse script em desenvolvimento local com dados que você queira
  manter — ele não tem confirmação nem modo "dry run".
