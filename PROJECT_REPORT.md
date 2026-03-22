# CareerSence – Project Report

---

## Acknowledgement

We would like to express our sincere gratitude to all those who contributed to the successful completion of this project.

First and foremost, we are deeply thankful to our **project guide** for their invaluable guidance, continuous support, and constructive feedback throughout the development of CareerSence. Their expertise and encouragement kept us motivated at every stage of the project.

We extend our heartfelt thanks to our **Head of Department** and all the **faculty members** of our department for providing us with the necessary resources, infrastructure, and academic environment to carry out this work.

We are grateful to **Groq Inc.** for providing access to their high-performance LLM inference API, which forms the backbone of the AI features in this platform. We also acknowledge **RapidAPI** and the **JSearch API** team for enabling real-time job listing integration.

We would like to thank the open-source communities behind **Next.js**, **Prisma**, **React Flow**, **Framer Motion**, **Tailwind CSS**, and **NextAuth.js** — without whose work this project would not have been possible.

Finally, we are grateful to our **family and friends** for their unwavering support, patience, and encouragement throughout this journey.

---

## Abstract

CareerSence is an AI-powered career planning and job hunting web platform designed to help students, recent graduates, and career switchers navigate their professional journey with clarity and confidence. In today's rapidly evolving job market, individuals often struggle with a lack of personalized guidance, fragmented tools, and expensive career counseling services. CareerSence addresses these challenges by consolidating career planning, AI-driven recommendations, job search, and application tracking into a single, unified platform.

The platform leverages the **Groq API** (powered by LLaMA 3 large language models) to generate personalized career roadmaps, interactive career trees, and adaptive two-phase career quizzes in real time. Users receive step-by-step career plans tailored to their specific skills, interests, and goals — replacing generic advice with data-driven, actionable guidance.

Built on **Next.js 16** with the App Router, **PostgreSQL** with **Prisma ORM**, and **NextAuth.js** for authentication, CareerSence follows modern full-stack development best practices. The frontend uses **React**, **Tailwind CSS**, and **Framer Motion** for a responsive, premium user experience with dark/light mode support. Career path visualization is powered by **React Flow (@xyflow/react)**, enabling interactive, node-based exploration of career options.

Key features include: AI career roadmap generation, interactive career tree visualization, a two-phase adaptive career quiz, live job search via JSearch API integration, a job application tracker, a learning resources manager, an instructor-led course platform, and a comprehensive admin dashboard.

The system was developed using an Agile iterative approach over approximately 11 weeks, with a focus on security (bcrypt, JWT, role-based access control), scalability (stateless sessions, connection pooling), and usability (responsive design, guided user flows). All 8 core modules were successfully implemented and validated through 25+ documented test cases.

CareerSence demonstrates that AI-powered career guidance can be delivered effectively through a web platform at near-zero infrastructure cost, making professional career planning accessible to everyone.

**Keywords**: AI Career Planning, Large Language Models, Next.js, Career Roadmap, Job Tracking, React Flow, Groq API, Full-Stack Web Application

---

## 1.0 Introduction

### 1.1 Project Summary
CareerSence is an AI-powered career planning and job hunting web platform that generates personalized career roadmaps, interactive career trees, and live job listings — enabling students, graduates, and career switchers to make informed, data-driven professional decisions from a single unified interface.

CareerSence was born out of a real problem: most people entering the job market or switching careers have no clear, personalized plan. Existing tools are either too generic (static aptitude tests), too fragmented (separate tools for roadmaps, job search, and learning), or too expensive (paid career coaches). CareerSence solves this by combining the power of large language models (LLMs) with an intuitive web interface to deliver a free, intelligent, and personalized career guidance experience.

The platform is built on Next.js 16 with the App Router, uses PostgreSQL with Prisma ORM for data persistence, NextAuth.js for authentication, and the Groq API for AI generation. It is designed to be fast, responsive, and accessible on any modern device.

### 1.2 Purpose
The purpose of CareerSence is to democratize career guidance by making AI-powered, personalized career planning accessible to everyone — regardless of their background, education level, or financial situation.

Traditional career counseling is expensive, time-consuming, and often unavailable to students in developing regions. Online resources are scattered across dozens of platforms with no cohesion. CareerSence addresses this by:

- Replacing generic career advice with AI-generated, skill-specific roadmaps tailored to each individual.
- Providing a visual, interactive representation of career paths that users can explore and understand intuitively.
- Integrating job search and application tracking so users never lose sight of their goals.
- Offering a structured, AI-driven quiz that helps users discover careers they may not have considered.
- Storing user history and progress so the platform grows more useful over time.

The platform is not just a tool — it is a career companion that adapts to the user's evolving profile and keeps them on track toward their professional goals.

### 1.3 Objective
The primary objectives of CareerSence are:

1. **Personalized AI Roadmaps**: Generate step-by-step career roadmaps tailored to each user's skills, interests, and goals using the Groq LLM API, with each roadmap saved to the user's history for future reference.
2. **Visual Career Exploration**: Provide an interactive, node-based career tree that visually maps out branching career paths, skill dependencies, and role progressions — making complex career landscapes easy to understand.
3. **Intelligent Career Discovery**: Conduct a two-phase AI career quiz that first gathers user preferences and background, then generates personalized follow-up questions to refine and rank career recommendations.
4. **Unified Job Hunting**: Integrate live job listings from JSearch API and allow users to track their application status (Saved → Applied → Interviewing → Offered/Rejected) through a built-in tracker.
5. **Learning Resource Management**: Allow users to save, organize, and revisit learning resources (videos, articles, courses) relevant to their career goals.
6. **Instructor-Led Courses**: Enable instructors to create and publish structured courses with sections and lectures, providing curated learning paths on the platform.
7. **Platform Administration**: Provide administrators with a secure, feature-rich dashboard to monitor user activity, platform health, manage content, and view analytics.
8. **Accessibility and Inclusivity**: Ensure the platform is fully responsive, supports dark/light mode, and delivers a premium experience on any device or screen size.

### 1.4 Scope

#### What CareerSence Can Do:
- **AI Career Roadmap Generation**: Users input their current skills, target role, and timeline. The Groq API generates a detailed, step-by-step roadmap with milestones, resources, and timelines. All roadmaps are saved to the user's history.
- **Interactive Career Tree**: A visual, zoomable, pannable node graph showing career paths, branching options, and skill dependencies — powered by React Flow and Framer Motion. Users can generate new trees or revisit saved ones.
- **Two-Phase AI Career Quiz**: Phase 1 collects general interests and background through structured questions. Phase 2 uses AI to generate 10 personalized follow-up questions based on Phase 1 answers. Final results provide ranked career recommendations with detailed explanations.
- **Live Job Search**: Searches real-time job listings via JSearch API with filters for location, job type, salary range, and remote options. Results include company details, job descriptions, and direct application links.
- **Job Application Tracker**: Users can save jobs and update their application status through a kanban-style tracker (Saved → Applied → Interviewing → Offered / Rejected).
- **Learning Resources**: Users can browse, save, and manage learning resources (videos, articles, courses) relevant to their career path. Saved resources are stored in the database and accessible from the user's profile.
- **Instructor Platform**: Instructors can create courses with sections and lectures, set pricing (free or paid), and publish to the platform. Course management includes editing, status toggling (Draft/Published), and content organization.
- **Admin Dashboard**: Restricted to `.admin.com` email accounts. Provides user statistics, activity logs, course management, and system health monitoring with visual charts.
- **Authentication**: Secure sign-up/sign-in with email/password via NextAuth.js credentials provider with bcrypt password hashing.
- **Dark/Light Mode**: Full dark mode support with seamless CSS variable-based transitions across all components.
- **Responsive Design**: Fully responsive layout that works on desktop, tablet, and mobile browsers.
- **Profile Management**: Users can view and update their profile information, see their quiz history, roadmap history, and career tree history.

#### What CareerSence Cannot Do:
- **Guarantee Employment**: The platform provides guidance and tools but cannot guarantee job placement or career success outcomes.
- **Real-Time Human Mentorship**: No live chat with human career coaches or mentors (planned for future).
- **ATS Integration**: Cannot directly submit applications to company Applicant Tracking Systems — users are redirected to external job pages.
- **Video Streaming**: No built-in video player for course lectures in the current version (future enhancement).
- **Offline Access**: Requires an active internet connection for all AI features, job listings, and database operations.
- **Resume Parsing**: Cannot automatically parse uploaded resumes to pre-fill profile data (future enhancement).
- **Salary Negotiation Tools**: Does not provide real-time salary benchmarking or negotiation guidance.
- **Multi-language Support**: Currently English-only; internationalization (i18n) is a planned future enhancement.

