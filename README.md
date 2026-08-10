# Prancheta

Gestão de imóveis, leads, visitas e propostas para imobiliárias.

## Stack

Next.js (App Router), TypeScript, Tailwind CSS, Prisma, PostgreSQL, Auth.js.

## Setup

```bash
nvm use        # Node 22
npm install
cp .env.example .env   # preencha DATABASE_URL e AUTH_SECRET
npx prisma migrate dev
npx prisma db seed
npm run dev
```

App em http://localhost:3000

## Variáveis de ambiente

| Variável | Uso |
|---|---|
| `DATABASE_URL` | PostgreSQL |
| `AUTH_SECRET` | Sessões Auth.js |
| `NEXTAUTH_URL` | URL base (ex.: `http://localhost:3000`) |
| `N8N_API_KEY` | Webhook de automações |
| `GOOGLE_MAPS_API_KEY` | Rotas e geocoding (opcional) |
| `BLOB_READ_WRITE_TOKEN` | Upload de fotos (opcional) |

## Scripts

- `npm run dev` — desenvolvimento
- `npm run build` / `npm start` — produção
- `npm run db:migrate` — migrations
- `npm run db:seed` — dados iniciais
