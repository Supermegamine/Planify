export type DemoTask = {
  id: string;
  title: string;
  description: string | null;
  deadline: string | null;
  importance: string;
  urgency: string;
  status: string;
  order: number;
  completedAt: string | null;
  createdAt: string;
};

export type DemoHabitLog = {
  id: string;
  date: string;
  completed: boolean;
};

export type DemoHabit = {
  id: string;
  name: string;
  icon: string;
  color: string;
  frequency: string;
  logs: DemoHabitLog[];
};

export type DemoStandup = {
  id: string;
  date: string;
  done: string;
  planned: string;
  blockers: string | null;
  mood: number;
};

export type DemoEvent = {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  color: string;
};

export type DemoData = {
  tasks: DemoTask[];
  habits: DemoHabit[];
  standups: DemoStandup[];
  events: DemoEvent[];
  /** Local date when this browser's demo data was last opened. */
  lastOpenedOn?: string;
};

const STORAGE_KEY = "planify-demo-data-v1";

export function createDemoId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function localDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dateOffset(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return localDateString(date);
}

function dateAt(days: number, time = "12:00"): string {
  return `${dateOffset(days)}T${time}:00.000Z`;
}

function startOfWeek(): Date {
  const date = new Date();
  const day = date.getDay();
  date.setDate(date.getDate() - (day === 0 ? 6 : day - 1));
  date.setHours(12, 0, 0, 0);
  return date;
}

function dayOfWeekOffset(offset: number): string {
  const date = startOfWeek();
  date.setDate(date.getDate() + offset);
  return localDateString(date);
}

export function createDemoData(): DemoData {
  const habits: DemoHabit[] = [
    {
      id: "habit-planning",
      name: "Morning planning",
      icon: "sunrise",
      color: "#6366f1",
      frequency: "daily",
      logs: [0, 1, 2, 3, 5, 6].map((day) => ({
        id: `log-planning-${day}`,
        date: dateOffset(-day),
        completed: true,
      })),
    },
    {
      id: "habit-reading",
      name: "Read for 20 minutes",
      icon: "book-open",
      color: "#ec4899",
      frequency: "daily",
      logs: [0, 1, 2, 4, 5].map((day) => ({
        id: `log-reading-${day}`,
        date: dateOffset(-day),
        completed: true,
      })),
    },
    {
      id: "habit-movement",
      name: "Move for 30 minutes",
      icon: "activity",
      color: "#22c55e",
      frequency: "daily",
      logs: [0, 2, 3, 4, 6].map((day) => ({
        id: `log-movement-${day}`,
        date: dateOffset(-day),
        completed: true,
      })),
    },
    {
      id: "habit-focus",
      name: "Deep work session",
      icon: "target",
      color: "#f59e0b",
      frequency: "weekdays",
      logs: [1, 2, 3, 5].map((day) => ({
        id: `log-focus-${day}`,
        date: dateOffset(-day),
        completed: true,
      })),
    },
  ];

  const tasks: DemoTask[] = [
    {
      id: "task-brief",
      title: "Finalize product brief",
      description: "Align the scope, success metrics, and launch milestones.",
      deadline: dateAt(-1),
      importance: "high",
      urgency: "high",
      status: "done",
      order: 0,
      completedAt: dateAt(-1, "15:30"),
      createdAt: dateAt(-8),
    },
    {
      id: "task-onboarding",
      title: "Review onboarding flow",
      description: "Check the first-run experience and identify friction points.",
      deadline: dateAt(1),
      importance: "high",
      urgency: "medium",
      status: "in_progress",
      order: 1,
      completedAt: null,
      createdAt: dateAt(-5),
    },
    {
      id: "task-roadmap",
      title: "Prepare Q4 roadmap",
      description: "Prioritize the next batch of improvements with the team.",
      deadline: dateAt(0),
      importance: "critical",
      urgency: "high",
      status: "todo",
      order: 2,
      completedAt: null,
      createdAt: dateAt(-4),
    },
    {
      id: "task-launch",
      title: "Draft launch announcement",
      description: "Write a short update for customers and internal stakeholders.",
      deadline: dateAt(2),
      importance: "medium",
      urgency: "high",
      status: "in_progress",
      order: 3,
      completedAt: null,
      createdAt: dateAt(-3),
    },
    {
      id: "task-backlog",
      title: "Clean up the backlog",
      description: "Archive stale tickets and clarify the remaining priorities.",
      deadline: dateAt(5),
      importance: "medium",
      urgency: "low",
      status: "todo",
      order: 4,
      completedAt: null,
      createdAt: dateAt(-2),
    },
    {
      id: "task-metrics",
      title: "Share weekly metrics",
      description: "Summarize completion rate, active habits, and blockers.",
      deadline: dateAt(-2),
      importance: "high",
      urgency: "high",
      status: "todo",
      order: 5,
      completedAt: null,
      createdAt: dateAt(-6),
    },
    {
      id: "task-interviews",
      title: "Plan customer interviews",
      description: "Prepare questions and shortlist five participants.",
      deadline: dateAt(-2),
      importance: "medium",
      urgency: "medium",
      status: "done",
      order: 6,
      completedAt: dateAt(-2, "16:00"),
      createdAt: dateAt(-9),
    },
    {
      id: "task-release",
      title: "Publish release notes",
      description: "Collect the shipped improvements into a concise changelog.",
      deadline: dateAt(7),
      importance: "low",
      urgency: "medium",
      status: "todo",
      order: 7,
      completedAt: null,
      createdAt: dateAt(-1),
    },
  ];

  const standupNotes = [
    ["Closed the product brief and aligned the launch scope.", "Review onboarding feedback and update the roadmap.", "Waiting on two customer interview confirmations.", 4],
    ["Reviewed the latest support themes and grouped recurring issues.", "Turn the themes into three concrete backlog items.", null, 5],
    ["Finished the first onboarding prototype review.", "Share the changes with design and engineering.", null, 4],
    ["Cleared priority bugs and documented edge cases.", "Prepare the roadmap discussion for the team.", "One API dependency still needs an owner.", 3],
    ["Completed the customer interview plan.", "Draft the launch announcement and gather feedback.", null, 5],
    ["Updated the weekly metrics and project status.", "Protect time for focused roadmap work.", null, 4],
  ] as const;

  const standups: DemoStandup[] = standupNotes.map((note, index) => ({
    id: `standup-${index}`,
    date: dateOffset(-index),
    done: note[0],
    planned: note[1],
    blockers: note[2],
    mood: note[3],
  }));

  const events: DemoEvent[] = [
    { id: "event-planning", title: "Weekly planning", date: dayOfWeekOffset(0), startTime: "09:00", endTime: "10:00", color: "#6366f1" },
    { id: "event-standup", title: "Team standup", date: dayOfWeekOffset(2), startTime: "09:30", endTime: "10:00", color: "#22c55e" },
    { id: "event-focus", title: "Deep work · Roadmap", date: dayOfWeekOffset(2), startTime: "10:30", endTime: "12:00", color: "#f59e0b" },
    { id: "event-review", title: "Product review", date: dayOfWeekOffset(2), startTime: "14:00", endTime: "15:00", color: "#ec4899" },
    { id: "event-design", title: "UX review", date: dayOfWeekOffset(3), startTime: "11:00", endTime: "12:00", color: "#06b6d4" },
    { id: "event-one-one", title: "1:1 · Project check-in", date: dayOfWeekOffset(4), startTime: "13:30", endTime: "14:00", color: "#8b5cf6" },
    { id: "event-wrap", title: "Weekly wrap-up", date: dayOfWeekOffset(4), startTime: "16:00", endTime: "16:45", color: "#64748b" },
  ];

  return { tasks, habits, standups, events, lastOpenedOn: localDateString() };
}