### 1.5 Technology and Literature Review

#### Technology Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Frontend Framework | Next.js | 16.1.6 | Full-stack React framework with App Router, SSR, and API routes |
| UI Library | React | 18+ | Component-based UI development |
| Styling | Tailwind CSS | 3+ | Utility-first CSS for rapid, consistent design |
| Animations | Framer Motion | 11+ | Smooth page transitions and component animations |
| Graph Visualization | @xyflow/react (React Flow) | 12+ | Interactive node-based career tree visualization |
| ORM | Prisma | 6.19.2 | Type-safe database access and schema management |
| Database | PostgreSQL | 14+ | Relational database for all persistent data |
| Authentication | NextAuth.js | 4+ | Session management, JWT, credentials provider |
| AI/LLM | Groq API | — | Ultra-fast LLM inference for roadmap and quiz generation |
| Job Listings | JSearch API (RapidAPI) | — | Real-time job search data |
| Runtime | Node.js | 18+ | Server-side JavaScript runtime |

#### Literature Review

**AI in Career Counseling:**
Research in educational technology consistently shows that AI-driven career counseling outperforms static aptitude tests in user satisfaction and career alignment accuracy. Studies highlight that personalized recommendation systems using LLMs can reduce career decision-making time by up to 40% compared to traditional methods. CareerSence applies this by using Groq's LLaMA-based models to generate context-aware, personalized career guidance in real time.

**Large Language Models (LLMs) for Personalization:**
The emergence of models like LLaMA 3 (used via Groq API) has made it feasible to generate high-quality, structured career content in real time. Groq's Language Processing Unit (LPU) architecture delivers inference speeds significantly faster than GPU-based alternatives — often 10x faster — making it ideal for interactive web applications where users expect near-instant AI responses. This is critical for CareerSence's quiz and roadmap features where latency directly impacts user experience.

**Graph-Based Career Visualization:**
Academic literature on skill mapping and career path visualization demonstrates that visual representations of career paths significantly improve user comprehension and engagement compared to text-based lists. Users are better able to understand relationships between roles, required skills, and career progression when presented visually. React Flow (@xyflow/react) is the industry-standard library for building interactive node graphs in React, used by companies like Stripe, Retool, and Vercel in production applications.

**Job Tracking and Application Management:**
Studies on job seeker behavior show that candidates who actively track their applications are significantly more likely to follow up effectively and receive offers. The lack of a unified tracking tool forces most job seekers to use spreadsheets or memory, leading to missed opportunities. CareerSence's integrated tracker addresses this by bringing job search and status management into the same platform as career planning — eliminating context switching.

**Full-Stack JavaScript with Next.js:**
Next.js App Router (matured in v16) represents the current best practice for building full-stack React applications. Its server components, API routes, built-in optimization features (image optimization, code splitting, streaming SSR), and seamless deployment on Vercel make it the ideal choice for a data-intensive, AI-powered platform like CareerSence. The unified codebase (frontend + backend in one repository) also significantly reduces development complexity and deployment overhead.

---

## 2.0 Project Management

### 2.1 Project Planning

#### 2.1.1 Project Development Approach and Justification
CareerSence follows an **Agile iterative development approach**, specifically a lightweight Scrum-inspired process with weekly sprints. This approach was chosen for the following reasons:

- **Evolving AI Requirements**: The behavior and output quality of the Groq API required continuous prompt engineering and iteration. A waterfall approach would have been too rigid to accommodate these changes.
- **Feature Complexity**: Features like the career tree (React Flow), two-phase quiz, and job tracker each required independent development cycles with frequent testing and refinement.
- **Rapid Prototyping**: Agile allowed the team to deliver working features incrementally, enabling early user feedback and course correction before investing heavily in any single feature.
- **Next.js Architecture Alignment**: The modular App Router structure of Next.js naturally supports sprint-based development, where each route/module can be developed and deployed independently.

Each sprint lasted approximately one week and followed this cycle:
1. **Plan**: Define sprint goals and break down tasks.
2. **Build**: Develop features, write API routes, design UI components.
3. **Test**: Manual testing, API testing with Postman, browser testing.
4. **Review**: Demo working features, identify bugs and improvements.
5. **Retrospect**: Document lessons learned and adjust next sprint plan.

#### 2.1.2 Project Effort, Time and Cost Estimation

**Time Estimation:**

| Phase | Tasks | Estimated Duration |
|---|---|---|
| Requirements & Planning | Define scope, user stories, tech stack selection | 1 week |
| UI/UX Design | Wireframes, component design, Tailwind theme setup | 1 week |
| Authentication & Database | NextAuth setup, Prisma schema, PostgreSQL migrations | 1 week |
| Core AI Features | Roadmap generation, Career Tree, Quiz (both phases) | 3 weeks |
| Job Hunting Module | JSearch API integration, application tracker | 1 week |
| Learning & Courses | Saved resources, instructor platform, course management | 1 week |
| Admin Dashboard | User stats, activity logs, charts, admin auth | 1 week |
| Testing & Bug Fixing | Test cases, regression testing, performance tuning | 1 week |
| Deployment & Documentation | Vercel deployment, README, project report | 1 week |
| **Total** | | **~11 weeks** |

**Effort Estimation (Person-Hours):**

| Module | Estimated Hours |
|---|---|
| Authentication & User Management | 20 hrs |
| AI Roadmap Generation | 30 hrs |
| Career Tree (React Flow) | 35 hrs |
| Career Quiz (Two-Phase) | 25 hrs |
| Job Hunting & Tracker | 30 hrs |
| Learning Resources | 20 hrs |
| Instructor/Course Platform | 35 hrs |
| Admin Dashboard | 30 hrs |
| UI/UX & Dark Mode | 25 hrs |
| Testing & Documentation | 20 hrs |
| **Total** | **~270 hrs** |

**Cost Estimation:**

| Resource | Cost |
|---|---|
| Groq API | Free tier (10K tokens/min) — $0 for development |
| JSearch API (RapidAPI) | Free tier (500 requests/month) — $0 for development |
| PostgreSQL (Supabase) | Free tier (500MB) — $0 for development |
| Vercel Hosting | Free tier — $0 for development |
| Domain Name | ~$10–15/year (optional) |
| **Total Development Cost** | **~$0–15** |

#### 2.1.3 Roles and Responsibilities

| Role | Responsibilities |
|---|---|
| **Full Stack Developer** | Next.js App Router setup, API route development, database integration, deployment |
| **AI Integration Engineer** | Groq API prompt engineering, roadmap/tree/quiz generation logic, response parsing |
| **UI/UX Designer** | Tailwind CSS component design, dark mode implementation, responsive layout, animations |
| **Database Administrator** | Prisma schema design, migrations, query optimization, PostgreSQL management |
| **QA Engineer** | Test case design, manual testing, API testing, bug reporting and verification |
| **Project Manager** | Sprint planning, task tracking, stakeholder communication, documentation |

> Note: In a small team or solo project, these roles may overlap. One developer may handle multiple responsibilities across sprints.

#### 2.1.4 Group Dependencies

The following inter-module dependencies were identified during planning:

| Dependency | Description |
|---|---|
| Auth → All Modules | Every protected feature requires a valid NextAuth session. Auth must be implemented first. |
| Database Schema → All Modules | Prisma models must be defined and migrated before any module can read/write data. |
| Groq API → Roadmap, Tree, Quiz | All AI generation features depend on a valid Groq API key and network access. |
| JSearch API → Job Hunting | Live job listings depend on JSearch API quota and availability. |
| User Role → Admin Panel | Admin access depends on the `role` field in the User model being set correctly. |
| Course Schema → Instructor Module | The Course, Section, and Lecture tables must exist before the instructor platform can function. |

### 2.2 Project Scheduling

```
Gantt Chart

Task                        | W1 | W2 | W3 | W4 | W5 | W6 | W7 | W8 | W9 | W10 | W11
----------------------------|----|----|----|----|----|----|----|----|----|----|-----
Requirements & Planning     | ██ |    |    |    |    |    |    |    |    |     |
UI/UX Design                |    | ██ |    |    |    |    |    |    |    |     |
Auth & Database Setup       |    |    | ██ |    |    |    |    |    |    |     |
AI Roadmap Generation       |    |    |    | ██ |    |    |    |    |    |     |
Career Tree Module          |    |    |    |    | ██ |    |    |    |    |     |
Career Quiz Module          |    |    |    |    |    | ██ |    |    |    |     |
Job Hunting & Tracker       |    |    |    |    |    |    | ██ |    |    |     |
Learning & Courses          |    |    |    |    |    |    |    | ██ |    |     |
Admin Dashboard             |    |    |    |    |    |    |    |    | ██ |     |
Testing & Bug Fixing        |    |    |    |    |    |    |    |    |    | ██  |
Deployment & Docs           |    |    |    |    |    |    |    |    |    |     | ██
```

