import { authenticate } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { calcStreak, getStreakHistory } from "@/lib/streak";
import { GoogleGenAI } from "@google/genai";
import { subDays } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
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
    - DAY_REVIEW: belirli bir günün özetini istiyor (örn. "dün ne yaptım"). params: { dayHint } (örn. "dün", "bugün")
    - WEEKLY_REVIEW: son bir haftanın özetini istiyor (örn. "bu hafta nasıl geçti"). params: {}
    - STREAK_ANALYSIS: uzun vadeli aktivite haritasını/genel durumunu istiyor, tek günden fazlasını (örn. "aktivite haritamı göster", "genel durumum nasıl"). params: {}
    - COMPARE: bu haftayı geçen haftayla karşılaştırmak istiyor (örn. "bu hafta geçen haftaya göre nasıl geçti"). params: {}
    - SUGGEST_GOAL: yeni bir quest önerisi istiyor (örn. "bana bir görev öner", "ne eklemeliyim"). params: {}
    - TALK_TO_KNIGHT: yukarıdaki komutların hiçbiri değil ama şövalyeyle sohbet ediyor, motivasyon arıyor, duygularını paylaşıyor ya da genel bir şey soruyor (örn. "naber", "bugün yorgunum", "beni motive et"). params: {}
    - UNKNOWN: yukarıdakilerin hiçbirine uymuyor, anlamsız veya bozuk bir girdi. params: {}

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

    let data = {};
    switch (parsed.intent) {
      case "STREAK_STATUS": {
        const [streak, history] = await Promise.all([
          calcStreak(device.userId),
          getStreakHistory(device.userId),
        ]);
        data = { streak, history };
        break;
      }

      case "CREATE_GOAL": {
        const title = String(parsed.params?.title ?? "").trim();
        if (!title) {
          data = { ok: false, message: "quest başlığı anlaşılamadı" };
          break;
        }
        const goal = await prisma.goal.create({
          data: { title, cadence: "DAILY", userId: device.userId },
        });
        data = { ok: true, goal };
        break;
      }

      case "CHECKIN": {
        const goalHint = String(parsed.params?.goalHint ?? "")
          .trim()
          .toLowerCase();
        const goals = goalHint
          ? await prisma.goal.findMany({ where: { userId: device.userId } })
          : [];
        const goal =
          goals.find((g) => g.title.toLowerCase().includes(goalHint)) ??
          goals.find((g) => goalHint.includes(g.title.toLowerCase()));

        if (!goal) {
          data = { ok: false, message: "hangi quest olduğu anlaşılamadı" };
          break;
        }

        const localDateStr = formatInTimeZone(
          new Date(),
          device.timezone,
          "yyyy-MM-dd",
        );
        const today = new Date(localDateStr + "T00:00:00Z");

        await prisma.checkin.upsert({
          where: { goalId_date: { goalId: goal.id, date: today } },
          create: { goalId: goal.id, date: today },
          update: {},
        });

        const streak = await calcStreak(device.userId);
        data = { ok: true, goal: goal.title, streak };
        break;
      }

      case "DAY_REVIEW": {
        const dayHint = String(parsed.params?.dayHint ?? "").toLowerCase();
        const target = dayHint.includes("dün")
          ? subDays(new Date(), 1)
          : new Date();
        const localDateStr = formatInTimeZone(
          target,
          device.timezone,
          "yyyy-MM-dd",
        );
        const day = new Date(localDateStr + "T00:00:00Z");

        const [completed, total] = await Promise.all([
          prisma.goal.findMany({
            where: { userId: device.userId, checkins: { some: { date: day } } },
            select: { id: true, title: true },
          }),
          prisma.goal.count({
            where: { userId: device.userId, archivedAt: null },
          }),
        ]);

        data = { date: localDateStr, completed, total };
        break;
      }

      case "WEEKLY_REVIEW": {
        const history = await getStreakHistory(device.userId, 7);
        data = { history };
        break;
      }

      case "STREAK_ANALYSIS": {
        const history = await getStreakHistory(device.userId, 91);
        data = { history };
        break;
      }

      case "COMPARE": {
        const history14 = await getStreakHistory(device.userId, 14);
        const lastWeek = history14.slice(0, 7);
        const thisWeek = history14.slice(7, 14);
        const thisWeekTotal = thisWeek.reduce((sum, d) => sum + d.count, 0);
        const lastWeekTotal = lastWeek.reduce((sum, d) => sum + d.count, 0);
        data = { thisWeek, lastWeek, thisWeekTotal, lastWeekTotal };
        break;
      }

      case "SUGGEST_GOAL": {
        const goals = await prisma.goal.findMany({
          where: { userId: device.userId, archivedAt: null },
          select: { title: true },
        });
        const titles = goals.map((g) => g.title).join(", ") || "henüz hiç yok";

        const suggestPrompt = `Sen PixelSquire uygulamasındaki bir şövalyesin.
    Kullanıcının mevcut quest'leri: ${titles}.
    Kullanıcıya bu quest'leri tamamlayıcı, çeşitlilik katacak YENİ bir quest öner.
    SADECE şu formatta JSON dön, başka HİÇBİR ŞEY yazma:
    { "title": "...", "reason": "..." }
    title kısa olsun (en fazla 60 karakter). reason, şövalye ağzıyla 1 cümlelik motive edici bir açıklama olsun.`;

        try {
          const suggestResponse = await ai.models.generateContent({
            model: "gemini-flash-lite-latest",
            contents: suggestPrompt,
          });
          const suggestCleaned = (suggestResponse.text ?? "")
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();
          const suggestion = JSON.parse(suggestCleaned);
          data = {
            ok: true,
            title: String(suggestion.title ?? ""),
            reason: String(suggestion.reason ?? ""),
          };
        } catch {
          data = { ok: false, message: "öneri üretilemedi" };
        }
        break;
      }

      case "TALK_TO_KNIGHT": {
        const [streak, goalCount] = await Promise.all([
          calcStreak(device.userId),
          prisma.goal.count({
            where: { userId: device.userId, archivedAt: null },
          }),
        ]);

        const chatPrompt = `Sen PixelSquire uygulamasındaki pixel-art bir şövalyesin, kullanıcının kişisel motivasyon arkadaşısın.
    Kullanıcının güncel streak'i: ${streak} gün. Aktif quest sayısı: ${goalCount}.
    Kullanıcı sana şunu söyledi: "${text}"

    Kurallar:
    - En fazla 1 kısa cümle yaz. Şövalye ağzı hafif bir ton olsun, tiyatral kılıç/kalkan metaforlarıyla süsleme.
    - Kullanıcı uygulamayla ilgili pratik bir şey soruyorsa (ör. bir ayar, özellik, "nasıl yaparım" tarzı sorular) direkt ve doğru cevap ver.
    - Uygulamada olmayan bir özellik veya ayardan ("profil ayarları" gibi) ASLA bahsetme, uydurma. Emin değilsen bunu söyle, uydurma bir cevap verme.
    - JSON değil, düz metin cevap ver.`;

        try {
          const chatResponse = await ai.models.generateContent({
            model: "gemini-flash-lite-latest",
            contents: chatPrompt,
          });
          const reply = (chatResponse.text ?? "").trim();
          data = { reply: reply || "Şu an ne diyeceğimi bilemedim kral." };
        } catch {
          data = { reply: "Şu an cevap veremiyorum kral, biraz sonra tekrar dene." };
        }
        break;
      }

      case "UNKNOWN": {
        data = {
          message: "Anlamadım kral, şunları sorabilirsin:",
          suggestions: [
            "Kaç günlük streak'im var?",
            "Yeni bir quest ekle: <başlık>",
            "<quest adı> yaptım / tamamladım",
          ],
        };
        break;
      }
    }

    return Response.json({ ...parsed, data });
  } catch (err) {
    console.error("GEMINI ERROR:", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
