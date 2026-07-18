import { authenticate } from "@/lib/auth";
import { prisma  } from "@/lib/db";

export async function POST(req:Request,{ params }: { params: Promise<{ id: string }> }) {
    const  device = await authenticate(req.headers.get('authorization'))
    if (!device){
        return Response.json({error:'unauthorized'},{status:401})
    }

    const {id} =await params
    const today = new Date()
    today.setHours(0,0,0,0)

    const goal = await prisma.goal.findFirst({
        where: { id: id, userId: device.userId },
    })
    if (!goal) {
        return Response.json({ error: 'goal not found' }, { status: 404 })
    }

   const checkin = await prisma.checkin.upsert({
        where: { goalId_date: { goalId: id, date: today } },
        create: { goalId: id, date: today },
        update: {},
    })

    return Response.json({ok: true, checkin } , {status:201})

}
