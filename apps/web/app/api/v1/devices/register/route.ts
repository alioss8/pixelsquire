
import { registerDevice } from '@/lib/auth'
import { z } from 'zod'

const RegisterInput = z.object({
  platform: z.enum(['EXTENSION', 'PWA']).optional(),
  timezone: z.string().optional(),
})

export async function POST(req: Request) {
  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    raw = {}
  }

  const parsed = RegisterInput.safeParse(raw)
  if (!parsed.success) {
    return Response.json({ error: 'invalid input' }, { status: 400 })
  }

  const platform = parsed.data.platform ?? 'EXTENSION'
  const timezone = parsed.data.timezone ?? 'Europe/Istanbul'

  const result = await registerDevice(platform, timezone)

  return Response.json(result, { status: 201 })
}