# LandOS Atlas by GIGI LABS

**Tagline:** The Planetary Operating System for Land Development Intelligence

This repository now ships a real multi-surface platform foundation with:

- Premium public marketing and storytelling routes
- Cinematic experience route scaffold with 8 narrative sections
- Functional app workspace route tree (`/app/*`)
- Backend API modules for auth, orgs, projects, scenarios, feasibility, AI summaries, billing, exports, collaboration, and marketplace
- Deterministic scenario engine (non-AI geometry/scoring)
- Prisma PostgreSQL data model covering platform entities
- Docs/resources route that preserves original blueprint PDFs

## Key Routes

### Public
- `/`
- `/experience`
- `/platform`
- `/for-developers`
- `/for-investors`
- `/for-governments`
- `/for-enterprises`
- `/docs/resources`

### App
- `/app`
- `/app/portfolio`
- `/app/projects/new`
- `/app/projects/:projectId`
- `/app/projects/:projectId/scenarios`
- `/app/projects/:projectId/feasibility`
- `/app/projects/:projectId/reports`
- `/app/projects/:projectId/collaboration`
- `/app/marketplace`
- `/app/billing`
- `/app/team`
- `/app/settings`

## API Foundations
- Auth: `/api/auth/signup`, `/api/auth/login`, `/api/auth/logout`
- Organizations: `/api/orgs`
- Projects: `/api/projects`, `/api/projects/:projectId`
- Scenarios: `/api/projects/:projectId/scenarios`
- Feasibility: `/api/projects/:projectId/feasibility`
- Collaboration: `/api/projects/:projectId/collaboration`
- AI recommendations: `/api/ai/recommend`
- Billing (Paystack flow foundation): `/api/billing/initialize`, `/api/billing/webhook`, `/api/billing/verify`
- Exports: `/api/exports/generate`
- Marketplace: `/api/marketplace`

## Local Run

```bash
npm install
npm run dev
```

Build check:

```bash
npm run build
```

## Environment
Copy `.env.example` and provide real service keys:

- `DATABASE_URL`
- `OPENAI_API_KEY`
- `PAYSTACK_SECRET_KEY`
- `PAYSTACK_PUBLIC_KEY`
- `NEXT_PUBLIC_APP_URL`

## Notes
- In-memory API storage is included for local demo UX.
- Prisma schema provides production-ready PostgreSQL model mapping.
- Replace mock Paystack authorization URL and AI stub responses with provider SDK/service integrations for production.
