"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { getEisenhowerQuadrant, getEisenhowerScore, isOverdue, formatDate } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  description: string | null;
  deadline: string | null;
  importance: string;
  urgency: string;
  status: string;
  order: number;
  completedAt: string | null;
}

const STATUSES = ["todo", "in_progress", "done"] as const;
const STATUS_LABELS: Record<string, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    deadline: "",
    importance: "medium",
    urgency: "medium",
  });

  const fetchTasks = useCallback(async () => {
    const res = await fetch("/api/tasks");
    setTasks(await res.json());
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    if (editTask) {
      await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editTask.id, ...form }),
      });
    } else {
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setShowModal(false);
    setEditTask(null);
    setForm({ title: "", description: "", deadline: "", importance: "medium", urgency: "medium" });
    fetchTasks();
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    fetchTasks();
  };

  const deleteTask = async (id: string) => {
    await fetch(`/api/tasks?id=${id}`, { method: "DELETE" });
    fetchTasks();
  };

  const openEdit = (task: Task) => {
    setEditTask(task);
    setForm({
      title: task.title,
      description: task.description || "",
      deadline: task.deadline ? task.deadline.split("T")[0] : "",
      importance: task.importance,
      urgency: task.urgency,
    });
    setShowModal(true);
  };

  const sortedTasks = [...tasks].sort(
    (a, b) =>
      getEisenhowerScore(b.importance, b.urgency) -
      getEisenhowerScore(a.importance, a.urgency)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tasks</h1>
          <p className="mt-1 text-muted-foreground">
            Prioritized by Eisenhower matrix
          </p>
        </div>
        <Button onClick={() => { setEditTask(null); setForm({ title: "", description: "", deadline: "", importance: "medium", urgency: "medium" }); setShowModal(true); }}>
          + New Task
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {STATUSES.map((status) => (
          <div key={status}>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <span
                className={`h-2 w-2 rounded-full ${
                  status === "todo"
                    ? "bg-muted-foreground"
                    : status === "in_progress"
                    ? "bg-primary"
                    : "bg-success"
                }`}
              />
              {STATUS_LABELS[status]}
              <span className="text-xs font-normal">
                ({sortedTasks.filter((t) => t.status === status).length})
              </span>
            </h2>
            <div className="space-y-3">
              {sortedTasks
                .filter((t) => t.status === status)
                .map((task) => (
                  <Card key={task.id} className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-medium text-card-foreground">{task.title}</p>
                        {task.description && (
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                            {task.description}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => openEdit(task)}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        ✎
                      </button>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Badge
                        variant={
                          getEisenhowerQuadrant(task.importance, task.urgency) === "Do First"
                            ? "danger"
                            : getEisenhowerQuadrant(task.importance, task.urgency) === "Schedule"
                            ? "warning"
                            : "outline"
                        }
                      >
                        {getEisenhowerQuadrant(task.importance, task.urgency)}
                      </Badge>
                      {task.deadline && (
                        <span
                          className={`text-xs ${
                            isOverdue(task.deadline) ? "text-danger font-medium" : "text-muted-foreground"
                          }`}
                        >
                          {isOverdue(task.deadline) ? "⚠ " : ""}
                          {formatDate(task.deadline)}
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex gap-1">
                      {status !== "todo" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            updateStatus(task.id, status === "done" ? "in_progress" : "todo")
                          }
                        >
                          ←
                        </Button>
                      )}
                      {status !== "done" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            updateStatus(task.id, status === "todo" ? "in_progress" : "done")
                          }
                        >
                          →
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteTask(task.id)}
                        className="ml-auto text-danger"
                      >
                        ✕
                      </Button>
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={showModal}
        onClose={() => { setShowModal(false); setEditTask(null); }}
        title={editTask ? "Edit Task" : "New Task"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-card-foreground">Title</label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Task title"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-card-foreground">Description</label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Optional description"
              rows={3}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-card-foreground">Deadline</label>
            <Input
              type="date"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-card-foreground">Importance</label>
              <Select
                value={form.importance}
                onChange={(e) => setForm({ ...form, importance: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-card-foreground">Urgency</label>
              <Select
                value={form.urgency}
                onChange={(e) => setForm({ ...form, urgency: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </Select>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={() => { setShowModal(false); setEditTask(null); }}>
              Cancel
            </Button>
            <Button type="submit">{editTask ? "Save" : "Create"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
