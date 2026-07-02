"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  color: string;
}

const HOURS = Array.from({ length: 16 }, (_, i) => {
  const h = i + 7;
  return `${h.toString().padStart(2, "0")}:00`;
});

const COLORS = ["#6366f1", "#ec4899", "#f59e0b", "#22c55e", "#06b6d4", "#ef4444"];

export default function SchedulePage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [weekStart, setWeekStart] = useState(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(now.setDate(diff)).toISOString().split("T")[0];
  });
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: "",
    date: "",
    startTime: "09:00",
    endTime: "10:00",
    color: "#6366f1",
  });

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const fetchEvents = useCallback(async () => {
    const start = weekDays[0].toISOString().split("T")[0];
    const end = weekDays[6].toISOString().split("T")[0];
    const res = await fetch(`/api/events?start=${start}&end=${end}`);
    setEvents(await res.json());
  }, [weekStart]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const createEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowModal(false);
    setForm({ title: "", date: "", startTime: "09:00", endTime: "10:00", color: "#6366f1" });
    fetchEvents();
  };

  const deleteEvent = async (id: string) => {
    await fetch(`/api/events?id=${id}`, { method: "DELETE" });
    fetchEvents();
  };

  const navigateWeek = (direction: number) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + direction * 7);
    setWeekStart(d.toISOString().split("T")[0]);
  };

  const getEventsForDay = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return events.filter(
      (e) => new Date(e.date).toISOString().split("T")[0] === dateStr
    );
  };

  const hasConflict = (event: CalendarEvent, dayEvents: CalendarEvent[]) => {
    return dayEvents.some(
      (e) =>
        e.id !== event.id &&
        e.startTime < event.endTime &&
        e.endTime > event.startTime
    );
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Schedule</h1>
          <p className="mt-1 text-muted-foreground">Weekly calendar view</p>
        </div>
        <Button onClick={() => setShowModal(true)}>+ New Event</Button>
      </div>

      <Card className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigateWeek(-1)}>
            ← Prev
          </Button>
          <h2 className="text-lg font-semibold text-card-foreground">
            {weekDays[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} —{" "}
            {weekDays[6].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </h2>
          <Button variant="ghost" onClick={() => navigateWeek(1)}>
            Next →
          </Button>
        </div>

        <div className="grid grid-cols-8 gap-px rounded-lg bg-border overflow-hidden">
          <div className="bg-card p-2" />
          {weekDays.map((day) => {
            const isToday = day.toISOString().split("T")[0] === todayStr;
            return (
              <div
                key={day.toISOString()}
                className={`bg-card p-2 text-center text-sm font-medium ${
                  isToday ? "text-primary" : "text-card-foreground"
                }`}
              >
                <p className="text-xs text-muted-foreground">
                  {day.toLocaleDateString("en-US", { weekday: "short" })}
                </p>
                <p
                  className={`mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full ${
                    isToday ? "bg-primary text-primary-foreground" : ""
                  }`}
                >
                  {day.getDate()}
                </p>
              </div>
            );
          })}

          {HOURS.map((hour) => (
            <React.Fragment key={`row-${hour}`}>
              <div
                className="bg-card p-2 text-right text-xs text-muted-foreground"
              >
                {hour}
              </div>
              {weekDays.map((day) => {
                const dayEvents = getEventsForDay(day);
                return (
                  <div
                    key={`${day.toISOString()}-${hour}`}
                    className="relative bg-card p-1 min-h-[3rem] border-t border-border/50 cursor-pointer hover:bg-muted/50"
                    onClick={() => {
                      setForm({
                        ...form,
                        date: day.toISOString().split("T")[0],
                        startTime: hour,
                        endTime: `${(parseInt(hour) + 1).toString().padStart(2, "0")}:00`,
                      });
                      setShowModal(true);
                    }}
                  >
                    {dayEvents
                      .filter((e) => e.startTime.split(":")[0] === hour.split(":")[0])
                      .map((event) => (
                        <div
                          key={event.id}
                          className="group relative rounded px-1.5 py-0.5 text-xs text-white"
                          style={{ backgroundColor: event.color }}
                        >
                          <span className="font-medium">{event.title}</span>
                          <br />
                          <span className="opacity-80">
                            {event.startTime}–{event.endTime}
                          </span>
                          {hasConflict(event, dayEvents) && (
                            <span className="ml-1" title="Time conflict">⚠</span>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteEvent(event.id);
                            }}
                            className="absolute right-1 top-0.5 hidden text-white/80 hover:text-white group-hover:block"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="New Event">
        <form onSubmit={createEvent} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-card-foreground">Title</label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Event title"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-card-foreground">Date</label>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-card-foreground">Start</label>
              <Input
                type="time"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-card-foreground">End</label>
              <Input
                type="time"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                required
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-card-foreground">Color</label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, color: c })}
                  className={`h-8 w-8 rounded-full transition-transform ${
                    form.color === c ? "scale-125 ring-2 ring-offset-2 ring-primary" : ""
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Create</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
