import { prisma } from "./db"
import {format, subDays} from 'date-fns'

export async function calcStreak(deviceId: string): Promise<number> {
  const days = await prisma.checkin.findMany({
    where : {goal : {deviceId}} ,
    select: {date : true} ,
    distinct : ['date'],
    orderBy : {date : 'desc'},
    take : 365,
  })

  const daySet = new Set(days.map(d=>format(d.date,'yyyy-MM-dd')))

  let streak = 0 
  let cursor = new Date()

  if (!daySet.has(format(cursor,'yyyy-MM-dd'))){
    cursor = subDays(cursor,1)
  }
  while (daySet.has(format(cursor,'yyyy-MM-dd'))){
    streak++
    cursor =subDays(cursor,1)
  }
  return streak
}
