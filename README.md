# Tia Lê Estética Animal 🐾

> 🌐 **Site ao vivo:** https://tia-le-estetica-animal.vercel.app

Site institucional + agendamento online + painel administrativo do pet shop **Tia Lê Estética Animal** (Lê bicho mimado BANHO E TOSA).

## ✨ Funcionalidades

- **Site público** — hero, serviços (com fotos reais), portfólio, dicas, depoimentos, formas de pagamento, contato e horários
- **Agendamento online** em 5 passos: serviço → pet → data → horário → confirmação pelo WhatsApp
  - Adicional opcional **Táxi dog (buscar e levar) — R$ 10,00**
  - Escolha de forma de pagamento (PIX, crédito, débito, dinheiro + troco)
  - Validação de disponibilidade no servidor
- **Painel admin** (`/admin`) — agendamentos, serviços, galeria, depoimentos, horários, exceções e configurações
- **SEO completo** — meta tags, Open Graph com imagem, JSON-LD (`PetGroomer`), `sitemap.xml`, `robots.txt`, `llms.txt`, favicon/apple-icon
- **Imagens 100% WebP** para máximo desempenho

## 🧱 Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · shadcn/ui · Prisma + SQLite · lucide-react

## 🚀 Rodando localmente

```bash
bun install
cp .env.example .env          # ajuste se necessário
bun run db:push               # cria o schema no banco local
bun run dev                   # http://localhost:3000
```

Admin provisório: **admin / admin123** (troque a senha no painel!)

## 🗃️ Banco de dados

- **`db/custom.db`** — banco local de verdade (dados reais; **não vai para o git**)
- **`db/seed.db`** — snapshot limpo (sem dados pessoais) que vai no deploy

Antes de cada deploy, atualize o snapshot:

```bash
bun scripts/sync-seed-db.mjs
```

> ⚠️ **Limitação serverless**: a Vercel tem filesystem somente leitura. O app copia o `db/seed.db` para `/tmp` no cold start, então **leituras funcionam, mas gravações (agendamentos/edições do painel) não são persistentes** — em redeploy ou cold start o banco volta ao snapshot. Para produção com agendamentos reais, migre para um banco gerenciado (ex.: [Turso](https://turso.tech), compatível com SQLite, ou Vercel Postgres).

## 🔐 Variáveis de ambiente

Veja `.env.example`. Nenhuma é obrigatória em dev; na Vercel configure:

| Variável | Uso |
|---|---|
| `DATABASE_URL` | `file:/tmp/custom.db` (Vercel) |
| `NEXT_PUBLIC_SITE_URL` | Domínio final (canônico/OG/sitemap) |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4 |
| `NEXT_PUBLIC_CLARITY_ID` | Microsoft Clarity |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Search Console |

## 📦 Deploy (Vercel)

1. `bun scripts/sync-seed-db.mjs` (snapshot atualizado)
2. Commit + push para o GitHub
3. Importe o repo na Vercel (framework detecta Next.js automaticamente)
4. Configure as variáveis de ambiente acima
