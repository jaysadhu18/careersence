# Careersence

AI-powered career and education guidance platform for students and early-career professionals.

## Tech stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **PostgreSQL** (Prisma ORM) for user data
- **NextAuth.js** (Credentials + JWT) for sign in / sign up

## Project structure

```
careersence/
├── app/
│   ├── (auth)/           # Auth layout group
│   │   ├── signin/
│   │   └── signup/
│   ├── ai-roadmap/
│   ├── analyze/
│   ├── api/              # Public API documentation (static page)
│   ├── career-quiz/
│   ├── career-tree/
│   ├── college-finder/
│   ├── overview/
│   ├── job-hunting/
│   ├── learning-resources/
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── layout/           # Header, Footer, PageShell, OverviewSidebar
│   ├── ui/               # Button, Input, Select, Checkbox, Textarea, Card, Badge, Tabs, Modal, Toast, Accordion, Progress
│   ├── domain/           # ResourceCard, RoadmapStepCard, JobCard, CollegeCard, QuizQuestionCard, ProgressHeader
│   └── providers/        # ToastProvider
└── lib/
    ├── utils.ts          # formatDuration, formatDate, formatSalaryRange, cn
    ├── mock-data.ts      # Sample roadmap, resources, jobs, colleges, quiz results
    └── hooks/
        ├── useRoadmap.ts
        ├── useResources.ts
        ├── useJobs.ts
        └── useCollegeSearch.ts
```

## Design system

- **Primary:** Blue (`--color-primary-*`) for CTAs and highlights
- **Secondary:** Teal (`--color-secondary-*`) for accents
- **Surfaces:** White cards, off-white background, soft shadows and rounded corners
- **Typography:** Inter (sans), Geist Mono (code)

## Authentication & database

- **Guests** see only the **landing page** (`/`). Sign in and Sign up are in the header.
- **After sign in or sign up**, users are redirected to the **main app** (e.g. Overview); all other routes require authentication.
- User data (email, hashed password, name, role, interests) is stored in **PostgreSQL**.

### Setup PostgreSQL

1. Install PostgreSQL and create a database (e.g. `careersence`).
2. Copy `.env.local.example` to `.env.local` and set:
   - `DATABASE_URL` — e.g. `postgresql://postgres:YOUR_PASSWORD@localhost:5432/careersence?schema=public`
   - `NEXTAUTH_SECRET` — run `openssl rand -base64 32` and paste the result
   - `NEXTAUTH_URL` — `http://localhost:3000` for local dev
3. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```
4. (Optional) Open Prisma Studio to view data: `npx prisma studio`

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up or sign in to access Overview, AI Roadmap, and the rest of the app.

## Build

```bash
npm run build
npm start
```

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/signin` | Sign in form |
| `/signup` | Sign up with role and interests |
| `/overview` | Personalized overview with roadmap, quiz, resources, job snapshot |
| `/career-quiz` | Multi-step quiz with results and “Add to roadmap” |
| `/ai-roadmap` | Timeline of stages with status and action items |
| `/learning-resources` | Filterable resource grid (course/article/video) |
| `/job-hunting` | Saved roles, application tracker, AI assistance |
| `/college-finder` | Search and shortlist colleges |
| `/analyze` | Tabs: Resume, Job description, Career comparison |
| `/api` | Public API documentation |
| `/career-tree` | Placeholder for career exploration view |
