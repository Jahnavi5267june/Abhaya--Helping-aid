# Sahaya Andhra - NGO Platform

## Overview

A full-stack NGO (Non-Governmental Organization) platform for Andhra Pradesh, India. Connects donors, organizations (old age homes and orphanages), and people in need across all 26 AP districts. Built with React + Vite frontend and Express backend with PostgreSQL.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Frontend**: React + Vite + TailwindCSS + shadcn/ui
- **Routing**: Wouter
- **Forms**: react-hook-form + zodResolver
- **Charts**: Recharts
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Platform Features

1. **Organizations Directory** — Old age homes and orphanages across AP with district filtering, verified badges, occupancy info
2. **Donor Registration** — Registration form for money, food, clothing donations linked to specific organizations
3. **Help Request Form** — For people with disabilities or needing assistance (medical, shelter, food, disability aid, elderly care)
4. **Transparency Hub** — Documents and verification (audit reports, utilization certificates, registrations) for donor confidence
5. **Disaster Relief** — Emergency fund campaigns with progress bars and contribution forms for disaster situations
6. **Impact Statistics** — Platform-wide stats and donation breakdown charts

## Database Schema

Tables:
- `organizations` — old age homes and orphanages with geolocation
- `donations` — donor registrations (money/food/clothes/other)
- `help_requests` — assistance requests from people in need
- `documents` — transparency docs (audit reports, certificates)
- `disaster_relief` — emergency fund campaigns

## API Routes

All routes under `/api`:
- `GET/POST /organizations` — list and create organizations
- `GET /organizations/:id` — organization details
- `GET/POST /donations` — list and register donations
- `GET/POST /help-requests` — list and submit help requests
- `GET/POST /documents` — list and upload transparency docs
- `GET/POST /disaster-relief` — list and create disaster campaigns
- `POST /disaster-relief/:id/contribute` — contribute to a campaign
- `GET /stats/overview` — platform-wide statistics
- `GET /stats/donations-by-type` — donation type breakdown

## Key Files

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/db/src/schema/` — Drizzle DB schema files
- `artifacts/ngo-platform/src/` — React frontend
- `artifacts/api-server/src/routes/` — Express route handlers

## Frontend Pages

- `/` — Landing page with hero, stats, featured organizations, disaster banner
- `/organizations` — Directory with filters by type and district
- `/organizations/:id` — Organization detail page
- `/donate` — Donor registration form
- `/help` — Help request form
- `/transparency` — Transparency documents hub
- `/disaster` — Disaster relief campaigns
- `/impact` — Statistics and impact charts

## Notes

- The `lib/api-spec/package.json` codegen script patches `lib/api-zod/src/index.ts` after orval runs to fix a name collision between generated Zod schemas and TypeScript types
- App name: "Sahaya Andhra" (Sahaya = "help" in Telugu)

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
