import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const standups = await prisma.standup.findMany({
    orderBy: { date: "desc" },
    take: 30,
  });
  return NextResponse.json(standups);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const dateStr = body.date || new Date().toISOString().split("T")[0];
  const date = new Date(dateStr + "T00:00:00.000Z");

  const standup = await prisma.standup.upsert({
    where: { date },
    update: {
      done: body.done,
      planned: body.planned,
      blockers: body.blockers || null,
      mood: body.mood || 3,
    },
    create: {
      date,
      done: body.done,
      planned: body.planned,
      blockers: body.blockers || null,
      mood: body.mood || 3,
    },
  });
  return NextResponse.json(standup);
}
