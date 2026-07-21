import { authenticate } from "@/lib/auth";
import { pickNextMessage } from "@/lib/messages";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const device = await authenticate(request);
  if (!device) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const context = url.searchParams.get("context") ?? "periodic";

  const message = await pickNextMessage(device, context);

  return Response.json(message);
}
