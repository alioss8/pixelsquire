import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateToken } from "@/lib/auth";
import { calcStreak } from "@/lib/streak";

async function summarize(userId: string) {
  const [goalCount, streak, user] = await Promise.all([
    prisma.goal.count({ where: { userId, archivedAt: null } }),
    calcStreak(userId),
    prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true } }),
  ]);
  return { goalCount, streak, email: user?.email ?? null, name: user?.name ?? null };
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const googleUserId = searchParams.get("googleUserId");
  const anonUserId = searchParams.get("anonUserId");
  const deviceToken = searchParams.get("deviceToken");

  if (!googleUserId || !anonUserId || !deviceToken) {
    return NextResponse.json({ error: "missing params" }, { status: 400 });
  }

  const device = await authenticateToken(deviceToken);
  if (!device || (device.userId !== googleUserId && device.userId !== anonUserId)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 403 });
  }

  const [google, anon] = await Promise.all([
    summarize(googleUserId),
    summarize(anonUserId),
  ]);

  return NextResponse.json({ google, anon });
}