---

## 3.0 System Requirements Study

### 3.1 User Characteristics

CareerSence serves five distinct types of users, each with different goals, technical abilities, and interaction patterns:

| User Type | Description | Technical Level | Primary Goals |
|---|---|---|---|
| **Student** | High school or college student exploring career options for the first time | Low to Medium | Discover suitable careers, understand required skills, find learning resources |
| **Recent Graduate** | Newly graduated individual entering the job market | Medium | Generate career roadmap, search for entry-level jobs, track applications |
| **Career Switcher** | Working professional transitioning to a new field | Medium to High | Understand skill gaps, get AI roadmap for new field, find relevant job listings |
| **Instructor** | Subject matter expert creating educational content | Medium to High | Create and publish courses, manage sections and lectures, reach learners |
| **Administrator** | Platform manager responsible for system health and user management | High | Monitor user activity, manage content, view analytics, ensure platform integrity |

**Detailed User Profiles:**

**Student:**
- Age range: 16–24
- Uses the platform primarily for career discovery (quiz, career tree)
- May not have a clear career goal yet — relies heavily on AI recommendations
- Likely to use the platform on mobile devices
- Needs simple, guided UI with clear calls to action

**Job Seeker / Recent Graduate:**
- Age range: 22–30
- Uses the platform for roadmap generation and job hunting
- Actively tracks multiple job applications simultaneously
- Needs fast job search with relevant filters and easy status updates
- Values saved history to revisit previous roadmaps and quiz results

**Career Switcher:**
- Age range: 28–45
- Has existing skills but needs guidance on how they transfer to a new field
- Uses AI roadmap to identify skill gaps and learning priorities
- Needs detailed, actionable roadmap steps with resource recommendations
- May use the platform on desktop during work hours

**Instructor:**
- Age range: 25–50
- Creates structured courses with sections and lectures
- Needs a clean course management interface with drag-and-drop or ordered content
- Wants to publish courses and track enrollment

**Admin:**
- Accesses the platform via a restricted `.admin.com` email
- Needs comprehensive dashboards with charts, user lists, and activity logs
- Requires the ability to manage users, courses, and platform settings

### 3.2 Hardware and Software Requirements

#### Minimum Requirements to Run the System (Development/Server):

| Component | Minimum Requirement |
|---|---|
| CPU | Dual-core 2.0 GHz or higher |
| RAM | 4 GB (8 GB recommended) |
| Storage | 2 GB free disk space |
| Operating System | Windows 10, macOS 10.15+, or Ubuntu 20.04+ |
| Node.js | v18.0.0 or later |
| PostgreSQL | v14.0 or later |
| npm | v9.0.0 or later |
| Internet Connection | Required for Groq API and JSearch API calls |

#### Minimum Requirements for End Users (Browser):

| Component | Requirement |
|---|---|
| Browser | Chrome 90+, Firefox 88+, Edge 90+, Safari 14+ |
| Internet | Broadband (1 Mbps+) for AI features; 5 Mbps+ recommended |
| Screen Resolution | 320px minimum width (mobile-responsive) |
| JavaScript | Must be enabled |
| Cookies | Must be enabled (for NextAuth session) |

#### Software Dependencies:

| Package | Version | Purpose |
|---|---|---|
| next | 16.1.6 | Core framework |
| react | 18+ | UI library |
| @prisma/client | 6.19.2 | Database ORM client |
| next-auth | 4+ | Authentication |
| @xyflow/react | 12+ | Career tree visualization |
| framer-motion | 11+ | Animations |
| tailwindcss | 3+ | Styling |
| bcryptjs | 2+ | Password hashing |
| groq-sdk | latest | Groq API client |

### 3.3 Assumptions and Dependencies

#### Assumptions:
1. **Internet Connectivity**: All users are assumed to have a stable internet connection. The platform does not support offline mode.
2. **Valid API Keys**: The Groq API key and JSearch API key are assumed to be valid, active, and have sufficient quota for the expected usage volume.
3. **PostgreSQL Availability**: The PostgreSQL database is assumed to be running and accessible at the `DATABASE_URL` specified in the `.env` file.
4. **Modern Browser**: Users are assumed to be using a modern, JavaScript-enabled browser. Legacy browsers (IE11 and below) are not supported.
5. **Single Tenant**: The platform is designed as a single-tenant application. Multi-tenancy (multiple organizations) is not in scope.
6. **Email Uniqueness**: Each user registers with a unique email address. Duplicate emails are rejected at the database level.
7. **Admin Email Convention**: Admin users must have an email ending in `.admin.com`. This is enforced at the application level.
8. **English Language**: All AI-generated content (roadmaps, quiz questions, career recommendations) is in English. Non-English inputs may produce inconsistent results.

#### Dependencies:
1. **Groq API**: The AI roadmap, career tree, and quiz features are entirely dependent on the Groq API. If the API is unavailable or rate-limited, these features will fail gracefully with an error message.
2. **JSearch API (RapidAPI)**: The job search feature depends on JSearch API. Rate limits on the free tier (500 requests/month) may restrict usage in production.
3. **NextAuth.js**: All authenticated routes depend on NextAuth session management. The `NEXTAUTH_SECRET` environment variable must be set for sessions to work correctly.
4. **Prisma Migrations**: All database-dependent features require that `npx prisma migrate dev` has been run successfully and all tables exist in the database.
5. **Environment Variables**: The application will not function without the following environment variables set in `.env`:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - `GROQ_API_KEY`

---

## 4.0 System Analysis

### 4.1 Study of Current System
Before CareerSence, individuals seeking career guidance relied on a fragmented ecosystem of disconnected tools:

- **Static Career Counseling Websites** (e.g., CareerExplorer, 16Personalities): Provide generic career suggestions based on fixed personality or aptitude tests. Results are not personalized to the user's actual skills, education, or current job market demand.
- **Manual Job Boards** (e.g., LinkedIn, Indeed, Naukri): Offer job listings but no integrated career planning, roadmap generation, or application tracking. Users must manually manage their applications in spreadsheets.
- **YouTube / Blog Roadmaps**: Career roadmaps exist as static blog posts or YouTube videos that quickly become outdated and are not tailored to individual users.
- **Paid Career Coaches**: Effective but expensive ($100–$500/session), inaccessible to most students and early-career professionals.
- **Separate Learning Platforms** (e.g., Coursera, Udemy): Provide courses but no connection to career planning or job hunting. Users must manually identify which courses are relevant to their goals.

The result is a fragmented, expensive, and inefficient career planning experience where users must juggle multiple platforms, manually connect the dots, and rely on generic advice that may not apply to their specific situation.

### 4.2 Problems and Weaknesses of Current System

| Problem | Impact |
|---|---|
| No AI-driven personalization | Users receive generic career advice not tailored to their skills, goals, or market demand |
| Fragmented tools | Users must switch between 4–6 different platforms to plan, learn, search, and track |
| No visual career path representation | Text-based career advice is hard to understand and navigate |
| Static career quizzes | Fixed question sets cannot adapt to individual user responses |
| No integrated job tracking | Users lose track of applications, miss follow-ups, and miss opportunities |
| Expensive human counseling | Career coaching is inaccessible to most students and early-career professionals |
| Outdated roadmaps | Static blog/video roadmaps become outdated as technology and job markets evolve |
| No history or progress tracking | Users cannot revisit past career plans or track their growth over time |

### 4.3 Requirements of New System

#### 4.3.1 Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR01 | Users must be able to register with email and password | High |
| FR02 | Users must be able to log in and maintain a persistent session | High |
| FR03 | Users must be able to generate an AI career roadmap by entering skills and goals | High |
| FR04 | The system must save generated roadmaps to the user's history | High |
| FR05 | Users must be able to view an interactive, node-based career tree | High |
| FR06 | The system must generate career tree nodes and edges using AI | High |
| FR07 | Users must be able to take a two-phase AI career quiz | High |
| FR08 | Phase 2 quiz questions must be dynamically generated by AI based on Phase 1 answers | High |
| FR09 | The system must display ranked career recommendations after quiz completion | High |
| FR10 | Users must be able to search live job listings by keyword, location, and type | High |
| FR11 | Users must be able to save jobs and update their application status | High |
| FR12 | Users must be able to save and manage learning resources | Medium |
| FR13 | Instructors must be able to create courses with sections and lectures | Medium |
| FR14 | Instructors must be able to publish/unpublish courses | Medium |
| FR15 | Admins must be able to view user statistics and activity logs | Medium |
| FR16 | Admins must be able to manage users and courses | Medium |
| FR17 | The system must support dark and light mode | Medium |
| FR18 | Users must be able to view their quiz, roadmap, and career tree history | Medium |
| FR19 | The system must restrict admin access to `.admin.com` email accounts | High |
| FR20 | Users must be able to update their profile information | Low |

