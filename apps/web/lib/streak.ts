import { prisma } from "./db"
import {format, subDays, startOfDay} from 'date-fns'

function streakFromDates(dates: Date[]): number {
  const daySet = new Set(dates.map(d => format(d, 'yyyy-MM-dd')))

  let streak = 0
  let cursor = new Date()

  if (!daySet.has(format(cursor, 'yyyy-MM-dd'))) {
    cursor = subDays(cursor, 1)
  }
  while (daySet.has(format(cursor, 'yyyy-MM-dd'))) {
    streak++
    cursor = subDays(cursor, 1)
  }
  return streak
}

export async function calcStreak(userId: string): Promise<number> {
  const days = await prisma.checkin.findMany({
    where: { goal: { userId } },
    select: { date: true },
    distinct: ['date'],
    orderBy: { date: 'desc' },
    take: 365,
  })

  return streakFromDates(days.map(d => d.date))
}

export async function calcGoalStreak(goalId: string): Promise<number> {
  const days = await prisma.checkin.findMany({
    where: { goalId },
    select: { date: true },
    orderBy: { date: 'desc' },
    take: 365,
  })

  return streakFromDates(days.map(d => d.date))
}

export type StreakHistoryPoint = { date: string; count: number }

export async function getStreakHistory(userId: string, days = 30): Promise<StreakHistoryPoint[]> {
  const since = startOfDay(subDays(new Date(), days - 1))

  const checkins = await prisma.checkin.findMany({
    where: { goal: { userId }, date: { gte: since } },
    select: { date: true },
  })

  const counts = new Map<string, number>()
  for (const { date } of checkins) {
    const key = format(date, 'yyyy-MM-dd')
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  const history: StreakHistoryPoint[] = []
  for (let i = days - 1; i >= 0; i--) {
    const key = format(subDays(new Date(), i), 'yyyy-MM-dd')
    history.push({ date: key, count: counts.get(key) ?? 0 })
  }
  return history
}