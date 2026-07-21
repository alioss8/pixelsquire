import { authenticate } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CreateGoalInput } from "@pixelsquire/shared";
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
    where: { userId: device.userId },
  });
  return Response.json(goals, { status: 200 });
}
