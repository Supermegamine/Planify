import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  const where = start && end
    ? { date: { gte: new Date(start), lte: new Date(end) } }
    : {};

  const events = await prisma.event.findMany({
    where,
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });
  return NextResponse.json(events);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const event = await prisma.event.create({
    data: {
      title: body.title,
      date: new Date(body.date),
      startTime: body.startTime,
      endTime: body.endTime,
      color: body.color || "#6366f1",
    },
  });
  return NextResponse.json(event, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const event = await prisma.event.update({
    where: { id: body.id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.date !== undefined && { date: new Date(body.date) }),
      ...(body.startTime !== undefined && { startTime: body.startTime }),
      ...(body.endTime !== undefined && { endTime: body.endTime }),
      ...(body.color !== undefined && { color: body.color }),
    },
  });
  return NextResponse.json(event);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await prisma.event.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
