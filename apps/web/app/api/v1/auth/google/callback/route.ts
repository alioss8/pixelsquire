import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateToken } from "@/lib/auth";
import { createRemoteJWKSet, jwtVerify } from "jose";

const googleJwks = createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs"),
);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    const cookieStore = await cookies();
    const savedState = cookieStore.get("oauth_state")?.value;
    const savedDeviceToken = cookieStore.get("device_token")?.value || "";

    if (!state || !savedState || state !== savedState) {
      return NextResponse.json({ error: "bad request" }, { status: 400 });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: code || "",
        client_id: clientId || "",
        client_secret: clientSecret || "",
        redirect_uri: redirectUri || "",
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();
    const idToken = tokenData.id_token;

    if (!idToken) {
      return NextResponse.json(
        { error: "Google'dan id_token alınamadı!" },
        { status: 400 },
      );
    }

    const { payload: userInfo } = await jwtVerify(idToken, googleJwks, {
      issuer: ["https://accounts.google.com", "accounts.google.com"],
      audience: clientId,
    });

    const googleId = userInfo.sub as string;
    const name = userInfo.name as string | undefined;
    const email = (userInfo.email as string | undefined) || "";

    const device = await authenticateToken(savedDeviceToken);
    if (!device?.userId) {
      return NextResponse.json(
        { error: "Device/user bulunamadı" },
        { status: 400 },
      );
    }

    const anonUser = await prisma.user.findUnique({
      where: { id: device.userId },
    });
    const googleUser = await prisma.user.findUnique({ where: { googleId } });

    if (!googleUser) {
      await prisma.user.update({
        where: { id: device.userId },
        data: { googleId, email, name },
      });

      const response = NextResponse.redirect(
        `${process.env.APP_URL}/auth/success?email=${email}`,
      );
      response.cookies.set("token", savedDeviceToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });
      return response;
    }

    if (googleUser.id === anonUser?.id) {
      const response = NextResponse.redirect(
        `${process.env.APP_URL}/auth/success?email=${email}`,
      );
      response.cookies.set("token", savedDeviceToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });
      return response;
    }

    return NextResponse.redirect(
      `${process.env.APP_URL}/auth/merge-accounts?googleUserId=${googleUser.id}&anonUserId=${anonUser?.id}&deviceToken=${savedDeviceToken}`,
    );
  } catch (error) {
    console.error("Callback Hatası:", error);
    return NextResponse.json({ error: "İşlem başarısız" }, { status: 500 });
  }
}
