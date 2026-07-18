import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { authenticate } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    const cookieStore = await cookies()
    const savedState = cookieStore.get('oauth_state')?.value
    const savedDeviceToken = cookieStore.get('device_token')?.value || ""

    if (!state || !savedState || state !== savedState) {
      return NextResponse.json({ error: "bad request" }, { status: 400 })
    }

    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const redirectUri = process.env.GOOGLE_REDIRECT_URI

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: code || '',
        client_id: clientId || '',
        client_secret: clientSecret || '',
        redirect_uri: redirectUri || '',
        grant_type: 'authorization_code',
      }),
    })

    const tokenData = await tokenResponse.json()
    const idToken = tokenData.id_token

    if (!idToken) {
      return NextResponse.json({ error: "Google'dan id_token alınamadı!" }, { status: 400 })
    }

    const userInfoResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`)
    const userInfo = await userInfoResponse.json()
    console.log("User Information:", userInfo)

    const googleId = userInfo.sub
    const name = userInfo.name
    const email = userInfo.email || ''

    const device = await authenticate(`Bearer ${savedDeviceToken}`)
    if (!device?.userId) {
      return NextResponse.json({ error: 'Device/user bulunamadı' }, { status: 400 })
    }

    const anonUser = await prisma.user.findUnique({ where: { id: device.userId } })
    const googleUser = await prisma.user.findUnique({ where: { googleId } })

    if (!googleUser) {
      await prisma.user.update({
        where: { id: device.userId },
        data: { googleId, email, name },
      })

      return NextResponse.redirect(
        `${process.env.APP_URL}/auth/success?email=${email}&deviceToken=${savedDeviceToken}`
      )
    }

    if (googleUser.id === anonUser?.id) {
      return NextResponse.redirect(
        `${process.env.APP_URL}/auth/success?email=${email}&deviceToken=${savedDeviceToken}`
      )
    }

    return NextResponse.redirect(
      `${process.env.APP_URL}/auth/merge?googleUserId=${googleUser.id}&anonUserId=${anonUser?.id}&deviceToken=${savedDeviceToken}`
    )

  } catch (error) {
    console.error("Callback Hatası:", error)
    return NextResponse.json({ error: "İşlem başarısız" }, { status: 500 })
  }
}