#### 4.3.2 Non-Functional Requirements

| ID | Requirement | Metric |
|---|---|---|
| NFR01 | Performance | Page load time < 2 seconds on broadband |
| NFR02 | AI Response Time | AI generation (roadmap/quiz) < 10 seconds |
| NFR03 | Security | Passwords hashed with bcrypt; sessions signed with JWT |
| NFR04 | Responsiveness | Fully functional on screens from 320px to 2560px wide |
| NFR05 | Availability | Core features available 99% of the time (excluding API downtime) |
| NFR06 | Scalability | Database and API routes designed to handle 1000+ concurrent users |
| NFR07 | Maintainability | TypeScript strict mode; modular component architecture |
| NFR08 | Usability | New users can complete the career quiz without any instructions |
| NFR09 | Data Integrity | All user data persisted in PostgreSQL with foreign key constraints |
| NFR10 | Accessibility | WCAG 2.1 AA compliance for color contrast and keyboard navigation |

### 4.4 Feasibility Study

#### 4.4.1 Does the system contribute to the overall objectives of the organization?
Yes. CareerSence directly addresses the core organizational objective of democratizing career guidance. By replacing expensive, fragmented, and generic career tools with a single AI-powered platform, CareerSence delivers measurable value:
- Students gain access to personalized career guidance previously only available through paid coaches.
- Job seekers improve their application tracking and follow-up rates.
- Instructors gain a platform to share expertise and reach learners.
- The organization gains a scalable, data-driven platform that improves with each user interaction.

#### 4.4.2 Can the system be implemented within the given cost and schedule constraints?
Yes. The technology stack was specifically chosen to minimize cost while maximizing capability:
- **Groq API free tier** provides sufficient AI generation capacity for development and early production.
- **Supabase/Neon free tier** provides PostgreSQL hosting at zero cost.
- **Vercel free tier** provides Next.js hosting with automatic deployments.
- **Open-source libraries** (React Flow, Framer Motion, Tailwind CSS, NextAuth) eliminate licensing costs.
- The estimated 11-week timeline is achievable with a small team of 2–3 developers working full-time.

#### 4.4.3 Can the system be integrated with other systems already in place?
Yes. CareerSence is designed with integration in mind:
- **Groq API**: Integrated via the official `groq-sdk` npm package. Supports streaming responses for real-time AI output.
- **JSearch API**: Integrated via RapidAPI's REST interface. Can be swapped for other job APIs (Indeed, LinkedIn) with minimal code changes.
- **NextAuth.js**: Supports OAuth providers (Google, GitHub) in addition to credentials, enabling future social login integration.
- **PostgreSQL**: Standard relational database compatible with any cloud provider (AWS RDS, Supabase, Neon, Railway).
- **Vercel**: Native Next.js deployment with automatic CI/CD from GitHub.

### 4.5 Activity/Process in New System

**Primary User Flow:**
```
1. User visits CareerSence → Landing page with feature overview
2. User registers / logs in → Authenticated dashboard
3. User takes Career Quiz (Phase 1 + Phase 2) → AI career recommendations
4. User generates Career Roadmap → Step-by-step AI plan saved to history
5. User explores Career Tree → Visual branching career paths
6. User searches for Jobs → Filters by location, type, salary
7. User saves jobs → Updates application status as they progress
8. User saves Learning Resources → Builds personal learning library
9. User enrolls in Courses → Structured learning from instructors
10. User revisits History → Reviews past roadmaps, quizzes, career trees
```

**Admin Flow:**
```
1. Admin logs in with .admin.com email → Admin dashboard
2. Admin views user statistics → Charts and metrics
3. Admin reviews activity logs → User actions and system events
4. Admin manages users → View, search, role management
5. Admin manages courses → Approve, unpublish, or remove content
```

### 4.6 Features of New System

| Feature | Description |
|---|---|
| AI Career Roadmap | Personalized, step-by-step career plan generated by Groq LLM |
| Interactive Career Tree | Node-based visual graph of career paths built with React Flow |
| Two-Phase Career Quiz | Adaptive AI quiz with personalized Phase 2 questions |
| Live Job Search | Real-time job listings from JSearch API with advanced filters |
| Application Tracker | Kanban-style job application status management |
| Learning Resources | Save and organize videos, articles, and courses |
| Instructor Platform | Create, manage, and publish courses with sections and lectures |
| Admin Dashboard | User stats, activity logs, course management, system health |
| History & Progress | Full history of roadmaps, quizzes, and career trees per user |
| Dark/Light Mode | CSS variable-based theme switching across all components |
| Secure Authentication | NextAuth.js with bcrypt password hashing and JWT sessions |

### 4.7 Use Case Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        CareerSence System                    │
│                                                              │
│  [Guest]                                                     │
│    ├── Register                                              │
│    └── Login                                                 │
│                                                              │
│  [Registered User]                                           │
│    ├── Take Career Quiz (Phase 1 + Phase 2)                  │
│    ├── Generate AI Career Roadmap                            │
│    ├── View Interactive Career Tree                          │
│    ├── Search Live Job Listings                              │
│    ├── Track Job Applications                                │
│    ├── Save Learning Resources                               │
│    ├── Enroll in Courses                                     │
│    ├── View History (Roadmaps, Quizzes, Trees)               │
│    └── Update Profile                                        │
│                                                              │
│  [Instructor] (extends Registered User)                      │
│    ├── Create Course                                         │
│    ├── Add Sections and Lectures                             │
│    ├── Edit Course Content                                   │
│    └── Publish / Unpublish Course                            │
│                                                              │
│  [Admin] (restricted to .admin.com email)                    │
│    ├── View User Statistics                                  │
│    ├── Monitor Activity Logs                                 │
│    ├── Manage Users                                          │
│    └── Manage Courses                                        │
└─────────────────────────────────────────────────────────────┘
```

### 4.8 Class Diagram

```
┌──────────────────────┐
│        User          │
├──────────────────────┤
│ id: String (cuid)    │
│ name: String         │
│ email: String        │
│ password: String     │
│ role: Enum           │  ← USER | ADMIN
│ createdAt: DateTime  │
│ updatedAt: DateTime  │
└──────────┬───────────┘
           │ 1
    ┌──────┼──────────────────────────────────────┐
    │      │                                      │
    ▼ *    ▼ *                                    ▼ *
┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐
│ CareerRoadmap│  │  CareerTree  │  │     QuizResult       │
├──────────────┤  ├──────────────┤  ├──────────────────────┤
│ id           │  │ id           │  │ id                   │
│ userId       │  │ userId       │  │ userId               │
│ title        │  │ nodes: JSON  │  │ answers: JSON        │
│ content: JSON│  │ edges: JSON  │  │ result: JSON         │
│ createdAt    │  │ createdAt    │  │ createdAt            │
└──────────────┘  └──────────────┘  └──────────────────────┘

    ▼ *                    ▼ *                  ▼ *
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  JobApplication  │  │  SavedResource   │  │     Course       │
├──────────────────┤  ├──────────────────┤  ├──────────────────┤
│ id               │  │ id               │  │ id               │
│ userId           │  │ userId           │  │ title            │
│ jobTitle         │  │ resourceId       │  │ description      │
│ company          │  │ title            │  │ price: Float     │
│ status: Enum     │  │ url              │  │ status: Enum     │
│ appliedAt        │  │ type             │  │ coverImage       │
│ notes            │  │ source           │  │ authorId         │
│ createdAt        │  │ createdAt        │  │ createdAt        │
└──────────────────┘  └──────────────────┘  └────────┬─────────┘
                                                      │ 1
                                                      ▼ *
                                             ┌──────────────────┐
                                             │     Section      │
                                             ├──────────────────┤
                                             │ id               │
                                             │ courseId         │
                                             │ title            │
                                             │ order: Int       │
                                             └────────┬─────────┘
                                                      │ 1
                                                      ▼ *
                                             ┌──────────────────┐
                                             │     Lecture      │
                                             ├──────────────────┤
                                             │ id               │
                                             │ sectionId        │
                                             │ title            │
                                             │ videoUrl         │
                                             │ duration: Int    │
                                             │ order: Int       │
                                             └──────────────────┘
