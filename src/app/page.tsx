import { prisma } from "@/lib/db";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { isOverdue, getEisenhowerScore, formatDate } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const [tasks, habits, events, standups] = await Promise.all([
    prisma.task.findMany({ where: { status: { not: "done" } } }),
    prisma.habit.findMany({ include: { logs: true } }),
    prisma.event.findMany({
      where: {
        date: {
          gte: new Date(new Date().toISOString().split("T")[0]),
          lt: new Date(
            new Date(Date.now() + 86400000).toISOString().split("T")[0]
          ),
        },
      },
      orderBy: { startTime: "asc" },
    }),
    prisma.standup.findMany({ orderBy: { date: "desc" }, take: 1 }),
  ]);

  const topTasks = tasks
    .sort(
      (a, b) =>
        getEisenhowerScore(b.importance, b.urgency) -
        getEisenhowerScore(a.importance, a.urgency)
    )
    .slice(0, 5);

  const todayStr = new Date().toISOString().split("T")[0];
  const habitsToday = habits.map((h) => ({
    ...h,
    completedToday: h.logs.some(
      (l) => new Date(l.date).toISOString().split("T")[0] === todayStr
    ),
  }));

  const completedTasks = await prisma.task.count({ where: { status: "done" } });
  const totalTasks = await prisma.task.count();
  const habitsDoneToday = habitsToday.filter((h) => h.completedToday).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-sm text-muted-foreground">Active Tasks</p>
          <p className="mt-1 text-3xl font-bold text-foreground">{tasks.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {completedTasks} of {totalTasks} completed
          </p>
        </Card>
        <Card>
          <p className="text-sm text-muted-foreground">Habits Today</p>
          <p className="mt-1 text-3xl font-bold text-foreground">
            {habitsDoneToday}/{habits.length}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">completed today</p>
        </Card>
        <Card>
          <p className="text-sm text-muted-foreground">Events Today</p>
          <p className="mt-1 text-3xl font-bold text-foreground">{events.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">scheduled</p>
        </Card>
        <Card>
          <p className="text-sm text-muted-foreground">Overdue</p>
          <p className="mt-1 text-3xl font-bold text-danger">
            {tasks.filter((t) => isOverdue(t.deadline)).length}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">tasks past deadline</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Priority Tasks</CardTitle>
              <Link href="/tasks" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
          </CardHeader>
          {topTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active tasks. Add one!</p>
          ) : (
            <div className="space-y-3">
              {topTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="flex-1">
                    <p className="font-medium text-card-foreground">{task.title}</p>
                    {task.deadline && (
                      <p
                        className={`text-xs ${
                          isOverdue(task.deadline)
                            ? "text-danger"
                            : "text-muted-foreground"
                        }`}
                      >
                        {isOverdue(task.deadline) ? "Overdue: " : "Due: "}
                        {formatDate(task.deadline)}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant={
                      task.importance === "critical" || task.importance === "high"
                        ? "danger"
                        : task.importance === "medium"
                        ? "warning"
                        : "outline"
                    }
                  >
                    {task.importance}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Today&apos;s Habits</CardTitle>
              <Link href="/habits" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
          </CardHeader>
          {habitsToday.length === 0 ? (
            <p className="text-sm text-muted-foreground">No habits yet. Start tracking!</p>
          ) : (
            <div className="space-y-3">
              {habitsToday.map((habit) => (
                <div
                  key={habit.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full text-sm"
                      style={{ backgroundColor: habit.color + "20", color: habit.color }}
                    >
                      {habit.completedToday ? "✓" : "○"}
                    </div>
                    <span className="font-medium text-card-foreground">{habit.name}</span>
                  </div>
                  <Badge variant={habit.completedToday ? "success" : "outline"}>
                    {habit.completedToday ? "Done" : "Pending"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Today&apos;s Schedule</CardTitle>
              <Link href="/schedule" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
          </CardHeader>
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">No events today.</p>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 rounded-lg border border-border p-3"
                >
                  <div
                    className="h-10 w-1 rounded-full"
                    style={{ backgroundColor: event.color }}
                  />
                  <div>
                    <p className="font-medium text-card-foreground">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {event.startTime} — {event.endTime}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Latest Standup</CardTitle>
          </CardHeader>
          {standups.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No standups yet.{" "}
              <Link href="/habits" className="text-primary hover:underline">
                Log your first one
              </Link>
            </p>
          ) : (
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium text-success">Done</p>
                <p className="text-card-foreground">{standups[0].done}</p>
              </div>
              <div>
                <p className="font-medium text-primary">Planned</p>
                <p className="text-card-foreground">{standups[0].planned}</p>
              </div>
              {standups[0].blockers && (
                <div>
                  <p className="font-medium text-danger">Blockers</p>
                  <p className="text-card-foreground">{standups[0].blockers}</p>
                </div>
              )}
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <span
                    key={n}
                    className={
                      n <= standups[0].mood ? "text-warning" : "text-muted-foreground/30"
                    }
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
