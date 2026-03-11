# CareerSence 🚀

**AI-Powered Career Planning & Job Hunting Platform**

CareerSence is a modern web application designed to help individuals navigate their professional journey using artificial intelligence. Whether you are a student, a recent graduate, or a career switcher, CareerSence provides personalized roadmaps, visual career paths, and job tracking tools to help you succeed.

---

## ✨ Key Features

- **🌳 AI Career Tree**: Generate a visual, interactive representation of potential career paths based on your skills, passions, and goals. Powered by `@xyflow/react` and Framer Motion.
- **🗺️ Dynamic Roadmaps**: personalized, step-by-step guides to help you reach your career objectives, generated through AI analysis.
- **💼 Job Hunting & Tracking**: Search for live job listings and track your application status (Saved, Applied, Interviewing, etc.) using integrated job board data.
- **📝 AI Career Quiz**: A two-phase interactive assessment that analyzes your profile to provide tailored career recommendations.
- **🌓 Dark Mode Support**: A premium, responsive interface with seamless dark/light mode transitions.
- **👨‍💼 Admin Panel**: Comprehensive dashboard for administrators to monitor platform activity, user statistics, and system health (restricted to `.admin.com` emails).

---

## 🛠️ Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/) (App Router), [React](https://reactjs.org/), [Tailwind CSS](https://tailwindcss.com/)
- **State & Flow**: [Framer Motion](https://www.framer.com/motion/), [@xyflow/react](https://reactflow.dev/) (React Flow)
- **Backend & Database**: [Prisma ORM](https://www.prisma.io/), [PostgreSQL](https://www.postgresql.org/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **AI Integration**: [Groq API](https://groq.com/) (for roadmap and tree generation)
- **External APIs**: JSearch Integration for job listings

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or later)
- PostgreSQL database
- A Groq API key

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/jaysadhu18/careersence.git
   cd careersence
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Environment Variables**:
   Create a `.env` file in the root directory and add the following:
   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/careersence?schema=public"
   NEXTAUTH_SECRET=your_nextauth_secret_here
   NEXTAUTH_URL=http://localhost:3000
   GROQ_API_KEY=your_groq_api_key_here
   ```

4. **Run Database Migrations**:
   ```bash
   npx prisma migrate dev
   ```

5. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

6. **Create Admin User** (Optional):
   ```bash
   node scripts/make-admin.js admin@example.admin.com
   ```
   See [ADMIN_SETUP.md](ADMIN_SETUP.md) for more details on admin access.

---

## 📂 Project Structure

- `app/`: Next.js App Router pages and API routes.
- `components/`: Reusable UI components and layout sections.
  - `domain/`: Business-logic specific components (Tree, Roadmap, etc.).
  - `ui/`: Base UI elements (Button, Card, Modal, etc.).
  - `layout/`: Global layout components (Header, Footer, PageShell).
- `prisma/`: Database schema and migrations.
- `public/`: Static assets.

---

## 📝 License

This project is licensed under the [MIT License](LICENSE).
