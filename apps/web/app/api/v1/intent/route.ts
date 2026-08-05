import { authenticate } from "@/lib/auth";
import { GoogleGenAI } from "@google/genai";
import { NextRequest } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: NextRequest) {
  const device = await authenticate(request);
  if (!device) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const { text } = await request.json();

  if (!text) {
    return Response.json({ error: "missing text" }, { status: 400 });
  }

  const prompt = `Sen PixelSquire uygulamasının komut sınıflandırıcısısın.
    Kullanıcının mesajını şu intent'lerden BİRİNE sınıflandır:

    - CREATE_GOAL: yeni bir görev/quest eklemek istiyor. params: { title }
    - CHECKIN: bir görevi tamamladığını söylüyor. params: { goalHint }
    - STREAK_STATUS: streak/seri durumunu soruyor. params: {}
    - UNKNOWN: hiçbirine uymuyor. params: {}

    SADECE şu formatta JSON dön, başka HİÇBİR ŞEY yazma:
    { "intent": "...", "params": { ... } }

    Kullanıcı mesajı: "${text}"`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-flash-lite-latest",
      contents: prompt,
    });

    const cleaned = (response.text ?? "")
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { intent: "UNKNOWN", params: {} };
    }

    return Response.json(parsed);
  } catch (err) {
    console.error("GEMINI ERROR:", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
