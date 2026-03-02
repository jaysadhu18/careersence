# CareerSence: Technical Architecture & Implementation Documentation

This document provides a comprehensive technical overview of the CareerSence codebase, detailing the architecture, libraries, database design, and API implementations that power the features within the application.

---

## 🏗️ 1. Core Architecture & Tech Stack

The application is built utilizing a modern, full-stack React framework optimized for server-side rendering (SSR), API route handling, and strict typing.

- **Framework**: Next.js 16.1.6 (App Router paradigm)
- **Language**: TypeScript (strict mode enabled)
- **Styling**: Tailwind CSS (v4) with PostCSS
- **Database ORM**: Prisma (v6) mapping to a PostgreSQL dialect
- **Authentication**: NextAuth.js (v4) utilizing JWT session strategies and `bcryptjs` for credential hashing
- **Animation & UI**: Framer Motion (v11) and `@xyflow/react` (v12) for rendering interactive flow diagrams
- **AI/LLM Provider**: Groq API (utilizing `llama-3.3-70b-versatile` model instance)

---

## 🗄️ 2. Database Schema (Prisma)

The application utilizes a relational database structure designed around a central `User` entity with one-to-many relationships for tracking various AI-generated artifacts and job statuses.

### Models:
- **`User`**: Core authentication model containing `id`, `email`, hashed `password`, `role`, and `interests`. Handles cascade deletion for child records.
- **`Roadmap`**: Stores AI-generated roadmaps. Contains the core `careerGoal` string and a highly structured JSON string `stages` mapping the API output arrays.
- **`SavedJob`**: Job board tracker mapping to the user. Features a composite unique constraint `@@unique([userId, jobId])` ensuring idempotent saves. Includes enum-like status tracking: `saved`, `applied`, `interviewing`, `offer`, `rejected`.
- **`QuizSession`**: Stores state for the two-phase assessment. Contains serialized JSON strings for `phase1Answers`, generated `phase2Questions`, user-provided `phase2Answers`, and the final AI `results`.
- **`CareerTree`**: Stores the interactive visual flowchart map. Contains serialized `formInput`, the `rootTitle`, and the heavily nested `treeData` (containing nodes, branches, milestones, and metadata).

---

## ⚙️ 3. Feature Implementations & API Routes

All logic resides under the App Router's `app/api/*` directory, implementing Next.js Edge/Node handlers via standard HTTP methods (GET, POST, PATCH, DELETE).

### 3.1. Interactive Career Tree (`/api/career-tree`)
**Method:** `POST`
- **Controller Logic**: Takes a payload of user constraints (`skills`, `passions`, `targetRoles`, `shortTermGoal`, `longTermGoal`).
- **Prompt Engineering**: System prompt rigidly enforces a strictly-formatted JSON response defining exactly 1 `root` object and exactly 3 `branches`, each containing exactly 4 chronological `milestones`.
- **Processing**: The Groq AI response is sanitized via regex (removing Markdown code fences) and parsed into the strictly typed `CareerTreeData` interface. The response payload is also synchronously saved via the Prisma Client to the `CareerTree` model before returning the finalized data structure to the client for rendering via `@xyflow/react`.
- **Delete Mechanism**: The `/api/career-tree/[id]` route provides a `DELETE` endpoint to allow users to prune old generated trees.

### 3.2. Dynamic Career Roadmaps (`/api/roadmap`)
**Method:** `POST`
- **Controller Logic**: Takes user properties (`careerGoal`, `currentStage`, `timeline`, `experience`).
- **Prompt Engineering**: Enforces a JSON array response consisting of `RoadmapStageFromAPI` structures (title, description, timeRange, explicitly typed arrays of actions and resources).
- **Processing**: Aims to chronologically segment the user's timeline into 5-7 explicit stages. Output JSON is sanitized, validated, mapped to strictly-typed arrays, logged into Prisma (`Roadmap` model), and rendered iteratively on the frontend via Framer Motion's staging.

### 3.3. Two-Phase AI Career Quiz (`/api/career-quiz`)
**Method:** `POST` (Multiplexed via `action` key)
- **Phase 1 (`generate-questions`)**: Accepts initial 5 basic Q&A responses. The Groq model is prompted to dynamically generate 10 deeply personalized, specific follow-up questions formatted as multi-choice single-select radio options. Database transaction *creates* a new `QuizSession`.
- **Phase 2 (`generate-results`)**: Accepts all 15 Q&A pairs (Phase 1 + Phase 2 arrays). The LLM processes the complete diagnostic profile to identify 3-5 mathematically scored career fits, complete with dynamic salary estimations and required skill arrays. Database transaction *updates* the existing `QuizSession` via the `sessionId` reference, storing the final `results` object.

### 3.4. Smart College Search (`/api/college-search`)
**Method:** `POST`
- **Controller Logic**: Acts as a location/degree semantic search utilizing the LLM's vast training corpus on Indian Universities. Payload includes `state`, `field`, `degreeType`, and optionally `exclude` (for pagination-like behavior).
- **Prompt Engineering**: The LLM is instructed to operate strictly as an educational JSON endpoint, generating arrays of real-world universities, parsing complex metadata like expected `costRange`, `stateRanking`, and `countryRanking`.
- **Processing**: Employs extensive try/catch fallbacks for parsing non-compliant JSON from the LLM, generating client-safe unique IDs `offset` by the exclusion array length to prevent React key collisions.

### 3.5. Job Board Tracking (`/api/jobs/saved`)
**Methods:** `GET`, `POST`, `PATCH`, `DELETE`
- **Controller Logic**: Pure CRUD REST operations mapping directly to the `SavedJob` table in PostgreSQL. 
- **Integrations**: `POST` implements `prisma.savedJob.upsert` to gracefully handle duplicate saves of identical external `jobId` parameters from JSearch. `PATCH` strictly validates inputs against a hardcoded array of `validStatuses` strings before execution to prevent malicious database updates.

### 3.6. Resume Parsing & OCR (`/api/parse-resume`)
**Method:** `POST`
- **Controller Logic**: A file upload endpoint utilizing Next.js built-in `FormData` parsers. Casts uploaded files directly into raw `Buffer` streams in system memory.
- **Engines Used**:
  - **PDF (`application/pdf`)**: Uses `pdf-parse` combined with a specialized, dynamically-imported `pdfjs-dist` worker file path resolution string to bypass strict ES Module (ESM) restrictions common within Next.js Node environments.
  - **Word (`.docx`)**: Implements `mammoth` (`mammoth.extractRawText`) to tear down the XML abstractions of Office files into raw UTF-8 strings.
  - **Text (`.txt`)**: Triggers standard native Node `Buffer.toString("utf-8")`.
- **Processing**: Text data is sanitized and piped back to the client application state to power autonomous pre-filling logic across the app.

---

## 🔒 4. Security & Authentication

- The `lib/auth.ts` implements NextAuth's `CredentialsProvider`. 
- User passwords are obfuscated using `bcrypt.compare` during SignIn validation. 
- On successful validation, NextAuth issues a cryptographically signed static JWT containing the `userId`, which circumvents continuous database hits per API request.
- Every authenticated API route initiates an access gate via `getServerSession(authOptions)`. If a request is unverified or the requesting user's `userId` does not map to the requested database asset ID, a standard HTTP `401 Unauthorized` or `404 Not found` logic drop triggers immediately, preventing unauthorized horizontal escalation logic attempts.
