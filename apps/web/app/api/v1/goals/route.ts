import { authenticate } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req:Request) {
    const device = await authenticate(req.headers.get('authorization'))
    if (!device){
        return Response.json({error:'unauthorized'},{status:401})
    }

    let body:any ={} 
    try {
       body = await req.json() 
    } catch {
       body ={}  
    }

    const title =body.title
    const cadence =body.cadence ?? 'DAILY'

    const goal =await prisma.goal.create({
        data:{
            title:title,
            cadence:cadence,
            deviceId:device.id
        },
     })

    return Response.json(goal,{status:201})
    
}

export async function GET(req:Request) {
const device =await authenticate(req.headers.get('authorization'))
   if (!device)
    return Response.json({error:'unauthorized'},{status:401})

const goals = await prisma.goal.findMany({
    where:{deviceId:device.id}
})
    return Response.json(goals,{status:200})

}