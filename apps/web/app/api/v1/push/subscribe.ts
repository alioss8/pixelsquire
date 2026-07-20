import { authenticate } from "@/lib/auth";
import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request:NextRequest) {
    const device = await authenticate(request.headers.get('authorization'))
    if (!device){ 
       return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const { endpoint, p256dh, auth } = await request.json()

    if (!endpoint || !p256dh || !auth ){
        return NextResponse.json({error:'missing subscription fields'} ,{ status: 400 })
    }

    const subscription = await prisma.pushSubscription.upsert({
         where: { deviceId: device.id },
         create:{ deviceId:device.id , endpoint: endpoint , p256dh:p256dh, auth:auth},
         update:{ endpoint: endpoint , p256dh:p256dh, auth:auth }
    })

    return NextResponse.json({ ok: true }, { status: 200 })
}