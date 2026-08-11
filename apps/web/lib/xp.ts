import { prisma } from "./db";

export const XP_PER_CHECKIN = 10;
export const XP_PER_LEVEL = 100;

export function levelFromXp(xp: number): number {
  return Math.floor(Math.max(xp, 0) / XP_PER_LEVEL) + 1;
}

export function xpIntoLevel(xp: number): number {
  return Math.max(xp, 0) % XP_PER_LEVEL;
}

export async function awardXp(userId: string, delta: number): Promise<number> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { xp: { increment: delta } },
  });

  if (user.xp < 0) {
    const clamped = await prisma.user.update({
      where: { id: userId },
      data: { xp: 0 },
    });
    return clamped.xp;
  }

  return user.xp;
}
