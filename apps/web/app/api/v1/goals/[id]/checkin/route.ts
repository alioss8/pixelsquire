import { authenticate } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatInTimeZone } from "date-fns-tz";
import { NextRequest } from "next/server";

function todayFor(timezone: string) {
  const localDateStr = formatInTimeZone(new Date(), timezone, "yyyy-MM-dd");
  return new Date(localDateStr + "T00:00:00Z");
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const device = await authenticate(request);
  if (!device) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const today = todayFor(device.timezone);

  const goal = await prisma.goal.findFirst({
    where: { id: id, userId: device.userId },
  });
  if (!goal) {
    return Response.json({ error: "goal not found" }, { status: 404 });
  }

  const checkin = await prisma.checkin.upsert({
    where: { goalId_date: { goalId: id, date: today } },
    create: { goalId: id, date: today },
    update: {},
  });

  return Response.json({ ok: true, checkin }, { status: 201 });
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
  const today = todayFor(device.timezone);

  const goal = await prisma.goal.findFirst({
    where: { id: id, userId: device.userId },
  });
  if (!goal) {
    return Response.json({ error: "goal not found" }, { status: 404 });
  }

  await prisma.checkin.deleteMany({
    where: { goalId: id, date: today },
  });

  return Response.json({ ok: true });
}
