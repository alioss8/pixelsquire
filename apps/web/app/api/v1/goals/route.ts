import { authenticate } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { calcGoalStreak } from "@/lib/streak";
import { CreateGoalInput } from "@pixelsquire/shared";
import { formatInTimeZone } from "date-fns-tz";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const device = await authenticate(request);
  if (!device) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    raw = {};
  }

  const parsed = CreateGoalInput.safeParse(raw);
  if (!parsed.success) {
    return Response.json(
      { error: "invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { title, cadence } = parsed.data;

  const goal = await prisma.goal.create({
    data: {
      title: title,
      cadence: cadence,
      userId: device.userId,
    },
  });

  return Response.json(goal, { status: 201 });
}

export async function GET(request: NextRequest) {
  const device = await authenticate(request);
  if (!device) return Response.json({ error: "unauthorized" }, { status: 401 });

  const goals = await prisma.goal.findMany({
    where: { userId: device.userId, archivedAt: null },
    orderBy: { createdAt: "asc" },
  });

  const localDateStr = formatInTimeZone(new Date(), device.timezone, "yyyy-MM-dd");
  const today = new Date(localDateStr + "T00:00:00Z");

  const enriched = await Promise.all(
    goals.map(async (goal) => {
      const [streak, todayCheckin] = await Promise.all([
        calcGoalStreak(goal.id),
        prisma.checkin.findUnique({
          where: { goalId_date: { goalId: goal.id, date: today } },
        }),
      ]);
      return { ...goal, streak, doneToday: Boolean(todayCheckin) };
    }),
  );

  return Response.json(enriched, { status: 200 });
}
