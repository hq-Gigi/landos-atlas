# landos-atlas
Planetary operating system for land, development, infrastructure, investment and governance by Gigi Labs.

## Overview

LandOS Atlas is a planetary intelligence and execution operating system that turns land anywhere on Earth into structured data, optimized planning scenarios, financial intelligence and collaborative workflows. Investors, planners, builders, and institutions can analyze, simulate scenarios, finance and execute projects, manage the full lifecycle of land‑based development at global scale.

## Documentation

The following PDF documents in this repository provide the complete blueprint for LandOS Atlas:

- **Land Os Gigi Labs Master Blueprint (2).pdf** – Final world‑system blueprint.
- **Land Os Atlas Cinematic Experience System.pdf** – Cinematic experience system details.
- **Land Os Atlas Cinematic Implementation Pack.pdf** – Implementation pack for cinematic assets.
- **Land Os Atlas Operational Build Pack.pdf** – Operational build guidelines.
- **Land Os Atlas Continuation From 28 (1).pdf** – Continuation materials.

## Build and Runtime

```bash
npm install
npm run build
npm run start
```

Default runtime port is `3000`.

## Health Endpoint

A production health endpoint is exposed at:

- `GET /api/health`

Example response:

```json
{
  "status": "ok",
  "service": "landos-atlas",
  "timestamp": "2026-03-09T03:54:52.695Z"
}
```

## Render Deployment

A Render Blueprint config is included in `render.yaml`.

### One-time setup

1. Push this repo to GitHub.
2. In Render, create a **Blueprint** service from this repository.
3. Confirm Render reads `render.yaml` and provisions the `landos-atlas` web service.

### Ongoing deploys

- Every push to the tracked branch will trigger an auto-deploy (`autoDeploy: true`).
- Health checks use `/api/health`.

## Audit Notes

- Added `.gitignore` to prevent committing `node_modules` and build artifacts.
- Standardized project to JavaScript files only (removed TypeScript-only scaffolding that blocked CI builds in this environment).
- Added a health endpoint and Render blueprint so production deployments have a deterministic health check and startup contract.
