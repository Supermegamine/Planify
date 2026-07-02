# Planify — Smart Planner & Habit Tracker

A full-stack productivity app that combines intelligent task management, daily habit tracking, and calendar scheduling into one dashboard.

## Features

- **Smart To-Do with Priority Scoring** — Tasks auto-rank using the Eisenhower matrix (Urgent/Important). Overdue items are flagged, and tasks flow through To Do → In Progress → Done columns.

- **Habit Tracker with Streaks** — Track daily habits with a 7-day heatmap, streak counting, and one-click completion toggles.

- **Daily Standups** — Log what you did, what's next, and any blockers. Includes a mood tracker (1-5 stars) to monitor energy over time.

- **Weekly Calendar** — Schedule events with a visual weekly grid, color coding, and conflict detection for overlapping time slots.

- **Analytics Dashboard** — Charts for task completion trends, habit consistency, mood tracking, and overall productivity stats.

## Tech Stack

- **Framework:** Next.js 16 (App Router, TypeScript)
- **Database:** SQLite via Prisma ORM
- **Styling:** Tailwind CSS v4
- **Charts:** Recharts
- **Fonts:** Geist Sans & Geist Mono

## Getting Started

```bash
# Install dependencies
npm install

# Set up the database
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Dashboard (server component)
│   ├── tasks/page.tsx        # Kanban task board
│   ├── habits/page.tsx       # Habit tracker & standups
│   ├── schedule/page.tsx     # Weekly calendar
│   ├── analytics/page.tsx    # Charts & stats
│   └── api/                  # REST API routes
│       ├── tasks/route.ts
│       ├── habits/route.ts
│       ├── events/route.ts
│       └── standups/route.ts
├── components/
│   ├── ui/                   # Reusable UI components
│   └── layout/               # Sidebar navigation
├── lib/
│   ├── db.ts                 # Prisma client singleton
│   └── utils.ts              # Eisenhower matrix, streaks, helpers
└── generated/prisma/         # Generated Prisma client
```
# Planify — Smart Planner & Habit Tracker

A full-stack productivity app that combines intelligent task management, daily habit tracking, and calendar scheduling into one dashboard.

This Project was created with the help of Claude Code.

## Features

- **Smart To-Do with Priority Scoring** — Tasks auto-rank using the Eisenhower matrix (Urgent/Important). Overdue items are flagged, and tasks flow through To Do → In Progress → Done columns.

- **Habit Tracker with Streaks** — Track daily habits with a 7-day heatmap, streak counting, and one-click completion toggles.

- **Daily Standups** — Log what you did, what's next, and any blockers. Includes a mood tracker (1-5 stars) to monitor energy over time.

- **Weekly Calendar** — Schedule events with a visual weekly grid, color coding, and conflict detection for overlapping time slots.

- **Analytics Dashboard** — Charts for task completion trends, habit consistency, mood tracking, and overall productivity stats.

## Tech Stack

- **Framework:** Next.js 16 (App Router, TypeScript)
- **Database:** SQLite via Prisma ORM
- **Styling:** Tailwind CSS v4
- **Charts:** Recharts
- **Fonts:** Geist Sans & Geist Mono

## Getting Started

```bash
# Install dependencies
npm install

# Set up the database
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Dashboard (server component)
│   ├── tasks/page.tsx        # Kanban task board
│   ├── habits/page.tsx       # Habit tracker & standups
│   ├── schedule/page.tsx     # Weekly calendar
│   ├── analytics/page.tsx    # Charts & stats
│   └── api/                  # REST API routes
│       ├── tasks/route.ts
│       ├── habits/route.ts
│       ├── events/route.ts
│       └── standups/route.ts
├── components/
│   ├── ui/                   # Reusable UI components
│   └── layout/               # Sidebar navigation
├── lib/
│   ├── db.ts                 # Prisma client singleton
│   └── utils.ts              # Eisenhower matrix, streaks, helpers
└── generated/prisma/         # Generated Prisma client
```