```

### 4.9 Sequence Diagram

**AI Roadmap Generation:**
```
User          Browser         /api/ai-roadmap      Groq API        Prisma/DB
 │                │                  │                  │               │
 │─ Enter skills ─▶                  │                  │               │
 │  & goals       │                  │                  │               │
 │                │─── POST request ─▶                  │               │
 │                │   {skills,goals} │                  │               │
 │                │                  │─── Build prompt ─▶               │
 │                │                  │   + Send to Groq │               │
 │                │                  │                  │               │
 │                │                  │◀── JSON roadmap ─│               │
 │                │                  │                  │               │
 │                │                  │─────────────────────── Save ────▶│
 │                │                  │                  │    to DB      │
 │                │                  │◀─────────────────────── OK ──────│
 │                │◀── Return roadmap│                  │               │
 │◀ Render steps ─│                  │                  │               │
```

**Two-Phase Career Quiz:**
```
User          Browser         /api/quiz            Groq API        Prisma/DB
 │                │                  │                  │               │
 │─ Answer P1 ───▶│                  │                  │               │
 │                │─── POST Phase1 ──▶                  │               │
 │                │                  │─── Generate P2 ──▶               │
 │                │                  │    questions      │               │
 │                │                  │◀── 10 questions ──│               │
 │                │◀── Phase2 Qs ────│                  │               │
 │─ Answer P2 ───▶│                  │                  │               │
 │                │─── POST Phase2 ──▶                  │               │
 │                │                  │─── Analyze all ──▶               │
 │                │                  │    answers        │               │
 │                │                  │◀── Career results─│               │
 │                │                  │─────────────────────── Save ────▶│
 │                │◀── Results ───────│                  │               │
 │◀ Show careers ─│                  │                  │               │
```

### 4.10 Data Modeling

#### 4.10.1 Data Dictionary

| Table | Field | Type | Constraints | Description |
|---|---|---|---|---|
| User | id | String | PK, cuid() | Unique user identifier |
| User | name | String | NOT NULL | User's full name |
| User | email | String | UNIQUE, NOT NULL | User's email address |
| User | password | String | NOT NULL | bcrypt-hashed password |
| User | role | Enum | DEFAULT 'USER' | USER or ADMIN |
| User | createdAt | DateTime | DEFAULT now() | Account creation timestamp |
| CareerRoadmap | id | String | PK, cuid() | Unique roadmap identifier |
| CareerRoadmap | userId | String | FK → User.id | Owner of the roadmap |
| CareerRoadmap | title | String | NOT NULL | Roadmap title |
| CareerRoadmap | content | JSON | NOT NULL | AI-generated roadmap steps |
| CareerTree | id | String | PK, cuid() | Unique tree identifier |
| CareerTree | userId | String | FK → User.id | Owner of the tree |
| CareerTree | nodes | JSON | NOT NULL | React Flow node definitions |
| CareerTree | edges | JSON | NOT NULL | React Flow edge definitions |
| QuizResult | id | String | PK, cuid() | Unique quiz result identifier |
| QuizResult | userId | String | FK → User.id | User who took the quiz |
| QuizResult | answers | JSON | NOT NULL | All phase 1 + phase 2 answers |
| QuizResult | result | JSON | NOT NULL | AI-generated career recommendations |
| JobApplication | id | String | PK, cuid() | Unique application identifier |
| JobApplication | userId | String | FK → User.id | User tracking the application |
| JobApplication | jobTitle | String | NOT NULL | Job title |
| JobApplication | company | String | NOT NULL | Company name |
| JobApplication | status | Enum | DEFAULT 'SAVED' | SAVED/APPLIED/INTERVIEWING/OFFERED/REJECTED |
| SavedResource | id | String | PK, cuid() | Unique resource identifier |
| SavedResource | userId | String | FK → User.id | User who saved the resource |
| SavedResource | title | String | NOT NULL | Resource title |
| SavedResource | url | String | NOT NULL | Resource URL |
| SavedResource | type | String | NOT NULL | video / article / course |
| Course | id | String | PK, cuid() | Unique course identifier |
| Course | title | String | NOT NULL | Course title |
| Course | description | String | — | Course description |
| Course | price | Float | DEFAULT 0 | Course price (0 = free) |
| Course | status | Enum | DEFAULT 'DRAFT' | DRAFT or PUBLISHED |
| Course | authorId | String | FK → User.id | Instructor who created the course |
| Section | id | String | PK, cuid() | Unique section identifier |
| Section | courseId | String | FK → Course.id | Parent course |
| Section | title | String | NOT NULL | Section title |
| Section | order | Int | NOT NULL | Display order within course |
| Lecture | id | String | PK, cuid() | Unique lecture identifier |
| Lecture | sectionId | String | FK → Section.id | Parent section |
| Lecture | title | String | NOT NULL | Lecture title |
| Lecture | videoUrl | String | — | Video URL |
| Lecture | duration | Int | — | Duration in seconds |
| Lecture | order | Int | NOT NULL | Display order within section |

#### 4.10.2 ER Diagram

```
┌──────────┐     1:N    ┌──────────────────┐
│   User   │───────────▶│  CareerRoadmap   │
│          │            └──────────────────┘
│          │     1:N    ┌──────────────────┐
│          │───────────▶│   CareerTree     │
│          │            └──────────────────┘
│          │     1:N    ┌──────────────────┐
│          │───────────▶│   QuizResult     │
│          │            └──────────────────┘
│          │     1:N    ┌──────────────────┐
│          │───────────▶│ JobApplication   │
│          │            └──────────────────┘
│          │     1:N    ┌──────────────────┐
│          │───────────▶│  SavedResource   │
│          │            └──────────────────┘
│          │     1:N    ┌──────────────────┐     1:N    ┌──────────┐     1:N    ┌──────────┐
│          │───────────▶│     Course       │───────────▶│ Section  │───────────▶│ Lecture  │
└──────────┘            └──────────────────┘            └──────────┘            └──────────┘
```

### 4.11 Main Modules of New System

| # | Module | Description | Key Files |
|---|---|---|---|
| 1 | Authentication | User registration, login, session management | `app/(auth)/`, `app/api/auth/` |
| 2 | AI Roadmap | Groq-powered career roadmap generation and history | `app/ai-roadmap/`, `app/api/ai-roadmap/` |
| 3 | Career Tree | Interactive React Flow career tree with AI generation | `app/career-tree/`, `app/api/career-tree/` |
| 4 | Career Quiz | Two-phase adaptive AI career assessment | `app/career-quiz/`, `app/api/quiz/` |
| 5 | Job Hunting | JSearch API integration + application tracker | `app/job-hunting/`, `app/api/jobs/` |
| 6 | Learning Resources | Save, browse, and manage learning resources | `app/learning-resources/`, `app/api/learning/` |
| 7 | Courses | Instructor course creation and student enrollment | `app/courses/`, `app/api/courses/`, `app/api/instructor/` |
| 8 | Admin Dashboard | User management, analytics, activity logs | `app/admin/`, `app/api/admin/` |
| 9 | Profile | User profile view and edit, history overview | `app/profile/` |
| 10 | Shared UI | Reusable components (Button, Card, Modal, Tabs) | `components/ui/` |

### 4.12 Selection of Hardware, Software and Justification

| Selection | Justification |
|---|---|
| **Next.js 16** | Industry-leading full-stack React framework. App Router enables server components, streaming SSR, and co-located API routes — reducing infrastructure complexity. |
| **PostgreSQL** | Battle-tested, open-source relational database with excellent support for JSON fields (used for roadmap content, quiz answers, tree nodes). Supported by all major cloud providers. |
| **Prisma ORM** | Type-safe database access with auto-generated TypeScript types. Schema-first approach makes migrations safe and predictable. Best-in-class DX for Next.js + PostgreSQL. |
| **Groq API** | Fastest available LLM inference (LPU architecture). Free tier sufficient for development. LLaMA 3 models produce high-quality structured JSON output for roadmaps and quizzes. |
| **React Flow (@xyflow/react)** | The standard library for interactive node graphs in React. Supports custom nodes, edges, zoom, pan, and layout algorithms. Used in production by major tech companies. |
| **Framer Motion** | Declarative animation library for React. Enables smooth page transitions, floating animations, and micro-interactions that significantly improve perceived performance. |
| **Tailwind CSS** | Utility-first CSS eliminates the need for custom CSS files. CSS variable-based theming enables seamless dark/light mode. Consistent design system across all components. |
| **NextAuth.js** | The standard authentication solution for Next.js. Handles JWT sessions, CSRF protection, and supports multiple providers (credentials, OAuth) out of the box. |
| **JSearch API** | Aggregates job listings from multiple sources (LinkedIn, Indeed, Glassdoor) via a single API. Provides rich job data including salary, requirements, and application links. |

---

## 5.0 System Design

### 5.1 System Application Design

#### 5.1.1 Method Pseudocode

**User Registration:**
```
function registerUser(name, email, password):
  if userExists(email):
    return error("Email already registered")
  hashedPassword = bcrypt.hash(password, 10)
  user = prisma.user.create({ name, email, password: hashedPassword, role: "USER" })
  return success(user)
