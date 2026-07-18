import { authenticate } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CreateGoalInput } from '@pixelsquire/shared'

export async function POST(req:Request) {
    const device = await authenticate(req.headers.get('authorization'))
    if (!device){
        return Response.json({error:'unauthorized'},{status:401})
    }

    let raw: unknown
    try {
    raw = await req.json()
    } catch {
    raw = {}
    }

    const parsed = CreateGoalInput.safeParse(raw)
    if (!parsed.success) {
    return Response.json(
        { error: 'invalid input', details: parsed.error.flatten() },
        { status: 400 }
    )
    }

const { title, cadence } = parsed.data

    const goal =await prisma.goal.create({
        data:{
            title:title,
            cadence:cadence,
            userId:device.userId,
        },
     })

    return Response.json(goal,{status:201})
    
}

export async function GET(req:Request) {
const device =await authenticate(req.headers.get('authorization'))
   if (!device)
    return Response.json({error:'unauthorized'},{status:401})

const goals = await prisma.goal.findMany({
    where:{userId:device.id}
})
    return Response.json(goals,{status:200})

}