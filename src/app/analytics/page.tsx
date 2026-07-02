"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface Task {
  id: string;
  status: string;
  importance: string;
  completedAt: string | null;
  createdAt: string;
}

interface Habit {
  id: string;
  name: string;
  color: string;
  logs: { date: string }[];
}

interface Standup {
  date: string;
  mood: number;
}

const PIE_COLORS = ["#22c55e", "#6366f1", "#64748b"];

export default function AnalyticsPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [standups, setStandups] = useState<Standup[]>([]);

  const fetchData = useCallback(async () => {
    const [tasksRes, habitsRes, standupsRes] = await Promise.all([
      fetch("/api/tasks"),
      fetch("/api/habits"),
      fetch("/api/standups"),
    ]);
    setTasks(await tasksRes.json());
    setHabits(await habitsRes.json());
    setStandups(await standupsRes.json());
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const tasksByStatus = [
    { name: "Done", value: tasks.filter((t) => t.status === "done").length },
    { name: "In Progress", value: tasks.filter((t) => t.status === "in_progress").length },
    { name: "To Do", value: tasks.filter((t) => t.status === "todo").length },
  ];

  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(Date.now() - (13 - i) * 86400000);
    return d.toISOString().split("T")[0];
  });

  const completionData = last14Days.map((day) => ({
    date: new Date(day).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    completed: tasks.filter(
      (t) =>
        t.completedAt &&
        new Date(t.completedAt).toISOString().split("T")[0] === day
    ).length,
  }));

  const habitCompletionData = last14Days.map((day) => {
    const dayData: Record<string, string | number> = {
      date: new Date(day).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    };
    habits.forEach((h) => {
      dayData[h.name] = h.logs.some(
        (l) => new Date(l.date).toISOString().split("T")[0] === day
      )
        ? 1
        : 0;
    });
    return dayData;
  });

  const moodData = standups
    .slice(0, 14)
    .reverse()
    .map((s) => ({
      date: new Date(s.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      mood: s.mood,
    }));

  const habitColors = habits.map((h) => h.color);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="mt-1 text-muted-foreground">Track your progress over time</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card>
          <p className="text-sm text-muted-foreground">Total Tasks</p>
          <p className="mt-1 text-3xl font-bold text-foreground">{tasks.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted-foreground">Completion Rate</p>
          <p className="mt-1 text-3xl font-bold text-success">
            {tasks.length > 0
              ? Math.round(
                  (tasks.filter((t) => t.status === "done").length / tasks.length) * 100
                )
              : 0}
            %
          </p>
        </Card>
        <Card>
          <p className="text-sm text-muted-foreground">Active Habits</p>
          <p className="mt-1 text-3xl font-bold text-primary">{habits.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted-foreground">Avg Mood</p>
          <p className="mt-1 text-3xl font-bold text-warning">
            {standups.length > 0
              ? (standups.reduce((a, s) => a + s.mood, 0) / standups.length).toFixed(1)
              : "—"}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tasks by Status</CardTitle>
          </CardHeader>
          {tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tasks yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={tasksByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {tasksByStatus.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tasks Completed (14 days)</CardTitle>
          </CardHeader>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={completionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <YAxis allowDecimals={false} stroke="var(--muted-foreground)" />
              <Tooltip />
              <Bar dataKey="completed" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Habit Streaks (14 days)</CardTitle>
          </CardHeader>
          {habits.length === 0 ? (
            <p className="text-sm text-muted-foreground">No habits yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={habitCompletionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <YAxis allowDecimals={false} stroke="var(--muted-foreground)" />
                <Tooltip />
                {habits.map((h, i) => (
                  <Bar
                    key={h.id}
                    dataKey={h.name}
                    stackId="habits"
                    fill={habitColors[i]}
                    radius={i === habits.length - 1 ? [4, 4, 0, 0] : undefined}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mood Tracker</CardTitle>
          </CardHeader>
          {moodData.length === 0 ? (
            <p className="text-sm text-muted-foreground">Log standups to see mood trends.</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={moodData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} stroke="var(--muted-foreground)" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="mood"
                  stroke="var(--warning)"
                  strokeWidth={2}
                  dot={{ fill: "var(--warning)", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </div>
  );
}
