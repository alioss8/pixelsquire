import { authenticate } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatInTimeZone } from "date-fns-tz";
import { calcStreak } from "@/lib/streak";
import { awardXp, levelFromXp, XP_PER_CHECKIN } from "@/lib/xp";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const device = await authenticate(request);
  if (!device) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const localDateStr = formatInTimeZone(
    new Date(),
    device.timezone,
    "yyyy-MM-dd",
  );
  const today = new Date(localDateStr + "T00:00:00Z");
  const goal = await prisma.goal.findFirst({
    where: {
      userId: device.userId,
      archivedAt: null,
      checkins: {
        none: { date: today },
      },
    },
  });

  if (!goal) {
    return Response.json(
      { ok: false, message: "no active goal to check in" },
      { status: 200 },
    );
  }

  await prisma.checkin.create({
    data: { goalId: goal.id, date: today },
  });
  if (goal.cadence === "ONCE") {
    await prisma.goal.update({ where: { id: goal.id }, data: { archivedAt: new Date() } });
  }
  const xp = await awardXp(device.userId, XP_PER_CHECKIN);

  const streak = await calcStreak(device.userId);
  return Response.json({ ok: true, streak, xp, level: levelFromXp(xp) });
}
