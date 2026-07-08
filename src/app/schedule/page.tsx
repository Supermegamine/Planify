"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  type DragEndEvent,
} from "@dnd-kit/core";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  color: string;
}

const DAY_START = 7; // first hour shown
const HOURS_COUNT = 16; // 07:00 → 23:00
const DAY_END = DAY_START + HOURS_COUNT; // 23
const HOUR_HEIGHT = 56; // px per hour
const SNAP = 15; // drag snaps to 15-minute increments

const HOURS = Array.from({ length: HOURS_COUNT }, (_, i) => {
  const h = i + DAY_START;
  return `${h.toString().padStart(2, "0")}:00`;
});

const COLORS = ["#6366f1", "#ec4899", "#f59e0b", "#22c55e", "#06b6d4", "#ef4444"];

const timeToMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
const minToTime = (min: number) =>
  `${Math.floor(min / 60)
    .toString()
    .padStart(2, "0")}:${(min % 60).toString().padStart(2, "0")}`;
const toDateStr = (d: string | Date) => new Date(d).toISOString().split("T")[0];

// Assign side-by-side columns to overlapping events within a single day.
function computeLayout(dayEvents: CalendarEvent[]) {
  const sorted = [...dayEvents].sort(
    (a, b) => timeToMin(a.startTime) - timeToMin(b.startTime)
  );
  const layouts = new Map<string, { col: number; cols: number }>();
  let cluster: CalendarEvent[] = [];
  let clusterEnd = -1;

  const flush = () => {
    const colEnds: number[] = [];
    const placed: { id: string; col: number }[] = [];
    for (const ev of cluster) {
      const s = timeToMin(ev.startTime);
      let col = colEnds.findIndex((end) => end <= s);
      if (col === -1) {
        col = colEnds.length;
        colEnds.push(0);
      }
      colEnds[col] = timeToMin(ev.endTime);
      placed.push({ id: ev.id, col });
    }
    for (const p of placed) layouts.set(p.id, { col: p.col, cols: colEnds.length });
    cluster = [];
    clusterEnd = -1;
  };

  for (const ev of sorted) {
    if (cluster.length && timeToMin(ev.startTime) >= clusterEnd) flush();
    cluster.push(ev);
    clusterEnd = Math.max(clusterEnd, timeToMin(ev.endTime));
  }
  if (cluster.length) flush();
  return layouts;
}

function EventBlock({
  event,
  layout,
  onEdit,
  onDelete,
}: {
  event: CalendarEvent;
  layout: { col: number; cols: number };
  onEdit: (e: CalendarEvent) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: event.id,
  });

  const startMin = timeToMin(event.startTime);
  const endMin = timeToMin(event.endTime);
  const top = ((startMin - DAY_START * 60) / 60) * HOUR_HEIGHT;
  const height = Math.max(((endMin - startMin) / 60) * HOUR_HEIGHT, 20);
  const width = 100 / layout.cols;
  const left = layout.col * width;

  return (
    <div
      ref={setNodeRef}
      style={{
        position: "absolute",
        top,
        height,
        left: `calc(${left}% + 2px)`,
        width: `calc(${width}% - 4px)`,
        backgroundColor: event.color,
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : undefined,
        zIndex: isDragging ? 50 : 10,
        opacity: isDragging ? 0.85 : 1,
      }}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        e.stopPropagation();
        onEdit(event);
      }}
      className="group cursor-grab select-none overflow-hidden rounded px-1.5 py-0.5 text-xs text-white shadow-sm active:cursor-grabbing"
    >
      <span className="block font-medium leading-tight">{event.title}</span>
      <span className="block opacity-80">
        {event.startTime}–{event.endTime}
      </span>
      <button
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onDelete(event.id);
        }}
        className="absolute right-1 top-0.5 hidden text-white/80 hover:text-white group-hover:block"
      >
        ✕
      </button>
    </div>
  );
}

