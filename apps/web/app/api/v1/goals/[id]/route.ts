import { authenticate } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextRequest } from "next/server";

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
