import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { keepUserId, deleteUserId, deviceToken } = body

    if (!keepUserId || !deleteUserId || !deviceToken) {
      return NextResponse.json({ error: 'missing fields' }, { status: 400 })
    }

    const [deviceId] = deviceToken.split('.')
    const device = await prisma.device.findUnique({
      where: { id: deviceId },
      include: { user: true },
    })

    if (!device || device.user.id !== deleteUserId) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 403 })
    }

    await prisma.device.update({
      where: { id: deviceId },
      data: { userId: keepUserId },
    })

    await prisma.user.delete({
      where: { id: deleteUserId },
    })

    return NextResponse.json({ ok: true })

  } catch (error) {
    console.error('Merge error:', error)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}