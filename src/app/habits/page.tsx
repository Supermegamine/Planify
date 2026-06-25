"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { getStreakCount } from "@/lib/utils";

interface HabitLog {
  id: string;
  date: string;
  completed: boolean;
}

interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  frequency: string;
  logs: HabitLog[];
}

interface Standup {
  id: string;
  date: string;
  done: string;
  planned: string;
  blockers: string | null;
  mood: number;
}

const COLORS = ["#6366f1", "#ec4899", "#f59e0b", "#22c55e", "#06b6d4", "#8b5cf6"];

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [standups, setStandups] = useState<Standup[]>([]);
  const [showHabitModal, setShowHabitModal] = useState(false);
  const [showStandupModal, setShowStandupModal] = useState(false);
  const [habitForm, setHabitForm] = useState({ name: "", color: "#6366f1", frequency: "daily" });
  const [standupForm, setStandupForm] = useState({ done: "", planned: "", blockers: "", mood: 3 });

  const fetchData = useCallback(async () => {
    const [habitsRes, standupsRes] = await Promise.all([
      fetch("/api/habits"),
      fetch("/api/standups"),
    ]);
    setHabits(await habitsRes.json());
    setStandups(await standupsRes.json());
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleHabit = async (habitId: string) => {
    await fetch("/api/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle", habitId }),
    });
    fetchData();
  };

  const createHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitForm.name.trim()) return;
    await fetch("/api/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(habitForm),
    });
    setShowHabitModal(false);
    setHabitForm({ name: "", color: "#6366f1", frequency: "daily" });
    fetchData();
  };

  const deleteHabit = async (id: string) => {
    await fetch(`/api/habits?id=${id}`, { method: "DELETE" });
    fetchData();
  };

  const submitStandup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!standupForm.done.trim() || !standupForm.planned.trim()) return;
    await fetch("/api/standups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(standupForm),
    });
    setShowStandupModal(false);
    setStandupForm({ done: "", planned: "", blockers: "", mood: 3 });
    fetchData();
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - i * 86400000);
    return d.toISOString().split("T")[0];
  }).reverse();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Habits & Standups</h1>
          <p className="mt-1 text-muted-foreground">Track daily habits and log standups</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowStandupModal(true)}>
            + Standup
          </Button>
          <Button onClick={() => setShowHabitModal(true)}>+ New Habit</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Habits</CardTitle>
        </CardHeader>
        {habits.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No habits yet. Create your first habit to start tracking!
          </p>
        ) : (
          <div className="space-y-4">
            {habits.map((habit) => {
              const streak = getStreakCount(habit.logs.map((l) => new Date(l.date)));
              const completedToday = habit.logs.some(
                (l) => new Date(l.date).toISOString().split("T")[0] === todayStr
              );
              return (
                <div
                  key={habit.id}
                  className="flex items-center gap-4 rounded-lg border border-border p-4"
                >
                  <button
                    onClick={() => toggleHabit(habit.id)}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-lg transition-transform hover:scale-110"
                    style={{
                      backgroundColor: completedToday ? habit.color : habit.color + "20",
                      color: completedToday ? "#fff" : habit.color,
                    }}
                  >
                    {completedToday ? "✓" : "○"}
                  </button>
                  <div className="flex-1">
                    <p className="font-medium text-card-foreground">{habit.name}</p>
                    <div className="mt-1 flex items-center gap-2">
                      {streak > 0 && (
                        <Badge variant="success">{streak} day streak 🔥</Badge>
                      )}
                      <span className="text-xs text-muted-foreground">{habit.frequency}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {last7Days.map((day) => {
                      const done = habit.logs.some(
                        (l) => new Date(l.date).toISOString().split("T")[0] === day
                      );
                      return (
                        <div
                          key={day}
                          className="h-6 w-6 rounded"
                          style={{
                            backgroundColor: done ? habit.color : "var(--muted)",
                          }}
                          title={day}
                        />
                      );
                    })}
                  </div>
                  <button
                    onClick={() => deleteHabit(habit.id)}
                    className="text-sm text-muted-foreground hover:text-danger"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Standups</CardTitle>
          </div>
        </CardHeader>
        {standups.length === 0 ? (
          <p className="text-sm text-muted-foreground">No standups logged yet.</p>
        ) : (
          <div className="space-y-4">
            {standups.slice(0, 7).map((s) => (
              <div key={s.id} className="rounded-lg border border-border p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">
                    {new Date(s.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span
                        key={n}
                        className={n <= s.mood ? "text-warning" : "text-muted-foreground/30"}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
                  <div>
                    <p className="font-medium text-success">Done</p>
                    <p className="text-card-foreground">{s.done}</p>
                  </div>
                  <div>
                    <p className="font-medium text-primary">Planned</p>
                    <p className="text-card-foreground">{s.planned}</p>
                  </div>
                  {s.blockers && (
                    <div>
                      <p className="font-medium text-danger">Blockers</p>
                      <p className="text-card-foreground">{s.blockers}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal open={showHabitModal} onClose={() => setShowHabitModal(false)} title="New Habit">
        <form onSubmit={createHabit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-card-foreground">Name</label>
            <Input
              value={habitForm.name}
              onChange={(e) => setHabitForm({ ...habitForm, name: e.target.value })}
              placeholder="e.g., Exercise, Read 30 min"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-card-foreground">Color</label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setHabitForm({ ...habitForm, color: c })}
                  className={`h-8 w-8 rounded-full transition-transform ${
                    habitForm.color === c ? "scale-125 ring-2 ring-offset-2 ring-primary" : ""
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-card-foreground">Frequency</label>
            <Select
              value={habitForm.frequency}
              onChange={(e) => setHabitForm({ ...habitForm, frequency: e.target.value })}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setShowHabitModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Create</Button>
          </div>
        </form>
      </Modal>

      <Modal open={showStandupModal} onClose={() => setShowStandupModal(false)} title="Daily Standup">
        <form onSubmit={submitStandup} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-success">What did you do today?</label>
            <Textarea
              value={standupForm.done}
              onChange={(e) => setStandupForm({ ...standupForm, done: e.target.value })}
              placeholder="Completed tasks, achievements..."
              rows={3}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-primary">What will you do next?</label>
            <Textarea
              value={standupForm.planned}
              onChange={(e) => setStandupForm({ ...standupForm, planned: e.target.value })}
              placeholder="Tomorrow's goals..."
              rows={3}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-danger">Any blockers?</label>
            <Textarea
              value={standupForm.blockers}
              onChange={(e) => setStandupForm({ ...standupForm, blockers: e.target.value })}
              placeholder="Optional..."
              rows={2}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-card-foreground">Mood</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setStandupForm({ ...standupForm, mood: n })}
                  className={`text-2xl transition-transform ${
                    n <= standupForm.mood ? "text-warning scale-110" : "text-muted-foreground/30"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setShowStandupModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Standup</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
