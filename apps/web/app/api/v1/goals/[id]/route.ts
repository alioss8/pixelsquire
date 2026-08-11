import { authenticate } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { GoalCadence } from "@pixelsquire/shared";
import { NextRequest } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const device = await authenticate(request);
  if (!device) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const goal = await prisma.goal.findFirst({
    where: { id, userId: device.userId },
  });
  if (!goal) {
    return Response.json({ error: "goal not found" }, { status: 404 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    raw = {};
  }
  const parsed = GoalCadence.safeParse((raw as { cadence?: unknown })?.cadence);
  if (!parsed.success) {
    return Response.json({ error: "invalid cadence" }, { status: 400 });
  }

  const updated = await prisma.goal.update({
    where: { id },
    data: { cadence: parsed.data },
  });

  return Response.json(updated);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const device = await authenticate(request);
  if (!device) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const goal = await prisma.goal.findFirst({
    where: { id, userId: device.userId },
  });
  if (!goal) {
    return Response.json({ error: "goal not found" }, { status: 404 });
  }

  await prisma.goal.delete({ where: { id } });

  return Response.json({ ok: true });
}
