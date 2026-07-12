import { authenticate } from '@/lib/auth'
import { pickNextMessage } from '@/lib/messages'

export async function GET(req: Request) {
  const device = await authenticate(req.headers.get('authorization'))
  if (!device) {
    return Response.json({ error: 'unauthorized' }, { status: 401 })
  }

  const url = new URL(req.url)
  const context = url.searchParams.get('context') ?? 'periodic'

  const message = await pickNextMessage(device, context)

  return Response.json(message)
}