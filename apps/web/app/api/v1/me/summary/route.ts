import { authenticate } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { calcStreak } from "@/lib/streak";
import { levelFromXp, xpIntoLevel, XP_PER_LEVEL } from "@/lib/xp";
import { formatInTimeZone } from "date-fns-tz";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const device = await authenticate(request);
  if (!device) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const localDateStr = formatInTimeZone(new Date(), device.timezone, "yyyy-MM-dd");
  const todayStart = new Date(localDateStr + "T00:00:00Z");

  const [streak, activeGoals, completedToday] = await Promise.all([
    calcStreak(device.userId),
    prisma.goal.count({ where: { userId: device.userId, archivedAt: null } }),
    prisma.checkin.count({
      where: { date: todayStart, goal: { userId: device.userId } },
    }),
  ]);
  const xp = device.user.xp;

  return Response.json({
    streak,
    activeGoals,
    xp,
    level: levelFromXp(xp),
    xpIntoLevel: xpIntoLevel(xp),
    xpForNextLevel: XP_PER_LEVEL,
    streakAtRisk: streak > 0 && completedToday === 0,
    user: device.user.email
      ? { email: device.user.email, name: device.user.name }
      : null,
  });
}
