# PixelSquire ⚔️

Your pixel squire, nudging you to quest daily. A motivational companion that lives in your browser (extension) and on your phone (PWA), with push notifications to keep you on your streak.

## 🎯 What is PixelSquire?

PixelSquire transforms daily motivation into a game. A small pixel knight appears in your browser, delivering samimi (genuine) nudges to complete your goals. On mobile, push notifications arrive at your chosen times. Your streak counter grows as you check in daily — the goal is to never break the chain.

**Architecture:**
- 🖥️ **Chrome Extension** — content script + mascot character appearing on any webpage
- 📱 **PWA** — mobile-first progressive web app with push notifications
- 🔌 **Shared Backend** — single API serving both clients
- 🤖 **Optional AI** — Gemini free tier for personalized messages (Faz 4)

All of this **costs zero dollars** — Vercel hobby tier, Neon free PostgreSQL, Gemini free API, no domain needed (vercel.app subdomain).

## 🏗️ Architecture Overview

```
┌──────────────────────┐        ┌──────────────────────┐
│  Chrome Extension    │        │   PWA (Next.js)      │
│  (MV3)               │        │   mobile + desktop   │
│  - content script    │        │   - service worker   │
│  - background SW     │        │   - push subscribe   │
│  - mascot (32×32)    │        │   - hedef/streak UI  │
└──────────┬───────────┘        └──────────┬───────────┘
           │        REST API (JSON)        │
           └──────────────┬────────────────┘
                          ▼
              ┌────────────────────────┐
              │  Backend (Next.js      │
              │  Route Handlers)       │
              │  - /api/v1/*           │
              │  - Vercel Cron         │
              └──────┬────────┬────────┘
                     │        │
          ┌──────────▼─┐   ┌──▼─────────────┐
          │ PostgreSQL  │   │ web-push (VAPID)
          │ (Neon)      │   │ → FCM/APNs
          └─────────────┘   └─────────────────┘
```

**Monorepo structure:**
```
pixelsquire/
├── apps/
│   ├── web/              # Next.js: PWA + API routes
│   └── extension/        # Vite: Chrome MV3 extension
├── packages/
│   └── shared/           # zod schemas, types
├── pnpm-workspace.yaml   # workspace config
├── turbo.json            # build orchestration
└── package.json          # root package manager config
```

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ (recommended 22+)
- pnpm 11+
- Git

### Installation

```bash
git clone https://github.com/yourusername/pixelsquire.git
cd pixelsquire
pnpm install
```

### Development

**Run all dev servers:**
```bash
pnpm turbo dev
```

This starts:
- Next.js on `http://localhost:3000` (PWA)
- Vite on `http://localhost:5173` (extension build watch)

**Build everything:**
```bash
pnpm turbo build
```

### Extension Development (Local Testing)

1. Build extension: `pnpm --filter extension build`
2. Chrome: `chrome://extensions` → Enable "Developer mode"
3. Click "Load unpacked" → select `apps/extension/dist/`
4. Extension appears in toolbar; reload to see changes

## 📋 Phases

### ✅ Faz 0 — Monorepo Setup (DONE)
- Turborepo + pnpm workspaces
- Next.js app (PWA skeleton)
- Vite + CRXJS (extension MV3)
- Shared package with zod schemas

### 🔄 Faz 1 — Backend Core (Next)
- PostgreSQL + Prisma ORM
- Device auth (token-based, no login)
- `/api/v1/` endpoints: register, goals, checkin, messages, push subscription
- Message selection algorithm (category + streak + no-repeat)
- Streak calculation (SQL recursive CTE or JS)

### 🔄 Faz 2 — Chrome Extension
- Background service worker (alarms, API client)
- Content script + Shadow DOM mascot
- Popup UI (goals + quick checkin)
- Options page (notification times)
- Sprite animation system (4 durum × 4 kare)

### 🔄 Faz 3 — PWA + Push
- Minimal service worker
- Push subscription flow (with Notification.requestPermission)
- Vercel Cron: `*/15 * * * *` for push dispatch
- Timezone-aware message scheduling
- iOS detection + "add to home" guidance

