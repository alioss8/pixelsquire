import { randomBytes, createHash } from "crypto";
import { prisma } from "./db";
import { NextRequest } from "next/server";

const hash = (s: string) => createHash("sha256").update(s).digest("hex");

export async function registerDevice(
  platform: "EXTENSION" | "PWA",
  timezone: string,
) {
  const secret = randomBytes(32).toString("base64url");
  const device = await prisma.device.create({
    data: {
      secretHash: hash(secret),
      platform: platform,
      timezone: timezone,
      user: { create: {} },
    },
  });
  return { deviceId: device.id, token: `${device.id}.${secret}` };
}

export async function authenticateToken(token: string | null) {
  if (!token) return null;
  const [deviceId, secret] = token.split(".");
  if (!deviceId || !secret) return null;
  const device = await prisma.device.findUnique({
    where: { id: deviceId },
    include: { user: true },
  });
  if (!device) return null;
  if (device.secretHash !== hash(secret)) return null;
  return device;
}

export async function authenticate(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  let token: string | null = null;
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.slice(7).trim();
  } else {
    token = request.cookies.get("token")?.value ?? null;
  }
  return authenticateToken(token);
}
