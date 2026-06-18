# Lasantha Kumara English Classes

A bilingual English institute website and student portal built with Payload CMS 3, Next.js App Router, PostgreSQL, TypeScript, and Tailwind CSS.

## Included

- CMS-managed homepage and content pages
- English and Sinhala content fields with a language toggle
- Classes, schedules, teachers, students, enrollments, testimonials, notices, resources, and contact messages
- Public class catalogue, timetable, testimonials, contact, enrollment, and login routes
- Payload Auth roles: `super_admin`, `admin`, `teacher`, `student`, and `parent`
- Protected student dashboard, profile, classes, schedule, resources, and notices
- Payload Admin at `/admin`
- Draft pages, live preview, SEO fields, redirects, and media management

## Local setup

Requirements: Node.js 20+, pnpm 9+, and PostgreSQL.

```bash
cp .env.example .env
pnpm install
pnpm dev
```

Open:

- Website: `http://localhost:3000`
- Payload Admin: `http://localhost:3000/admin`

Payload automatically pushes schema changes in development. Do not point development schema push at a production database.

## Environment variables

```env
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/lasantha_english
PAYLOAD_SECRET=replace-with-a-long-random-secret
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
CRON_SECRET=replace-with-a-random-secret
PREVIEW_SECRET=replace-with-a-random-secret
```

Supabase may be used as the PostgreSQL host, but authentication remains in Payload. Set `DATABASE_URL` to the Supabase direct or pooler connection string.

## Seed data

Sign in to Payload Admin and use the **Seed database** action on the dashboard. Seeding is destructive and clears institute content before adding:

- Six bilingual classes and the full weekly schedule
- Lasantha Kumara teacher profile
- Testimonials, a notice, and a learning resource
- Site settings, header, footer, and CMS pages
- Homepage institute blocks

Development seed accounts:

| Role | Email | Password |
|---|---|---|
| Super admin | `admin@lasanthaenglish.lk` | `Admin123!` |
| Teacher | `lasantha@lasanthaenglish.lk` | `Teacher123!` |

Change these passwords immediately outside local development.

## Useful commands

```bash
pnpm dev
pnpm generate:types
pnpm generate:importmap
pnpm exec tsc --noEmit
pnpm build
pnpm test:int
pnpm test:e2e
```

Regenerate Payload types after changing collections, globals, or blocks.

## Production and migrations

Create a migration after finalizing schema changes:

```bash
pnpm payload migrate:create
```

Run migrations before starting a deployed release:

```bash
pnpm payload migrate
pnpm build
pnpm start
```

Set `NEXT_PUBLIC_SERVER_URL` to the canonical HTTPS origin. Use managed PostgreSQL, persistent media storage, strong secrets, backups, and transactional email before accepting real enrollments.

For Vercel, configure all environment variables in the project, run migrations from CI or a release job, and ensure uploaded media is stored outside the ephemeral filesystem.