### 📦 Faz 4 — Personalization (Optional)
- Gemini 2.0 Flash free tier integration
- Nightly batch message generation
- Rule-based customization (streak tone, celebration)
- Fallback chain: generated → template → static

### 🎁 Faz 5 — Launch
- Chrome Web Store listing ($5 one-time dev fee)
- README + GIF demo
- Admin dashboard (optional): device count, push stats
- GitHub badges

## 🛠️ Tech Stack

| Layer | Tech | Why |
|---|---|---|
| Frontend (PWA) | Next.js 16 + App Router | Full-stack ease; Vercel deploy |
| Frontend (Extension) | Vite + CRXJS + React | Fast HMR; manifest v3 automation |
| Backend API | Next.js Route Handlers | Same repo; serverless-friendly |
| Database | PostgreSQL + Prisma | Type-safe ORM; migrations built-in |
| Validation | Zod | Runtime + compile-time types |
| Push | web-push + VAPID | Standard; FCM/APNs compatible |
| Monorepo | pnpm workspaces + Turborepo | Disk-efficient; build cache |
| AI (opt.) | Gemini 2.0 Flash | Free tier; no auth key exposure |
| Deploy | Vercel (web) + GitHub (extension) | Hobby tier free; built-in cron |
| Database Host | Neon | Serverless PG; free tier ample |

## 🎨 Character Design

**PixelSquire** — a 32×32 pixel knight standing ready. Four states:
- **Idle**: sword at side, breathing animation
- **Talk**: mascot speaks (balon açılırken)
- **Celebrate**: sword raised after checkin ✨
- **Sad**: slumped after streak break 😢

Sprite sheet: `128×128 PNG` (4 rows × 4 columns, one row per state). Rendered **3-4x scaled** with `image-rendering: pixelated` CSS.

## 🔐 Security Notes

- Device tokens hashed (sha256) in DB, never plain-text
- VAPID private key + CRON_SECRET + API keys: **Vercel env only**
- CORS: allowlist PWA origin + extension ID
- Content script in Shadow DOM (style isolation)
- Rate limiting: per-device token (future: Upstash Redis)

## 📊 API Overview

Base: `/api/v1`, all requests require `Authorization: Bearer <deviceToken>`

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/devices/register` | Get device token |
| GET | `/messages/next?context=morning` | Next motivational message |
| GET,POST | `/goals` | CRUD goals |
| POST | `/goals/:id/checkin` | Mark today done → return streak |
| GET | `/me/summary` | Streak, open goals, stats |
| PUT | `/push/subscription` | Register push endpoint |
| POST | `/cron/dispatch` | Vercel Cron → send push (protected) |

## 🚨 Common Pitfalls

| Trap | Solution |
|---|---|
| MV3 service worker dies; `setInterval` vanishes | Use `chrome.alarms` only |
| `onMessage` async response lost | `return true` in listener |
| Pixel sprite blurry after scaling | `image-rendering: pixelated` CSS |
| Content CSS clashes with host page | Shadow DOM with `mode: 'closed'` |
| UTC day boundary ≠ user's local day | `formatInTimeZone(date, tz, 'yyyy-MM-dd')` |
| Double push in 15-min window | Idempotency key: `push:{id}:{date}:{slot}` |
| iOS push doesn't work | Standalone mode required; PWA to home screen |
| Notification permission auto-pop rejected | Button-triggered `requestPermission()` only |

## 🤝 Contributing

This is a personal project, but if you fork it:
1. Keep zero-cost ethos (Vercel/Neon/Gemini free tiers)
2. Maintain monorepo structure
3. Add tests for new endpoints
4. Update README + architecture diagrams

## 📝 License

MIT — fork it, modify it, ship it. See LICENSE file.

## 🎯 Roadmap

- [x] Faz 0: Monorepo skeleton
- [ ] Faz 1: Backend + auth
- [ ] Faz 2: Extension mascot
- [ ] Faz 3: PWA + push
- [ ] Faz 4: AI personalization
- [ ] Faz 5: Store launch
- [ ] V2: Native mobile (Expo/React Native)
- [ ] V2: Leaderboards / social features
- [ ] V2: Premium tiers (custom mascots, advanced stats)

---

**Made with ⚔️ by [Ali](https://github.com/yourusername)**

Questions? Open an issue or reach out.
