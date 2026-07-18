import { authenticate } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { calcStreak } from "@/lib/streak";

export async function GET(req:Request) {
    const device = await authenticate(req.headers.get('authorization'))
    if (!device){
        return Response.json({error:'unauthorized'},{status:401})
    }
    
    
    const streak = await calcStreak(device.userId)
    const activeGoals = await prisma.goal.count({
        where: { userId: device.userId , archivedAt: null},
    }) 
    
    return Response.json({ streak, activeGoals })
}