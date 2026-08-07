# Homero Clock Relojóias — Sistema de Gestão de Ordens de Serviço

Sistema web interno para cadastro de clientes, gestão de ordens de serviço
(relógios e joias), controle de prazos e consulta de histórico/garantia.

## Stack

- **Next.js** (App Router, TypeScript) — frontend e backend em um único projeto
- **Prisma + SQLite** — banco de dados local, um único arquivo (`prisma/dev.db`),
  fácil de copiar como backup
- **Tailwind CSS v4** — estilização com a paleta de cores da marca

## Como rodar localmente

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

O banco de dados já vem criado e migrado (`prisma/dev.db`). Para recriá-lo do
zero:

```bash
npx prisma migrate reset
```

## Backup do banco de dados

Basta copiar o arquivo `prisma/dev.db` para outro lugar (pen drive, nuvem,
etc.). Para restaurar, basta colocar o arquivo de volta no mesmo caminho.

## Estrutura principal

- `src/app` — páginas (Painel, Clientes, Ordens de Serviço, Prazos, Busca)
- `src/lib/actions` — funções de acesso ao banco de dados (Prisma) e regras
  de negócio
- `src/components` — componentes de interface reutilizáveis
- `prisma/schema.prisma` — modelo do banco de dados

## Produção

```bash
npm run build
npm run start
```

Pode ser hospedado em qualquer provedor Node.js (Vercel, Railway, VPS, etc.)
sem alterações no código.