function addDays(dateString: string, days: number): string {
  const [year, month, day] = dateString.slice(0, 10).split("-").map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day + days));
  return shifted.toISOString().slice(0, 10);
}

function shiftTimestamp(value: string | null, days: number): string | null {
  if (!value || days === 0) return value;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Date(parsed.getTime() + days * 86400000).toISOString();
}

function mondayOf(dateString: string): string {
  const [year, month, day] = dateString.slice(0, 10).split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const weekday = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() - weekday + 1);
  return date.toISOString().slice(0, 10);
}

function daysBetween(from: string, to: string): number {
  const [fy, fm, fd] = from.split("-").map(Number);
  const [ty, tm, td] = to.split("-").map(Number);
  return Math.round(
    (Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86400000
  );
}

/**
 * Keep the sample workspace feeling current without discarding a visitor's edits.
 * Relative daily data moves by elapsed days; calendar events move by whole weeks
 * so their weekday/time layout remains stable in the current week.
 */
function rebaseDemoData(data: DemoData, today: string): DemoData {
  const lastOpenedOn =
    data.lastOpenedOn ??
    data.standups[0]?.date.slice(0, 10) ??
    today;

  const elapsedDays = daysBetween(lastOpenedOn, today);
  const elapsedWeeks = daysBetween(mondayOf(lastOpenedOn), mondayOf(today));

  if (elapsedDays === 0 && data.lastOpenedOn === today) return data;

  return {
    ...data,
    lastOpenedOn: today,
    tasks: data.tasks.map((task) => ({
      ...task,
      deadline: shiftTimestamp(task.deadline, elapsedDays),
      completedAt: shiftTimestamp(task.completedAt, elapsedDays),
      createdAt: shiftTimestamp(task.createdAt, elapsedDays) ?? task.createdAt,
    })),
    habits: data.habits.map((habit) => ({
      ...habit,
      logs: habit.logs.map((log) => ({
        ...log,
        date: addDays(log.date, elapsedDays),
      })),
    })),
    standups: data.standups.map((standup) => ({
      ...standup,
      date: addDays(standup.date, elapsedDays),
    })),
    events: data.events.map((event) => ({
      ...event,
      date: addDays(event.date, elapsedWeeks),
    })),
  };
}

function notifyUpdate(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("planify-demo-updated"));
  }
}

export function readDemoData(): DemoData {
  if (typeof window === "undefined") return createDemoData();

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as DemoData;
      const rebased = rebaseDemoData(parsed, localDateString());
      if (rebased !== parsed) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rebased));
      }
      return rebased;
    }
  } catch {
    // A malformed or unavailable localStorage entry is replaced with fresh demo data.
  }

  const initial = createDemoData();
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  } catch {
    // The app remains usable for this session when browser storage is unavailable.
  }
  return initial;
}

export function updateDemoData(updater: (data: DemoData) => DemoData): DemoData {
  const next = updater(readDemoData());
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Keep the in-memory UI responsive even when storage is blocked.
    }
    notifyUpdate();
  }
  return next;
}

export function resetDemoData(): void {
  const fresh = createDemoData();
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    } catch {
      // Reloading still restores the built-in seed data.
    }
    notifyUpdate();
  }
}
