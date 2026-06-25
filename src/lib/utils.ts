import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const PRIORITY_SCORES: Record<string, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

export function getEisenhowerScore(importance: string, urgency: string): number {
  return (PRIORITY_SCORES[importance] || 2) * (PRIORITY_SCORES[urgency] || 2);
}

export function getEisenhowerQuadrant(importance: string, urgency: string): string {
  const impHigh = PRIORITY_SCORES[importance] >= 3;
  const urgHigh = PRIORITY_SCORES[urgency] >= 3;

  if (impHigh && urgHigh) return "Do First";
  if (impHigh && !urgHigh) return "Schedule";
  if (!impHigh && urgHigh) return "Delegate";
  return "Eliminate";
}

export function getStreakCount(dates: Date[]): number {
  if (dates.length === 0) return 0;

  const sorted = [...dates]
    .map((d) => new Date(d).toISOString().split("T")[0])
    .sort()
    .reverse();

  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  if (sorted[0] !== today && sorted[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const curr = new Date(sorted[i - 1]);
    const prev = new Date(sorted[i]);
    const diff = (curr.getTime() - prev.getTime()) / 86400000;
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function isOverdue(deadline: Date | string | null): boolean {
  if (!deadline) return false;
  return new Date(deadline) < new Date(new Date().toDateString());
}
