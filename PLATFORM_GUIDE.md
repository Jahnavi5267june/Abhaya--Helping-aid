# Abhaya — NGO Platform: Complete Platform Guide

> **Sahaya Andhra** (Abhaya) — A public welfare platform for Andhra Pradesh, India.  
> Connects donors, organizations (old age homes & orphanages), volunteers, and people in need across all 26 AP districts.

---

## Table of Contents

1. [Platform Overview](#1-platform-overview)
2. [Tech Stack](#2-tech-stack)
3. [Environment Variables & Secrets](#3-environment-variables--secrets)
4. [Running the Platform](#4-running-the-platform)
5. [Database Schema](#5-database-schema)
6. [API Reference](#6-api-reference)
7. [Frontend Pages](#7-frontend-pages)
8. [Admin Panel](#8-admin-panel)
9. [Email Notifications](#9-email-notifications)
10. [File Uploads & Object Storage](#10-file-uploads--object-storage)
11. [Deploying to Production](#11-deploying-to-production)

---

## 1. Platform Overview

Abhaya is a full-stack web platform that serves as a digital hub for welfare work across Andhra Pradesh. It has six main pillars:

| Pillar | Description |
|--------|-------------|
| **Organizations Directory** | Browse verified old age homes and orphanages by district |
| **Donor Registration** | Register money, food, or clothing donations to specific orgs |
| **Help Request Form** | Anyone can request assistance — medical, shelter, food, elderly care |
| **Community Alerts** | Report people in need seen on the street (hungry child, abandoned elderly) |
| **Disaster Reports** | Real-time community reporting of floods, droughts, accidents |
| **Volunteer Network** | Register to volunteer; matched to help requests in your district |
| **Organization Registration** | Orgs apply to join the platform; admin reviews and approves |
| **Transparency Hub** | Audit reports, utilization certificates for donor confidence |
| **Disaster Relief Campaigns** | Emergency fund campaigns with progress bars |
| **Impact Statistics** | Platform-wide stats and donation breakdown charts |

---

## 2. Tech Stack

### Monorepo Structure
```
workspace/
├── artifacts/
│   ├── api-server/          # Express backend (Node.js)
│   └── ngo-platform/        # React frontend (Vite)
├── lib/
│   ├── api-spec/            # OpenAPI contract (source of truth)
│   ├── api-client-react/    # Generated React Query hooks (from OpenAPI)
│   ├── api-zod/             # Generated Zod schemas (from OpenAPI)
│   └── db/                  # Drizzle ORM + PostgreSQL schema
└── scripts/                 # Utility scripts
```

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 24 | Runtime |
| Express | 5 | HTTP framework |
| Drizzle ORM | latest | Database queries |
| PostgreSQL | — | Database |
| Zod | v4 | Request/response validation |
| Pino | latest | Structured logging |
| Resend | latest | Transactional email |
| esbuild | latest | CJS bundle for production |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18 | UI framework |
| Vite | latest | Build tool & dev server |
| TailwindCSS | 3 | Styling |
| shadcn/ui | latest | Component library |
| Wouter | latest | Client-side routing |
| TanStack Query | v5 | Server state & caching |
| react-hook-form | latest | Form state management |
| Recharts | latest | Charts (Impact page) |

### Tooling
| Tool | Purpose |
|------|---------|
| pnpm workspaces | Monorepo package management |
| Orval | Generates React Query hooks & Zod schemas from OpenAPI spec |
| TypeScript 5.9 | Type safety across all packages |
| drizzle-kit | DB migrations / schema push |

---

## 3. Environment Variables & Secrets

### Secrets (sensitive — stored in Replit Secrets)

| Secret Key | Value | Purpose |
|------------|-------|---------|
| `RESEND_API_KEY` | `re_...` | Resend API key for email notifications |
| `SESSION_SECRET` | random string | Express session signing |
| `DEFAULT_OBJECT_STORAGE_BUCKET_ID` | GCS bucket ID | Object storage for file uploads |
| `PRIVATE_OBJECT_DIR` | dir path | Private file storage path |
| `PUBLIC_OBJECT_SEARCH_PATHS` | dir path | Public file search paths |
| `DATABASE_URL` | postgres connection string | PostgreSQL database (auto-managed by Replit) |

### Environment Variables (non-sensitive)

| Variable | Default | Purpose |
|----------|---------|---------|
| `PORT` | `8080` | API server port (set by Replit workflow) |
| `NODE_ENV` | `development` | Environment mode |
| `ADMIN_EMAIL` | `abhayaorg@gmail.com` | Email address to receive all admin notifications |
| `FROM_EMAIL` | `Abhaya Platform <notifications@abhaya.org>` | Sender name/address for outgoing emails |
| `SITE_URL` | `""` | Base URL of the site (for email links to admin panel) |
| `ADMIN_PASSWORD` | `abhaya-admin-2024` | Admin panel password (change in production!) |
| `VITE_UPI_ID` | `abhaya@upi` | UPI ID shown on the donation page |

> **Important:** To change the admin password, set the `ADMIN_PASSWORD` environment variable. The default `abhaya-admin-2024` should be changed before going live.

---

## 4. Running the Platform

### Prerequisites
- Node.js 24+
- pnpm (`npm install -g pnpm`)
- PostgreSQL database (or use Replit's built-in DB)

### Install Dependencies
```bash
pnpm install
```

### Push Database Schema (first time or after schema changes)
```bash
pnpm --filter @workspace/db run push
```

### Run Code Generation (after OpenAPI spec changes)
```bash
pnpm --filter @workspace/api-spec run codegen
```
This regenerates:
- `lib/api-client-react/src/generated/` — React Query hooks
- `lib/api-zod/src/generated/` — Zod validation schemas

### Development (Replit runs these automatically via Workflows)
```bash
# API server (port 8080)
pnpm --filter @workspace/api-server run dev

# Frontend (port set via $PORT env var)
pnpm --filter @workspace/ngo-platform run dev
```

### Type Check
```bash
pnpm run typecheck          # Full check across all packages
pnpm run typecheck:libs     # Libs only (needed after lib changes)
```

### Build
```bash
pnpm run build              # Typecheck + build all packages
```

### Key Commands Summary
```bash
pnpm run typecheck                          # Full typecheck
pnpm --filter @workspace/db run push        # Push DB schema
pnpm --filter @workspace/api-spec run codegen  # Regen API hooks
pnpm --filter @workspace/api-server run build  # Build backend
```

---

## 5. Database Schema

All tables live in PostgreSQL, managed via Drizzle ORM. Schema files are in `lib/db/src/schema/`.

### `organizations`
Stores old age homes and orphanages.

| Column | Type | Notes |
|--------|------|-------|
| `id` | serial PK | Auto-increment |
| `name` | text | Organization name |
| `type` | text | `old_age_home` or `orphanage` |
| `district` | text | One of 26 AP districts |
| `address` | text | Full address |
| `phone` | text | Contact phone |
| `email` | text | Contact email |
| `latitude` | numeric(10,7) | GPS latitude |
| `longitude` | numeric(10,7) | GPS longitude |
| `capacity` | integer | Max residents |
| `currentOccupancy` | integer | Current residents |
| `description` | text | About the org |
| `established` | integer | Year established |
| `verified` | boolean | Admin-verified badge (default: false) |
| `imageUrl` | text | Photo URL |
| `createdAt` | timestamp | Auto |

### `donations`
Donor registrations (intent to donate — not payment processing).

| Column | Type | Notes |
|--------|------|-------|
| `id` | serial PK | |
| `donorName` | text | |
| `donorEmail` | text | |
| `donorPhone` | text | |
| `donorCity` | text | Optional |
| `donationType` | text | `money`, `food`, `clothes`, `other` |
| `amount` | numeric(12,2) | For money donations |
| `description` | text | Notes |
| `organizationId` | integer | FK → organizations |
| `paymentReference` | text | UPI transaction ID |
| `status` | text | `pending`, `confirmed`, `delivered` |
| `createdAt` | timestamp | Auto |

### `help_requests`
Requests from people needing assistance.

| Column | Type | Notes |
|--------|------|-------|
| `id` | serial PK | |
| `name` | text | Requester name |
| `phone` | text | |
| `email` | text | Optional |
| `location` | text | Specific location |
| `district` | text | AP district |
| `category` | text | `medical`, `blood_donation`, `shelter`, `food`, `education`, `disability_aid`, `elderly_care`, `other` |
| `description` | text | Situation details |
| `urgency` | text | `low`, `medium`, `high`, `critical` |
| `status` | text | `pending`, `in_progress`, `resolved` |
| `photoUrl` | text | Optional photo path (GCS object path) |
| `validationStatus` | text | `unverified`, `verified` (volunteer verification) |
| `createdAt` | timestamp | Auto |

### `community_alerts`
Street-level alerts posted by anyone about people in need.

| Column | Type | Notes |
|--------|------|-------|
| `id` | serial PK | |
| `title` | text | Alert headline |
| `description` | text | Situation details |
| `category` | text | `hunger`, `medical`, `blood`, `clothes`, `books`, `elderly`, `child`, `other` |
| `location` | text | Specific location |
| `district` | text | AP district |
| `urgency` | text | `low`, `medium`, `high`, `critical` |
| `status` | text | `open`, `fulfilled`, `closed` |
| `reporterName` | text | |
| `reporterPhone` | text | |
| `reporterEmail` | text | Optional |
| `createdAt` | timestamp | Auto |

### `disaster_reports`
Community-reported disasters and emergencies.

| Column | Type | Notes |
|--------|------|-------|
| `id` | serial PK | |
| `title` | text | Report headline |
| `description` | text | Situation details |
| `disasterType` | text | `flood`, `drought`, `cyclone`, `earthquake`, `fire`, `accident`, `landslide`, `other` |
| `location` | text | Specific location |
| `district` | text | AP district |
| `severity` | text | `low`, `medium`, `high`, `critical` |
| `status` | text | `reported`, `verified`, `responding`, `resolved` |
| `photoUrl` | text | Optional photo path (GCS object path) |
| `reporterName` | text | |
| `reporterPhone` | text | |
| `reporterEmail` | text | Optional |
| `affectedCount` | text | e.g. "50 families" |
| `createdAt` | timestamp | Auto |
| `updatedAt` | timestamp | Auto |

### `volunteers`
Registered volunteers across AP.

| Column | Type | Notes |
|--------|------|-------|
| `id` | serial PK | |
| `name` | text | |
| `phone` | text | |
| `email` | text | Optional |
| `district` | text | AP district |
| `skills` | text | Comma-separated skills |
| `availability` | text | `anytime`, `weekends`, `weekdays`, `emergencies_only` |
| `aadhaarRef` | text | Last 4 digits of Aadhaar (optional identity check) |
| `status` | text | `active`, `inactive` |
| `createdAt` | timestamp | Auto |

### `org_registrations`
Organization self-registration applications.

| Column | Type | Notes |
|--------|------|-------|
| `id` | serial PK | |
| `name` | text | Organization name |
| `type` | text | `old_age_home`, `orphanage`, `other` |
| `district` | text | AP district |
| `address` | text | Full address |
| `phone` | text | |
| `email` | text | |
| `contactPerson` | text | Primary contact name |
| `registrationNumber` | text | NGO/society reg no. (optional) |
| `description` | text | About the org |
| `capacity` | text | e.g. "50 residents" |
| `documentUrl` | text | Uploaded registration doc (GCS object path) |
| `status` | text | `pending`, `approved`, `rejected` |
| `createdAt` | timestamp | Auto |

### `disaster_relief`
Admin-created emergency fundraising campaigns.

| Column | Type | Notes |
|--------|------|-------|
| `id` | serial PK | |
| `title` | text | Campaign name |
| `description` | text | |
| `district` | text | |
| `targetAmount` | numeric(14,2) | Fundraising goal |
| `raisedAmount` | numeric(14,2) | Current amount raised |
| `status` | text | `upcoming`, `active`, `closed` |
| `urgencyLevel` | text | `low`, `medium`, `high`, `critical` |
| `startDate` | timestamp | |
| `endDate` | timestamp | |
| `contactPhone` | text | |
| `imageUrl` | text | |
| `createdAt` | timestamp | Auto |

### `documents`
Transparency documents (audit reports, certificates).

| Column | Type | Notes |
|--------|------|-------|
| `id` | serial PK | |
| `organizationId` | integer | FK → organizations |
| `title` | text | Document name |
| `category` | text | `audit_report`, `utilization_certificate`, `registration`, `annual_report`, `donation_receipt` |
| `year` | integer | Financial year |
| `fileUrl` | text | URL or GCS path |
| `verifiedBy` | text | Admin who verified |
| `description` | text | |
| `uploadedAt` | timestamp | Auto |

---

## 6. API Reference

All routes are under `/api`. The API server runs on port 8080 and is proxied through the shared reverse proxy.

### Public Routes

#### Organizations
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/organizations` | List organizations. Query: `?type=old_age_home\|orphanage&district=Krishna&verified=true` |
| `GET` | `/api/organizations/:id` | Get single organization |
| `POST` | `/api/organizations` | Create organization |

#### Donations
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/donations` | List donations. Query: `?organizationId=1&type=money` |
| `POST` | `/api/donations` | Register a donation |

#### Help Requests
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/help-requests` | List help requests. Query: `?district=Guntur&status=pending&urgency=critical` |
| `POST` | `/api/help-requests` | Submit a help request |

#### Community Alerts
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/community-alerts` | List alerts. Query: `?district=Krishna&status=open` |
| `POST` | `/api/community-alerts` | Post a community alert |

#### Disaster Reports
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/disaster-reports` | List disaster reports. Query: `?district=Eluru&type=flood` |
| `POST` | `/api/disaster-reports` | Submit a disaster report |

#### Volunteers
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/volunteers` | List volunteers. Query: `?district=Visakhapatnam` |
| `POST` | `/api/volunteers` | Register as a volunteer |

#### Organization Registrations
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/org-registrations` | List registration applications |
| `POST` | `/api/org-registrations` | Submit org registration |

#### Transparency Documents
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/documents` | List documents. Query: `?organizationId=1` |
| `POST` | `/api/documents` | Upload document reference |

#### Disaster Relief Campaigns
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/disaster-relief` | List campaigns. Query: `?status=active` |
| `POST` | `/api/disaster-relief` | Create campaign |
| `POST` | `/api/disaster-relief/:id/contribute` | Contribute to campaign |

#### Statistics
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/stats/overview` | Platform-wide stats (totals, counts) |
| `GET` | `/api/stats/donations-by-type` | Donation type breakdown for charts |

#### File Storage
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/storage/uploads/request-url` | Request presigned GCS upload URL |
| `GET` | `/api/storage/objects/*` | Serve a stored file |

#### Health
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/healthz` | Health check |

### Admin Routes (require `x-admin-token` header)

All admin routes are under `/api/admin`.

#### Authentication
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/admin/auth` | Login with password → returns token |

#### Organizations
| Method | Path | Description |
|--------|------|-------------|
| `PATCH` | `/api/admin/organizations/:id` | Update org (verify, edit details) |
| `DELETE` | `/api/admin/organizations/:id` | Delete organization |

#### Donations
| Method | Path | Description |
|--------|------|-------------|
| `PATCH` | `/api/admin/donations/:id` | Update status: `pending → confirmed → delivered` |
| `DELETE` | `/api/admin/donations/:id` | Delete donation |

#### Help Requests
| Method | Path | Description |
|--------|------|-------------|
| `PATCH` | `/api/admin/help-requests/:id` | Update status: `pending → in_progress → resolved` |
| `DELETE` | `/api/admin/help-requests/:id` | Delete help request |

#### Community Alerts
| Method | Path | Description |
|--------|------|-------------|
| `PATCH` | `/api/admin/community-alerts/:id` | Update status: `open → fulfilled → closed` |
| `DELETE` | `/api/admin/community-alerts/:id` | Delete alert |

#### Disaster Reports
| Method | Path | Description |
|--------|------|-------------|
| `PATCH` | `/api/admin/disaster-reports/:id/status` | Update status: `reported → verified → responding → resolved` |
| `DELETE` | `/api/admin/disaster-reports/:id` | Delete report |

#### Volunteers
| Method | Path | Description |
|--------|------|-------------|
| `PATCH` | `/api/admin/volunteers/:id/status` | Update volunteer status |
| `DELETE` | `/api/admin/volunteers/:id` | Remove volunteer |

#### Organization Registrations
| Method | Path | Description |
|--------|------|-------------|
| `PATCH` | `/api/admin/org-registrations/:id/status` | Approve or reject: `pending → approved / rejected` |
| `DELETE` | `/api/admin/org-registrations/:id` | Delete registration |

#### Documents
| Method | Path | Description |
|--------|------|-------------|
| `DELETE` | `/api/admin/documents/:id` | Delete document |

#### Disaster Relief
| Method | Path | Description |
|--------|------|-------------|
| `PATCH` | `/api/admin/disaster-relief/:id` | Update status: `upcoming → active → closed` |

---

## 7. Frontend Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Hero, live stats, featured orgs, disaster banner |
| `/organizations` | Organizations Directory | Filter by type + district, verified badge |
| `/organizations/:id` | Organization Detail | Full org info, location, documents |
| `/donate` | Donate | Register donation — money (UPI/bank), food, clothes |
| `/help` | Request Help | Submit help request with optional photo |
| `/community` | Community Help Board | Post/browse street-level people-in-need alerts |
| `/disaster` | Disaster Relief | Emergency fundraising campaigns |
| `/disaster-reports` | Community Disaster Reports | Report + browse community disaster reports |
| `/volunteers` | Volunteer Network | Register as volunteer, see active volunteers |
| `/register-org` | Register Organization | Org self-registration form with doc upload |
| `/transparency` | Transparency Hub | Audit reports and verification documents |
| `/impact` | Impact Stats | Charts and platform-wide statistics |
| `/admin` | Admin Panel | Password-protected management dashboard |

### Navigation
The top nav shows: **Home · Organizations · Community · Disaster Relief · Volunteers · Transparency · Impact**  
Plus action buttons: **Request Help** and **Donate Now**

The footer links to all pages including Disaster Reports, Volunteer Network, and Register Organization.

---

## 8. Admin Panel

### Access
- URL: `/admin`
- Default password: `abhaya-admin-2024`
- To change: set `ADMIN_PASSWORD` environment variable
- Token stored in `localStorage` after login
- Authentication: `x-admin-token` header (Base64-encoded password)

### Admin Tabs

| Tab | What You Can Do |
|-----|----------------|
| **Overview** | Live stats — total orgs, donations, help requests, funds raised, volunteers |
| **Organizations** | Verify/unverify orgs (shows verified badge on public site), delete |
| **Org Requests** | Review organization registration applications — approve or reject |
| **Donations** | Track donor registrations, change status (pending → confirmed → delivered), delete |
| **Help Requests** | Manage help requests, update status (pending → in progress → resolved), delete |
| **Volunteers** | View all volunteers with contact details and skills, remove if needed |
| **Community Alerts** | Manage street alerts, mark as fulfilled or closed, delete |
| **Disaster Reports** | View community disaster reports, update status (reported → verified → responding → resolved), delete |
| **Documents** | View transparency docs, delete |
| **Relief Campaigns** | Manage fundraising campaigns, change status (upcoming → active → closed) |

---

## 9. Email Notifications

Emails are sent automatically via **Resend** whenever:

| Trigger | Email Subject |
|---------|--------------|
| New donation registered | `💛 New Donation — {type} from {donor name}` |
| New help request | `🚨/📋 Help Request — {category} in {district}` |
| New community alert | `🆘 Community Alert: {title} — {district}` |
| New disaster report | `🌊/⚠️ Disaster Report: {title} — {district}` |
| New org registration | `🏢 New Organization Registration: {name} — {district}` |

### Configuration
All notifications go to: **`abhayaorg@gmail.com`** (set via `ADMIN_EMAIL` env var)

To add more recipients, set `ADMIN_EMAIL` to a comma-separated list:
```
ADMIN_EMAIL=abhayaorg@gmail.com,secondadmin@example.com
```

**Sender:** `Abhaya Platform <notifications@abhaya.org>` (set via `FROM_EMAIL`)

> Note: Your Resend account must be verified with a sender domain for production. In development, Resend's sandbox mode can be used.

---

## 10. File Uploads & Object Storage

Files (photos, documents) are stored in **Google Cloud Storage** via Replit's Object Storage.

### Upload Flow
1. Client requests a presigned upload URL: `POST /api/storage/uploads/request-url`
   - Body: `{ name, size, contentType }`
   - Response: `{ uploadURL, objectPath }`
2. Client PUTs the file directly to GCS using the `uploadURL`
3. Client stores the `objectPath` and submits it with the form
4. Files are served via: `GET /api/storage/objects/{objectPath}`

### What Uses File Uploads
- **Help Request photos** — optional photo to illustrate the situation
- **Disaster Report photos** — photo evidence from the scene
- **Organization Registration documents** — registration certificate / trust deed

### In the Admin Panel
Photo/document links appear as "View" links that open the file directly from GCS.

---

## 11. Deploying to Production

### On Replit (Recommended)
1. Click **Deploy** / **Publish** in the Replit interface
2. Replit handles TLS, health checks, and hosting automatically
3. The app will be available at `https://<your-repl-name>.replit.app`

### Pre-Deployment Checklist
- [ ] Change `ADMIN_PASSWORD` from the default `abhaya-admin-2024`
- [ ] Set `SITE_URL` to your production domain (for email links)
- [ ] Verify `RESEND_API_KEY` is set and your sender domain is verified in Resend
- [ ] Verify `ADMIN_EMAIL` is set to `abhayaorg@gmail.com` (or your address)
- [ ] Set `VITE_UPI_ID` to the correct UPI ID for donations
- [ ] Run `pnpm --filter @workspace/db run push` against the production DB
- [ ] Test the admin panel login at `/admin`
- [ ] Test submitting a help request (check email notification arrives)

### Production Environment Variables to Set
```
ADMIN_PASSWORD=<your-secure-password>
ADMIN_EMAIL=abhayaorg@gmail.com
FROM_EMAIL=Abhaya Platform <notifications@abhaya.org>
SITE_URL=https://your-domain.replit.app
VITE_UPI_ID=yourname@upi
```

---

## Quick Reference

### Default Credentials
| Item | Value |
|------|-------|
| Admin URL | `/admin` |
| Admin Password | `abhaya-admin-2024` (**change this!**) |
| Admin Email | `abhayaorg@gmail.com` |
| UPI ID (donate page) | `abhaya@upi` |
| Emergency Call | 112 (shown on disaster report page) |

### Important File Locations
| File | Purpose |
|------|---------|
| `lib/api-spec/openapi.yaml` | API contract — single source of truth for all endpoints |
| `lib/db/src/schema/` | Database table definitions |
| `artifacts/api-server/src/routes/` | Express route handlers |
| `artifacts/api-server/src/lib/email.ts` | All email notification templates |
| `artifacts/api-server/src/lib/objectStorage.ts` | GCS upload/serve logic |
| `artifacts/ngo-platform/src/pages/` | React frontend pages |
| `artifacts/ngo-platform/src/components/layout.tsx` | Navigation and footer |
| `artifacts/ngo-platform/src/lib/admin-api.ts` | Admin panel API calls |

---

*Abhaya — For the people of Andhra Pradesh.*
