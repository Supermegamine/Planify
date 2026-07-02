import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const habits = await prisma.habit.findMany({
    include: { logs: { orderBy: { date: "desc" } } },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(habits);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (body.action === "toggle") {
    const dateStr = body.date || new Date().toISOString().split("T")[0];
    const date = new Date(dateStr + "T00:00:00.000Z");

    const existing = await prisma.habitLog.findUnique({
      where: { habitId_date: { habitId: body.habitId, date } },
    });

    if (existing) {
      await prisma.habitLog.delete({ where: { id: existing.id } });
    } else {
      await prisma.habitLog.create({
        data: { habitId: body.habitId, date },
      });
    }
    return NextResponse.json({ success: true });
  }

  const habit = await prisma.habit.create({
    data: {
      name: body.name,
      icon: body.icon || "check",
      color: body.color || "#6366f1",
      frequency: body.frequency || "daily",
    },
  });
  return NextResponse.json(habit, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await prisma.habit.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
