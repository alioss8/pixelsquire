import { authenticate } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatInTimeZone } from "date-fns-tz";
import { awardXp, XP_PER_CHECKIN } from "@/lib/xp";
import { Prisma } from "@prisma/client";
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

  let checkin;
  try {
    checkin = await prisma.checkin.create({ data: { goalId: id, date: today } });
    if (goal.cadence === "ONCE") {
      await prisma.goal.update({ where: { id }, data: { archivedAt: new Date() } });
    }
    await awardXp(device.userId, XP_PER_CHECKIN);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      checkin = await prisma.checkin.findUniqueOrThrow({
        where: { goalId_date: { goalId: id, date: today } },
      });
    } else {
      throw err;
    }
  }

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

  const { count } = await prisma.checkin.deleteMany({
    where: { goalId: id, date: today },
  });
  if (count > 0) {
    await awardXp(device.userId, -XP_PER_CHECKIN);
    if (goal.cadence === "ONCE" && goal.archivedAt) {
      await prisma.goal.update({ where: { id }, data: { archivedAt: null } });
    }
  }

  return Response.json({ ok: true });
}
