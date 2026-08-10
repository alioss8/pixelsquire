import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cookieStore = await cookies();
    const deviceToken =
      searchParams.get("device_token") ?? cookieStore.get("token")?.value ?? null;

    // Token yoksa hata dön
    if (!deviceToken) {
      return NextResponse.json(
        { error: "device_token bulunamadı!" },
        { status: 400 },
      );
    }

    const state = crypto.randomUUID();

    cookieStore.set("oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 600,
    });

    cookieStore.set("device_token", deviceToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 600,
    });

    const clientId = process.env.GOOGLE_CLIENT_ID || "";
    const redirectUri = "http://localhost:3000/api/v1/auth/google/callback";

    const googleAuthUrl = new URL(
      "https://accounts.google.com/o/oauth2/v2/auth",
    );
    googleAuthUrl.searchParams.set("client_id", clientId);
    googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
    googleAuthUrl.searchParams.set("response_type", "code");
    googleAuthUrl.searchParams.set("scope", "openid email profile");
    googleAuthUrl.searchParams.set("state", state);

    return NextResponse.redirect(googleAuthUrl.toString());
  } catch (error) {
    console.error("Bir hata oluştu:", error);
    return NextResponse.json(
      { error: "Sunucu içi bir hata oluştu" },
      { status: 500 },
    );
  }
}