```

**AI Roadmap Generation:**
```
function generateRoadmap(userId, skills, targetRole, timeline):
  session = getSession()
  if not session: return 401 Unauthorized

  prompt = """
    You are a career advisor. Generate a detailed career roadmap for:
    Current Skills: {skills}
    Target Role: {targetRole}
    Timeline: {timeline}
    Return a JSON array of steps with: title, description, duration, resources[], status
  """
  response = groq.chat.completions.create(model="llama3-70b", messages=[{role:"user", content: prompt}])
  roadmap = JSON.parse(response.choices[0].message.content)
  saved = prisma.careerRoadmap.create({ userId, title: targetRole, content: roadmap })
  return saved
```

**Two-Phase Career Quiz:**
```
// Phase 1: Static questions
function startQuiz():
  return PREDEFINED_QUESTIONS  // 10 fixed questions about interests, skills, work style

// Phase 2: AI-generated personalized questions
function generatePhase2(phase1Answers):
  prompt = """
    Based on these career interest answers: {phase1Answers}
    Generate 10 personalized follow-up questions to better understand
    the user's specific strengths, preferences, and career goals.
    Return JSON array: [{id, question, options[]}]
  """
  response = groq.chat.completions.create(prompt)
  return JSON.parse(response)

// Final analysis
function analyzeQuiz(phase1Answers, phase2Answers):
  prompt = """
    Analyze these quiz answers and provide career recommendations:
    Phase 1: {phase1Answers}
    Phase 2: {phase2Answers}
    Return JSON: { careers: [{title, match%, description, skills[], roadmap}] }
  """
  result = groq.chat.completions.create(prompt)
  prisma.quizResult.create({ userId, answers: {...}, result })
  return result
```

**Job Search:**
```
function searchJobs(query, location, type, page):
  response = fetch("https://jsearch.p.rapidapi.com/search", {
    params: { query, location, employment_types: type, page },
    headers: { "X-RapidAPI-Key": JSEARCH_API_KEY }
  })
  jobs = response.data
  return jobs

function updateApplicationStatus(userId, jobId, status):
  existing = prisma.jobApplication.findFirst({ userId, jobId })
  if existing:
    return prisma.jobApplication.update({ status })
  else:
    return prisma.jobApplication.create({ userId, jobId, status })
```

**Career Tree Generation:**
```
function generateCareerTree(userId, currentRole, targetRole):
  prompt = """
    Create a career path tree from {currentRole} to {targetRole}.
    Return JSON with:
    nodes: [{id, label, type, description, skills[]}]
    edges: [{source, target, label}]
    Use a hierarchical layout with branching paths.
  """
  response = groq.chat.completions.create(prompt)
  tree = JSON.parse(response)
  prisma.careerTree.create({ userId, nodes: tree.nodes, edges: tree.edges })
  return tree
```

### 5.2 Input/Output and Interface Design

#### 5.2.1 State Transition Diagram

**Career Quiz States:**
```
[IDLE] ──── Start Quiz ────▶ [PHASE_1]
[PHASE_1] ── Submit P1 ────▶ [LOADING_PHASE_2]
[LOADING_PHASE_2] ── AI Done ▶ [PHASE_2]
[PHASE_2] ── Submit P2 ────▶ [ANALYZING]
[ANALYZING] ── AI Done ────▶ [RESULTS]
[RESULTS] ── Retake ────────▶ [IDLE]
```

**Job Application Status Transitions:**
```
[SAVED] ──▶ [APPLIED] ──▶ [INTERVIEWING] ──▶ [OFFERED]
                                          └──▶ [REJECTED]
