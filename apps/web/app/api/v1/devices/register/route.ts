
import { registerDevice } from '@/lib/auth'

export async function POST(req: Request) {
  let body: any = {}
  try {
    body = await req.json()
  } catch {
    body = {}
  }

  const platform = body.platform === 'PWA' ? 'PWA' : 'EXTENSION'
  const timezone = body.timezone ?? 'Europe/Istanbul'

  const result = await registerDevice(platform, timezone)

  return Response.json(result, { status: 201 })
}