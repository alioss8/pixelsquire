import { authenticate } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getWebPush } from "@/lib/push";

export async function POST(request: NextRequest) {
  const device = await authenticate(request);
  if (!device) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const sub = await prisma.pushSubscription.findUnique({
    where: { deviceId: device.id },
  });

  if (!sub) {
    return NextResponse.json({ error: "no subscription" }, { status: 404 });
  }
  try {
    const webpush = getWebPush(); // ← çağır, webpush objesini al
    await webpush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      },
      JSON.stringify({ title: "PixelSquire", body: "İlk bildirim! ⚔️" }),
    );
  } catch (err) {
    console.error("push failed:", err);
    return NextResponse.json({ error: "push failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true }, { status: 200 });
}
