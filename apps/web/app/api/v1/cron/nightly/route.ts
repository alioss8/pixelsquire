import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { formatInTimeZone } from "date-fns-tz";
import { getWebPush } from "@/lib/push";
import { pickNextMessage } from "@/lib/messages";

const SUMMARY_HOUR = "21";
const NUDGE_HOURS = ["10", "14", "18"];

type Sub = Awaited<ReturnType<typeof prisma.pushSubscription.findMany>>[number] & {
  device: { id: string; userId: string; timezone: string };
};

async function sendPush(sub: Sub, title: string, body: string) {
  const webpush = getWebPush();
  try {
    await webpush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      },
      JSON.stringify({ title, body }),
    );
  } catch (err) {
    const statusCode = (err as { statusCode?: number }).statusCode;
    if (statusCode === 410 || statusCode === 404) {
      await prisma.pushSubscription.delete({ where: { id: sub.id } });
    }
    console.error("push failed for", sub.device.id, err);
  }
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const subs = await prisma.pushSubscription.findMany({
    include: { device: true },
  });

  const now = new Date();

  for (const sub of subs) {
    const localHour = formatInTimeZone(now, sub.device.timezone, "H");

    if (localHour === SUMMARY_HOUR) {
      const localDateStr = formatInTimeZone(now, sub.device.timezone, "yyyy-MM-dd");
      const todayStart = new Date(localDateStr + "T00:00:00Z");
      const completedToday = await prisma.checkin.count({
        where: {
          date: todayStart,
          goal: { userId: sub.device.userId },
        },
      });
      if (completedToday === 0) continue; // bugün bir şey yapmadıysa gönderme

      await sendPush(
        sub,
        "PixelSquire ⚔️",
        `Bugün ${completedToday} quest tamamladın!`,
      );
      continue;
    }

    if (NUDGE_HOURS.includes(localHour)) {
      const localDateStr = formatInTimeZone(now, sub.device.timezone, "yyyy-MM-dd");
      const todayStart = new Date(localDateStr + "T00:00:00Z");

      const [completedToday, totalGoals] = await Promise.all([
        prisma.checkin.count({
          where: { date: todayStart, goal: { userId: sub.device.userId } },
        }),
        prisma.goal.count({
          where: { userId: sub.device.userId, archivedAt: null },
        }),
      ]);
      if (totalGoals > 0 && completedToday >= totalGoals) continue; // bugün zaten bitirmiş, nagging yapma

      const message = await pickNextMessage(sub.device, "periodic");
      await sendPush(sub, "PixelSquire ⚔️", message.text);
    }
  }
  return NextResponse.json({ ok: true });
}
