# LandOS Atlas by GIGI LABS

**The Planetary Operating System for Land Development Intelligence.**

## Platform surfaces
- **Public cinematic/product surface**: `/`, `/experience`, `/platform`, `/for-*`, `/docs/resources`
- **Application workspace**: `/app`, `/app/portfolio`, `/app/projects/new`, `/app/projects/[projectId]/*`

## Repository structure
- `pages/api/*` – authenticated API routes for auth, orgs, projects, scenarios, feasibility, AI, billing, exports, marketplace, geo search
- `pages/app/*` – authenticated application workspace pages
- `pages/*` – public product pages and cinematic experience
- `lib/*` – service layer (auth, guards, store, scenario engine, Prisma client, validation)
- `prisma/*` – schema + migration SQL
- `scripts/seed.js` – demo org/user/project seed

## Database-backed systems
- Auth + sessions
- Organizations + membership
- Projects + boundaries + land profile
- Deterministic scenarios + optimization scores + feasibility reports
- AI recommendations
- Collaboration comments/tasks/activity
- Billing payments + unlock-gated exports
- Marketplace listings + opportunities

## Required environment
Copy `.env.example` to `.env`:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/landos_atlas"
OPENAI_API_KEY=""
OPENAI_MODEL="gpt-4o-mini"
PAYSTACK_SECRET_KEY=""
```

## Local run
```bash
npm install
npx prisma generate
npx prisma db push
node scripts/seed.js
npm run dev
```

## Production/deployment notes
- Set `DATABASE_URL` to managed Postgres and run Prisma migrations in CI/CD.
- Configure `OPENAI_API_KEY` for structured recommendation generation.
- Configure `PAYSTACK_SECRET_KEY` and route webhook to `/api/billing/webhook`.
- Serve `public/exports` via app/CDN storage strategy.
- Run `npm run build` in deployment pipeline.
