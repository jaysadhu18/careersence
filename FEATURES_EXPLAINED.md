# CareerSence: A Complete Guide to Features

Welcome to **CareerSence**! This guide breaks down every single feature of our application using simple, easy-to-understand language. Whether you're a student figuring out what to study, a recent graduate looking for a job, or someone looking to switch fields, this guide will explain exactly what CareerSence does, why it’s useful, how you use it, and the technology working behind the scenes.

---

## 🌳 1. Interactive Career Tree

**What it is:**  
Imagine a family tree, but for your career. The Career Tree is a massive, visually stunning map that shows you different paths you can take based on what you are good at and what you love doing.

**The Use Case:**  
You know your skills (e.g., you are good at math and like talking to people), but you don't know what jobs fit those skills. The Career Tree gives you 3 distinct, customized career paths to explore, complete with chronological milestones (steps) for each path.

**How it works (for the user):**  
You fill out a simple form explaining your skills, passions, and long-term goals. We instantly draw a highly interactive, colorful "tree" on your screen. You can zoom in, drag it around, and click on individual branches to see a detailed popup containing the exact skills to acquire and execution strategies for that timeframe.

**How we made it (Technical):**  
Behind the scenes, we send your input to an AI model (Groq/Llama-3). We specifically instruct the AI to act like an expert career counselor. It replies with structured timeline data. We then feed that data into a powerful diagramming tool called `@xyflow/react` (React Flow), which automatically connects nodes with animated arrows and renders the tree on your screen.

---

## 🗺️ 2. Dynamic Career Roadmaps

**What it is:**  
A step-by-step checklist or "GPS route" telling you exactly what you need to do to reach a specific career goal.

**The Use Case:**  
You know exactly what you want to be (for example, a "Senior Data Analyst"), but you have no idea how to get there from where you are right now.

**How it works (for the user):**  
You tell us your ultimate career goal, your current experience, and the timeline you desire. We generate a step-by-step roadmap broken down by time (e.g., "Months 1-3", "Months 4-6"). Each step is explicitly spelled out with concrete actions to take and specific resources you should use. 

**How we made it (Technical):**  
We send your specific goal, current stage, and timeline to the Groq AI API. The AI breaks down the massive goal into small, manageable stages. We then display these stages using beautifully animated cards built with a library called `Framer Motion`. This creates a satisfying, smooth reading experience as you scroll through your plan.

---

## 🎓 3. Smart College Search

**What it is:**  
A highly intelligent search engine specifically designed for finding the best colleges and universities in India for your desired degree.

**The Use Case:**  
You know what state you want to live in and what degree you want (e.g., B.Tech in Computer Science), but you are overwhelmed by thousands of college options and don't know which ones have the best reputation, acceptance rates, or costs.

**How it works (for the user):**  
You select a state in India, a field of study, and a degree type. The system generates a curated list of top colleges that actually exist, providing you with their approximate fee range, admission rates, key strengths (like their campus placement rank), and their state/national rankings. 

**How we made it (Technical):**  
Instead of relying on a clunky, static database that gets outdated, we built a specialized AI prompt. We instruct the Groq AI to act as an expert Indian Education Counselor and pull real-world college data. We then format that AI-generated data into a clean, clickable list on the frontend.

---

## 📄 4. AI Resume Parsing

**What it is:**  
A tool that allows you to upload your physical resume document so the system can automatically read and understand your background.

**The Use Case:**  
You are tired of typing out your skills, experience, and history manually into career quizzes and forms. You just want the system to scan the resume you already made.

**How it works (for the user):**  
You simply upload your resume (in PDF, DOCX, or TXT format). The system reads the document and instantly extracts the text, which can then be used to power other features in the app (like automatically filling out your skills for the Career Tree or Roadmap).

**How we made it (Technical):**  
We built a secure file upload endpoint in our Next.js backend. Depending on what file you upload, we route it to specialized text-extraction tools: `pdf-parse` (for parsing the complex visual structure of PDFs) or `mammoth` (for extracting raw text from Microsoft Word `.docx` files). 

---

## 💼 5. Job Hunting & Tracking Board

**What it is:**  
A personal dashboard to search for real jobs and manually keep track of your applications.

**The Use Case:**  
You are applying to dozens of jobs across the internet and losing track of them. You forget which ones you applied to, which ones you are interviewing for, and which ones rejected you. 

**How it works (for the user):**  
You can search for live, actual job postings right inside CareerSence. When you find one you like, you can click "Save". On your private dashboard, you can move these jobs into different columns: "Saved", "Applied", "Interviewing", "Offer", or "Rejected." It functions exactly like a digital sticky-note board (Kanban board) for your job hunt.

**How we made it (Technical):**  
To get the live jobs, we connect our backend to the `JSearch API`, which aggregates real job listings from across the web. To save your jobs, we use a custom database (PostgreSQL managed by Prisma ORM) that securely remembers the status of every single job you interact with, so your dashboard is perfectly synced across all your devices.

---

## 📝 6. Two-Phase AI Career Quiz

**What it is:**  
A smart, adaptive quiz that acts like a conversation with a human career advisor to figure out what you are destined to do.

**The Use Case:**  
You are completely lost. You don't know your skills, you don't have a specific goal, and you just need someone to help point you in the right direction.

**How it works (for the user):**  
- **Phase 1:** You answer 5 basic questions about what you enjoy doing, what you hate doing, and how you prefer to work (e.g., alone vs. in a team).
- **Phase 2:** The app reads your initial answers, "thinks" about them, and then asks you *different, highly specific follow-up questions* based entirely on what you just said. 
Finally, it gives you a deeply detailed report showing exactly what careers fit your personality and why.

**How we made it (Technical):**  
This is a complex, multi-step AI process. We send your first 5 answers to the AI, instructing it to act like a behavioral interviewer and dynamically generate custom follow-up questions. We display those new questions to you. Once you answer them, we send everything *back* to the AI one final time to generate your ultimate career recommendations. All your quiz history is saved safely in the database.

---

## 🔐 7. Secure Accounts & History Tracking (Overview)

**What it is:**  
Your centralized home page where all your generated trees, quizzes, roadmaps, and saved jobs live securely forever.

**The Use Case:**  
You want to log in from your laptop today and your phone tomorrow, and see all your career plans without losing any progress or having someone else steal your personal data.

**How it works (for the user):**  
You securely create an account using your email and password. When you log in, you are taken to your personalized "Overview" dashboard. Here, you can see a history of every AI Tree you ever generated, every Roadmap you built, every Quiz you took, and a quick summary of how your job hunt is progressing.

**How we made it (Technical):**  
We implemented an enterprise-grade authentication system called `NextAuth.js`. It safely encrypts (hashes) your password using `bcryptjs` and securely manages your "session" using JSON Web Tokens (JWTs). Every time you generate a new Roadmap or Tree, we securely save a permanent record of it to our PostgreSQL database, attached exclusively to your private User ID.