function DayColumn({
  dateStr,
  dayEvents,
  onCreate,
  onEdit,
  onDelete,
}: {
  dateStr: string;
  dayEvents: CalendarEvent[];
  onCreate: (date: string, start: string, end: string) => void;
  onEdit: (e: CalendarEvent) => void;
  onDelete: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: dateStr });
  const layouts = computeLayout(dayEvents);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    let start = DAY_START * 60 + Math.floor((y / HOUR_HEIGHT) * 60 / 30) * 30;
    start = Math.max(DAY_START * 60, Math.min(start, DAY_END * 60 - 30));
    const end = Math.min(start + 60, DAY_END * 60);
    onCreate(dateStr, minToTime(start), minToTime(end));
  };

  return (
    <div
      ref={setNodeRef}
      onClick={handleClick}
      className={`relative cursor-pointer ${isOver ? "bg-muted/40" : "bg-card"}`}
      style={{ height: HOURS_COUNT * HOUR_HEIGHT }}
    >
      {HOURS.map((h, i) => (
        <div
          key={h}
          className="absolute inset-x-0 border-t border-border/50"
          style={{ top: i * HOUR_HEIGHT, height: HOUR_HEIGHT }}
        />
      ))}
      {dayEvents.map((ev) => (
        <EventBlock
          key={ev.id}
          event={ev}
          layout={layouts.get(ev.id) ?? { col: 0, cols: 1 }}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default function SchedulePage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [weekStart, setWeekStart] = useState(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(now.setDate(diff)).toISOString().split("T")[0];
  });
  const [showModal, setShowModal] = useState(false);
  const [editEvent, setEditEvent] = useState<CalendarEvent | null>(null);
  const [form, setForm] = useState({
    title: "",
    date: "",
    startTime: "09:00",
    endTime: "10:00",
    color: "#6366f1",
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (editEvent) {
      await fetch("/api/events", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editEvent.id, ...form }),
      });
    } else {
      await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    closeModal();
    fetchEvents();
  };

  const deleteEvent = async (id: string) => {
    await fetch(`/api/events?id=${id}`, { method: "DELETE" });
    if (editEvent?.id === id) closeModal();
    fetchEvents();
  };

  const closeModal = () => {
    setShowModal(false);
    setEditEvent(null);
    setForm({ title: "", date: "", startTime: "09:00", endTime: "10:00", color: "#6366f1" });
  };

  const openCreate = (date: string, startTime: string, endTime: string) => {
    setEditEvent(null);
    setForm({ title: "", date, startTime, endTime, color: "#6366f1" });
    setShowModal(true);
  };

  const openEdit = (event: CalendarEvent) => {
    setEditEvent(event);
    setForm({
      title: event.title,
      date: toDateStr(event.date),
      startTime: event.startTime,
      endTime: event.endTime,
      color: event.color,
    });
    setShowModal(true);
  };

  const navigateWeek = (direction: number) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + direction * 7);
    setWeekStart(d.toISOString().split("T")[0]);
  };

  const getEventsForDay = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return events.filter((e) => toDateStr(e.date) === dateStr);
  };

  const handleDragEnd = async ({ active, over, delta }: DragEndEvent) => {
    const event = events.find((e) => e.id === active.id);
    if (!event) return;

    const startMin = timeToMin(event.startTime);
    const duration = timeToMin(event.endTime) - startMin;
    const deltaMin = Math.round((delta.y / HOUR_HEIGHT) * 60 / SNAP) * SNAP;

    let newStart = startMin + deltaMin;
    newStart = Math.max(DAY_START * 60, Math.min(newStart, DAY_END * 60 - duration));
    const newDate = over ? String(over.id) : toDateStr(event.date);

    if (deltaMin === 0 && newDate === toDateStr(event.date)) return;

    const updated = {
      ...event,
      date: newDate,
      startTime: minToTime(newStart),
      endTime: minToTime(newStart + duration),
    };

    setEvents((prev) => prev.map((e) => (e.id === event.id ? updated : e)));

    await fetch("/api/events", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: event.id,
        date: newDate,
        startTime: updated.startTime,
        endTime: updated.endTime,
      }),
    });
    fetchEvents();
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Schedule</h1>
          <p className="mt-1 text-muted-foreground">Weekly calendar view</p>
        </div>
        <Button onClick={() => openCreate(todayStr, "09:00", "10:00")}>+ New Event</Button>
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

        <div className="grid grid-cols-8 gap-px overflow-hidden rounded-t-lg bg-border">
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
        </div>

        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-8 gap-px overflow-hidden rounded-b-lg bg-border">
            <div className="relative bg-card" style={{ height: HOURS_COUNT * HOUR_HEIGHT }}>
              {HOURS.map((h, i) => (
                <div
                  key={h}
                  className="absolute right-2 text-xs text-muted-foreground"
                  style={{ top: i * HOUR_HEIGHT + 2 }}
                >
                  {h}
                </div>
              ))}
            </div>
            {weekDays.map((day) => (
              <DayColumn
                key={day.toISOString()}
                dateStr={day.toISOString().split("T")[0]}
                dayEvents={getEventsForDay(day)}
                onCreate={openCreate}
                onEdit={openEdit}
                onDelete={deleteEvent}
              />
            ))}
          </div>
        </DndContext>
      </Card>

      <Modal open={showModal} onClose={closeModal} title={editEvent ? "Edit Event" : "New Event"}>
        <form onSubmit={handleSubmit} className="space-y-4">
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
                    form.color === c ? "scale-125 ring-2 ring-primary ring-offset-2" : ""
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            {editEvent && (
              <Button
                type="button"
                variant="ghost"
                className="mr-auto text-danger"
                onClick={() => deleteEvent(editEvent.id)}
              >
                Delete
              </Button>
            )}
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit">{editEvent ? "Save" : "Create"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
