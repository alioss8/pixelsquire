import { authenticate } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { calcStreak } from "@/lib/streak";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const device = await authenticate(request);
  if (!device) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const streak = await calcStreak(device.userId);
  const activeGoals = await prisma.goal.count({
    where: { userId: device.userId, archivedAt: null },
  });

  return Response.json({
    streak,
    activeGoals,
    user: device.user.email
      ? { email: device.user.email, name: device.user.name }
      : null,
  });
}
