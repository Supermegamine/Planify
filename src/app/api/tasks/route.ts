import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const tasks = await prisma.task.findMany({
    orderBy: [{ status: "asc" }, { order: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const task = await prisma.task.create({
    data: {
      title: body.title,
      description: body.description || null,
      deadline: body.deadline ? new Date(body.deadline) : null,
      importance: body.importance || "medium",
      urgency: body.urgency || "medium",
      status: body.status || "todo",
    },
  });
  return NextResponse.json(task, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const task = await prisma.task.update({
    where: { id: body.id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.deadline !== undefined && {
        deadline: body.deadline ? new Date(body.deadline) : null,
      }),
      ...(body.importance !== undefined && { importance: body.importance }),
      ...(body.urgency !== undefined && { urgency: body.urgency }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.order !== undefined && { order: body.order }),
      ...(body.status === "done" && { completedAt: new Date() }),
      ...(body.status && body.status !== "done" && { completedAt: null }),
    },
  });
  return NextResponse.json(task);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await prisma.task.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