[SAVED] ──▶ [REJECTED]
```

#### 5.2.2 Sample Interfaces

**Dashboard:**
- Hero section with personalized greeting
- Quick-action cards: Generate Roadmap, Take Quiz, Explore Career Tree, Search Jobs
- Recent activity: Last roadmap, last quiz result, saved jobs count

**AI Roadmap Page:**
- Input form: Current skills (tags), Target role (text), Timeline (dropdown)
- Generate button with loading state (logo bounce animation)
- Roadmap display: Vertical timeline of step cards
- Each step card: Title, description, duration, resources list, status badge
- History sidebar: Previous roadmaps with timestamps

**Career Tree Page:**
- Input panel: Current role, Target role, Generate button
- Full-screen React Flow canvas with zoom/pan controls
- Custom node types: Role nodes (blue), Skill nodes (green), Milestone nodes (orange)
- Edge labels showing transition requirements
- Mini-map for navigation on large trees

**Job Hunting Page:**
- Search bar with keyword input
- Filter panel: Location, Job Type (Full-time/Part-time/Remote), Salary range
- Job cards: Title, Company, Location, Salary, Posted date, Apply button
- Application tracker tab: Kanban columns by status
- Each tracker card: Job title, company, status dropdown, notes, date

**Admin Dashboard:**
- Sidebar navigation: Overview, Users, Courses, Activity Log
- Overview: Total users chart, new registrations graph, active sessions
- Users table: Search, filter by role, view profile, change role
- Activity log: Timestamped user actions with filters

### 5.3 Database Design

#### 5.3.1 Mapping of ER Diagrams into Tables

```sql
-- Users table
CREATE TABLE "User" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'USER',
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Career Roadmaps
CREATE TABLE "CareerRoadmap" (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Career Trees
CREATE TABLE "CareerTree" (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  nodes JSONB NOT NULL,
  edges JSONB NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Quiz Results
CREATE TABLE "QuizResult" (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  answers JSONB NOT NULL,
  result JSONB NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Job Applications
CREATE TABLE "JobApplication" (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "jobTitle" TEXT NOT NULL,
  company TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'SAVED',
  notes TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Saved Resources
CREATE TABLE "SavedResource" (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "resourceId" TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL,
  source TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Courses
CREATE TABLE "Course" (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price FLOAT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  "coverImage" TEXT,
  "authorId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Sections
CREATE TABLE "Section" (
  id TEXT PRIMARY KEY,
  "courseId" TEXT NOT NULL REFERENCES "Course"(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  "order" INT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Lectures
CREATE TABLE "Lecture" (
  id TEXT PRIMARY KEY,
  "sectionId" TEXT NOT NULL REFERENCES "Section"(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  "videoUrl" TEXT,
  duration INT,
  "order" INT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW()
);
```

#### 5.3.2 Normalization

**First Normal Form (1NF):**
- All tables have a primary key.
- All columns contain atomic values (no repeating groups).
- JSON fields (content, nodes, edges, answers) store structured data as a single atomic value — acceptable in PostgreSQL with JSONB type.

**Second Normal Form (2NF):**
- All non-key attributes are fully functionally dependent on the primary key.
- No partial dependencies exist (all tables use single-column primary keys).

**Third Normal Form (3NF):**
- No transitive dependencies.
- For example, in `JobApplication`, the `company` field is directly about the job, not derived from another non-key field.
- User profile data is stored only in the `User` table and referenced by foreign key in all other tables.

**Result**: All tables are in **3NF**, ensuring minimal data redundancy and maximum data integrity.

### 5.4 Access Control and Security

| Security Layer | Implementation |
|---|---|
| **Password Hashing** | bcryptjs with salt rounds = 10. Passwords are never stored in plain text. |
| **Session Management** | NextAuth.js JWT sessions signed with `NEXTAUTH_SECRET`. Sessions expire after 30 days. |
| **API Route Protection** | Every protected API route calls `getServerSession()` and returns 401 if no valid session exists. |
| **Admin Access Control** | Admin routes check `session.user.email.endsWith('.admin.com')` before granting access. |
| **SQL Injection Prevention** | Prisma uses parameterized queries exclusively. Raw SQL is never used. |
| **Environment Variables** | All secrets (API keys, DB URL, auth secret) stored in `.env` files, never hardcoded. |
| **CSRF Protection** | NextAuth.js includes built-in CSRF token validation for all auth endpoints. |
| **Input Validation** | All API routes validate required fields and return 400 Bad Request for invalid inputs. |

---

## 6.0 Implementation Planning

### 6.1 Implementation Environment
- **Multi-user** web application accessible via browser — no client-side installation required.
- **GUI-based** interface built with React and Tailwind CSS.
- **Server-side rendering** via Next.js App Router for fast initial page loads.
- **Single codebase** for both frontend and backend (Next.js API routes).
- Runs on **Node.js v18+** on the server; any modern browser on the client.
- Supports **concurrent users** through stateless JWT sessions and connection pooling via Prisma.

### 6.2 Program/Module Specification

| Module | Route/Path | API Endpoints | Key Components |
|---|---|---|---|
| Authentication | `app/(auth)/signin`, `app/(auth)/signup` | `POST /api/auth/[...nextauth]` | SignInForm, SignUpForm |
| Dashboard | `app/dashboard` | `GET /api/auth/session` | DashboardCards, RecentActivity |
| AI Roadmap | `app/ai-roadmap` | `POST /api/ai-roadmap`, `GET /api/ai-roadmap/history` | RoadmapForm, RoadmapStepCard, RoadmapHistorySection |
| Career Tree | `app/career-tree` | `POST /api/career-tree`, `GET /api/career-tree/history` | CareerTreeCanvas, CareerTreeHistorySection |
| Career Quiz | `app/career-quiz` | `POST /api/quiz/phase1`, `POST /api/quiz/phase2` | QuizQuestion, QuizResults, QuizHistorySection |
| Job Hunting | `app/job-hunting` | `GET /api/jobs/search`, `POST /api/jobs/track` | JobCard, ApplicationTracker, JobFilters |
| Learning Resources | `app/learning-resources` | `GET /api/learning/search`, `POST /api/learning/save`, `GET /api/learning/saved` | ResourceCard, SavedResourcesSection |
| Courses | `app/courses`, `app/courses/[id]` | `GET /api/courses/search`, `GET /api/courses/[id]` | CourseCard, CourseDetail, LectureList |
| Instructor | `app/learning-resources/instructor` | `GET /api/instructor/courses`, `POST /api/instructor/courses`, `PUT /api/instructor/courses/[id]` | InstructorDashboard, CourseEditor |
| Admin | `app/admin` | `GET /api/admin/users`, `GET /api/admin/stats` | AdminSidebar, UserManagement, AdminOverviewCharts |
| Profile | `app/profile` | `GET /api/profile`, `PUT /api/profile` | ProfileForm, HistoryTabs |
| Analyze | `app/analyze` | `POST /api/analyze/resume`, `POST /api/analyze/career` | ResumeAnalysis, CareerComparison |

### 6.3 Security Features

1. **Authentication**: NextAuth.js credentials provider with bcrypt password hashing (10 salt rounds). No plain-text passwords ever stored or transmitted.

2. **Session Security**: JWT tokens signed with `NEXTAUTH_SECRET`. Tokens are HTTP-only cookies, preventing XSS access. Sessions expire after 30 days.

3. **Authorization**: Every API route that accesses user data calls `getServerSession()` first. Unauthenticated requests receive `401 Unauthorized` immediately.

4. **Admin Restriction**: Admin panel access is double-protected:
   - Email must end with `.admin.com`
   - User `role` in database must be `ADMIN`
   - Both checks must pass; failing either returns `403 Forbidden`

5. **SQL Injection Prevention**: Prisma ORM uses parameterized queries for all database operations. No raw SQL strings are constructed from user input.

6. **Input Validation**: All POST/PUT API routes validate required fields, data types, and length constraints before processing. Invalid requests return `400 Bad Request` with descriptive error messages.

7. **Environment Variable Security**: All sensitive credentials (API keys, database URL, auth secret) are stored in `.env` files excluded from version control via `.gitignore`.

8. **CSRF Protection**: NextAuth.js includes built-in CSRF token validation for all authentication endpoints.

9. **Rate Limiting** (recommended for production): API routes calling Groq and JSearch should implement rate limiting per user to prevent abuse and quota exhaustion.

### 6.4 Coding Standards

| Standard | Implementation |
|---|---|
| **Language** | TypeScript with strict mode enabled (`"strict": true` in tsconfig.json) |
| **Linting** | ESLint with Next.js recommended rules |
| **Formatting** | Prettier with consistent indentation (2 spaces) |
| **Component Structure** | Each component in its own file; named exports for UI components, default exports for pages |
| **API Routes** | RESTful conventions: GET for reads, POST for creates, PUT for updates, DELETE for deletes |
| **Error Handling** | All API routes wrapped in try/catch; errors logged server-side, generic messages returned to client |
| **Type Safety** | No `any` types except where unavoidable (e.g., NextAuth session extensions); all API responses typed |
| **File Naming** | kebab-case for files and folders; PascalCase for React components |
| **Comments** | JSDoc comments for complex functions; inline comments for non-obvious logic |
| **Git Commits** | Conventional commits format: `feat:`, `fix:`, `chore:`, `docs:` prefixes |

---

## 7.0 Testing

### 7.1 Testing Plan

The testing plan for CareerSence covers four levels:

1. **Unit Testing**: Test individual functions and API route handlers in isolation (e.g., password hashing, JSON parsing of AI responses, input validation logic).
2. **Integration Testing**: Test the interaction between components — e.g., API route → Prisma → PostgreSQL, or Frontend → API → Groq API.
3. **System Testing**: End-to-end testing of complete user flows from registration through career planning to job tracking.
4. **User Acceptance Testing (UAT)**: Real users test the platform against the defined requirements and provide feedback.

**Testing Tools:**
- Jest + React Testing Library for unit and component tests
- Postman / Thunder Client for API endpoint testing
- Manual browser testing for UI/UX validation
- Chrome DevTools Lighthouse for performance profiling

### 7.2 Testing Strategy

**Black-Box Testing** (used for all user-facing features):
- Tester has no knowledge of internal implementation.
- Tests are based on input/output specifications.
- Used for: Registration, Login, Quiz flow, Roadmap generation, Job search, Application tracking.

**White-Box Testing** (used for API routes and business logic):
- Tester has full knowledge of internal code.
- Tests cover all code paths including error branches.
- Used for: API route validation, session checks, AI response parsing, database queries.

**Regression Testing**:
- After each sprint, all previously passing test cases are re-run.
- Ensures new features do not break existing functionality.
- Particularly important after database schema changes (Prisma migrations).

**Performance Testing**:
- AI generation endpoints tested for response time (target: < 10 seconds).
- Page load times measured with Lighthouse (target: > 90 performance score).
- Database query times monitored via Prisma query logging (`prisma:query` logs).

### 7.3 Test Suites Design

#### 7.3.1 Test Cases

**Authentication Module:**

| Test ID | Test Condition | Expected Output | Actual Output | Remark |
|---|---|---|---|---|
| TC-AUTH-01 | Register with valid name, email, password | Account created; redirected to dashboard | ✅ Pass | |
| TC-AUTH-02 | Register with already-used email | Error: "Email already registered" | ✅ Pass | |
| TC-AUTH-03 | Register with empty password | Validation error shown | ✅ Pass | |
| TC-AUTH-04 | Login with correct credentials | Session created; dashboard loaded | ✅ Pass | |
| TC-AUTH-05 | Login with wrong password | Error: "Invalid credentials" | ✅ Pass | |
| TC-AUTH-06 | Access protected page without login | Redirected to sign-in page | ✅ Pass | |
| TC-AUTH-07 | Admin login with `.admin.com` email | Admin dashboard accessible | ✅ Pass | |
| TC-AUTH-08 | Admin login with regular email | Access denied; redirected | ✅ Pass | |

**AI Roadmap Module:**

| Test ID | Test Condition | Expected Output | Actual Output | Remark |
|---|---|---|---|---|
| TC-ROAD-01 | Generate roadmap with valid skills and target role | AI roadmap returned and displayed as step cards | ✅ Pass | |
| TC-ROAD-02 | Generate roadmap with empty skills field | Validation error shown | ✅ Pass | |
| TC-ROAD-03 | Generate roadmap with empty target role | Validation error shown | ✅ Pass | |
| TC-ROAD-04 | Generated roadmap saved to history | Roadmap appears in history list | ✅ Pass | |
| TC-ROAD-05 | View previous roadmap from history | Roadmap steps displayed correctly | ✅ Pass | |

**Career Quiz Module:**

| Test ID | Test Condition | Expected Output | Actual Output | Remark |
|---|---|---|---|---|
| TC-QUIZ-01 | Complete Phase 1 with all answers | Phase 2 questions generated by AI | ✅ Pass | |
| TC-QUIZ-02 | Phase 2 questions are personalized | Questions reference Phase 1 answers | ✅ Pass | |
| TC-QUIZ-03 | Complete Phase 2 with all answers | Career recommendations displayed | ✅ Pass | |
| TC-QUIZ-04 | Quiz result saved to history | Result appears in quiz history | ✅ Pass | |
| TC-QUIZ-05 | Submit quiz without answering all questions | Validation prevents submission | ✅ Pass | |

**Job Hunting Module:**

| Test ID | Test Condition | Expected Output | Actual Output | Remark |
|---|---|---|---|---|
| TC-JOB-01 | Search jobs with keyword "python" | Relevant job listings returned | ✅ Pass | |
| TC-JOB-02 | Search with location filter | Jobs filtered by location | ✅ Pass | |
| TC-JOB-03 | Save a job listing | Job appears in tracker with "SAVED" status | ✅ Pass | |
| TC-JOB-04 | Update application status to "APPLIED" | Status updated in tracker | ✅ Pass | |
| TC-JOB-05 | Search with empty keyword | Validation error shown | ✅ Pass | |

**Course/Instructor Module:**

| Test ID | Test Condition | Expected Output | Actual Output | Remark |
|---|---|---|---|---|
| TC-COURSE-01 | Instructor creates a new course | Course saved with DRAFT status | ✅ Pass | |
| TC-COURSE-02 | Instructor adds section to course | Section appears in course editor | ✅ Pass | |
| TC-COURSE-03 | Instructor publishes course | Course status changes to PUBLISHED | ✅ Pass | |
| TC-COURSE-04 | Student views published course | Course details and lectures visible | ✅ Pass | |
| TC-COURSE-05 | Access instructor panel without auth | 401 Unauthorized returned | ✅ Pass | |

**General UI/UX:**

| Test ID | Test Condition | Expected Output | Actual Output | Remark |
|---|---|---|---|---|
| TC-UI-01 | Toggle dark mode | All components switch to dark theme | ✅ Pass | |
| TC-UI-02 | View on mobile (375px width) | Layout responsive, no overflow | ✅ Pass | |
| TC-UI-03 | Loading state during AI generation | Logo bounce animation displayed | ✅ Pass | |
| TC-UI-04 | Save a learning resource | Resource appears in saved list | ✅ Pass | |
| TC-UI-05 | Navigate between all main pages | No 404 errors, all pages load | ✅ Pass | |

---

## 8.0 Conclusion and Discussion

### 8.1 Self Analysis of Project Viabilities

CareerSence successfully demonstrates the technical and commercial viability of an AI-powered career guidance platform. The following analysis evaluates the project across key dimensions:

**Technical Viability:**
The chosen technology stack (Next.js, PostgreSQL, Prisma, Groq API, React Flow) proved highly effective. Next.js App Router enabled a clean separation of server and client logic while keeping the codebase unified. Groq API delivered AI responses fast enough for real-time user interaction. React Flow handled complex career tree visualizations with smooth performance even for large node graphs.

**Functional Viability:**
All 8 core modules were successfully implemented and tested. The two-phase quiz, AI roadmap generation, and interactive career tree are the platform's strongest differentiators — features that no single existing platform offers in combination. The job hunting module with integrated tracking addresses a genuine pain point for job seekers.

**Economic Viability:**
The platform can be operated at near-zero cost during development and early production using free tiers of Groq, JSearch, Supabase, and Vercel. As the user base grows, costs scale predictably with usage. The instructor course platform provides a potential revenue stream through course pricing.

**User Experience Viability:**
The responsive design, dark mode support, and smooth animations (Framer Motion) create a premium user experience comparable to paid career platforms. The logo bounce loading animation provides clear visual feedback during AI generation, reducing perceived wait time.

**Scalability Viability:**
The stateless JWT session architecture, connection-pooled Prisma client, and Vercel's edge network ensure the platform can scale horizontally to handle thousands of concurrent users without architectural changes.

### 8.2 Problems Encountered and Possible Solutions

| # | Problem | Root Cause | Solution Applied |
|---|---|---|---|
| 1 | Groq API returning malformed JSON | LLM occasionally generates JSON with extra text or markdown code blocks | Added regex-based JSON extraction and try/catch with fallback error messages |
| 2 | `public.Course` table does not exist | New Prisma models added to schema but migration not run | Resolved by running `npx prisma migrate dev --name add_course_table` |
| 3 | React Flow nodes overlapping on large trees | Default node positions all set to {x:0, y:0} | Implemented dagre-based auto-layout algorithm for hierarchical positioning |
| 4 | JSearch API rate limit exceeded | Free tier limited to 500 requests/month | Added client-side caching of search results and debounced search input |
| 5 | NextAuth session not persisting after page refresh | `NEXTAUTH_URL` not set correctly in `.env` | Fixed by setting `NEXTAUTH_URL=http://localhost:3000` in development |
| 6 | Career quiz Phase 2 generation too slow | Large prompt sent to Groq with full Phase 1 context | Optimized prompt to include only answer values, not full question text |
| 7 | Dark mode flash on page load | CSS variables applied after hydration | Moved theme initialization to `<head>` script to prevent flash |
| 8 | Admin panel accessible to non-admin users | Only email check implemented, no DB role verification | Added double check: email domain AND database role must both be ADMIN |

### 8.3 Summary of Project Work

CareerSence was conceived, designed, and built as a full-stack Next.js 16 application over approximately 11 weeks. The project successfully delivered:

- **8 core feature modules**: Authentication, AI Roadmap, Career Tree, Career Quiz, Job Hunting, Learning Resources, Instructor Platform, Admin Dashboard.
- **AI integration**: Groq API with LLaMA 3 models for real-time roadmap generation, career tree creation, and two-phase adaptive quiz.
- **External API integration**: JSearch API for live job listings with advanced filtering.
- **Database**: PostgreSQL with Prisma ORM, 9 tables, full relational schema with foreign key constraints.
- **Security**: bcrypt password hashing, JWT sessions, role-based access control, parameterized queries.
- **UI/UX**: Responsive design, dark/light mode, Framer Motion animations, React Flow visualizations.
- **25+ test cases** covering all major modules with documented expected and actual outputs.

The platform is production-ready for small to medium scale deployment and provides a strong foundation for the future enhancements outlined in Chapter 9.

---

## 9.0 Limitations and Future Enhancements

### 9.1 Current Limitations

| # | Limitation | Impact |
|---|---|---|
| 1 | **AI Quality Dependency**: Roadmap and quiz quality depends entirely on Groq API model capabilities and prompt engineering. Poor prompts produce poor results. | Medium |
| 2 | **JSearch API Rate Limits**: Free tier allows only 500 requests/month, severely limiting job search in production. | High |
| 3 | **No Mobile App**: Web-only platform. Users on mobile get a responsive web experience but no native app features (push notifications, offline access). | Medium |
| 4 | **No Video Streaming**: Course lectures cannot include embedded video content in the current version. | Medium |
| 5 | **English Only**: All AI-generated content is in English. Non-English inputs produce inconsistent results. | Medium |
| 6 | **No Real-Time Features**: No live notifications, no real-time collaboration, no live chat. | Low |
| 7 | **No Resume Parsing**: Users must manually enter their skills and background. No automatic resume upload and parsing. | Medium |
| 8 | **No Salary Data**: Job listings show salary ranges from JSearch but no integrated salary benchmarking or negotiation tools. | Low |
| 9 | **Single Tenant**: Platform is designed for a single organization. No multi-tenancy support. | Low |
| 10 | **No Offline Mode**: All features require an active internet connection. | Low |

### 9.2 Future Enhancements

| Priority | Enhancement | Description |
|---|---|---|
| High | **Mobile App** | React Native application for iOS and Android with push notifications for job alerts and roadmap milestones. |
| High | **Resume Builder & Parser** | AI-powered resume generator that creates a tailored resume from the user's roadmap and profile. Also parse uploaded resumes to auto-fill profile data. |
| High | **JSearch API Upgrade** | Upgrade to a paid JSearch plan or integrate multiple job APIs (LinkedIn, Indeed, Glassdoor) to remove rate limit constraints. |
| Medium | **Mentorship Matching** | Connect users with industry mentors based on career goals, skills, and location. Include a booking and messaging system. |
| Medium | **Real-Time Notifications** | Job alerts when new listings match saved search criteria. Roadmap milestone reminders. Application follow-up nudges. |
| Medium | **Video Course Player** | Built-in video player for course lectures with progress tracking, bookmarks, and playback speed control. |
| Medium | **Multi-language Support** | Internationalization (i18n) for Hindi, Spanish, French, and other major languages. AI prompts adapted for non-English outputs. |
| Medium | **LinkedIn Integration** | OAuth login with LinkedIn. Import profile data (skills, experience, education) to auto-fill career quiz and roadmap inputs. |
| Low | **Advanced Admin Analytics** | Cohort analysis, user retention charts, feature usage heatmaps, and A/B testing dashboard for the admin panel. |
| Low | **AI Interview Prep** | Mock interview simulator using AI to generate role-specific interview questions and evaluate user responses. |
| Low | **Salary Benchmarking** | Real-time salary data by role, location, and experience level integrated into the job search and roadmap features. |
| Low | **Community Forum** | Peer-to-peer discussion forum where users can share career experiences, ask questions, and support each other. |
