import { calcStreak } from "./streak";
import { prisma } from './db'
import { formatInTimeZone  } from 'date-fns-tz'

function pickCategory(context: string, hour: number, streak: number): string {
    if (context === "celebrate") {
        return 'CELEBRATE';
    }

    if (hour < 11 ) {
        return 'MORNING';
    }
    if (hour >= 20 ){
        return 'EVENING';
    }
    if (streak >= 2) {
    return 'STREAK';
}
   
    return 'GOAL_NUDGE'; 
} 

export async function pickNextMessage(device:{id:string;timezone:string},context:string) {

    const streak = await calcStreak(device.id)
    const hour = parseInt(formatInTimeZone(new Date(), device.timezone, 'H'))
    const category = pickCategory(context,hour,streak)

    const messages = await prisma.message.findMany({
    where: { category: category as any, isActive: true },
    })

    const chosen = messages[Math.floor(Math.random() * messages.length)]

    const goalCount = await prisma.goal.count({
        where: {deviceId:device.id , archivedAt:null },
    })

    const text = chosen.text
    .replaceAll('{streak}' , String(streak))
    .replaceAll('{goalCount}',String(goalCount))

    return {
        id:chosen.id,
        text,
        category,
    }
}