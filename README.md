# Pikirler — Pikirleriň dünýäsi

> *The world of thoughts.*

Pikirler is a Turkmen-language social network in the mould of Threads / X — a fast, dark-by-default, mobile-first feed for sharing short thoughts. It ships with full social mechanics (posts, replies, likes, reposts, saves, follows, profiles, search, and an activity feed) plus an AI layer that keeps the timeline alive: Google Gemini generates on-topic Turkmen replies and rewrites real news headlines into natural feed posts on a schedule.

Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, Prisma + PostgreSQL, and deployed on **Netlify**.

---

## Features

**Social core**
- Post short thoughts with optional images
- Replies, likes, reposts, and saves/bookmarks
- Follow / unfollow, with follower & following counts
- User profiles (banner, avatar, bio, location, website, join date)
- Global search across posts and users
- Activity feed aggregating likes, replies, and new followers
- Trending hashtag topics

**AI & automation (cron-driven)**
- 🤖 **Gemini bot** — generates short, natural Turkmen replies to unanswered human posts
- 📰 **News bot** — pulls real headlines (GNews) and has Gemini rewrite them as Turkmen feed posts (facts only, no invented details)
- ⏰ **Scheduler** — auto-publishes queued posts within configurable active hours and intervals

**Platform**
- 🔐 JWT auth with an HTTP-only session cookie; `middleware.ts` walls the app behind `/login`
- 🛠️ Admin panel (`/admin`) for bulk-uploading posts and configuring automation, gated by `ADMIN_SECRET`
- 📦 Upstash Redis for caching
- 🖼️ Cloudinary for image uploads
- 🌱 Prisma seed script that creates bot users and sample posts
- 🌙 Custom dark design system with spring-based micro-animations (see `DESIGN-SYSTEM.md`)

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS (custom theme + CSS-var animation primitives) |
| Database | PostgreSQL via Prisma ORM |
| Auth | JWT (`jsonwebtoken`) + `bcryptjs`, HTTP-only cookie |
| AI | Google Gemini (`@google/generative-ai`, `gemini-1.5-flash`) |
| News source | GNews API |
| Caching | Upstash Redis |
| Image hosting | Cloudinary |
| Hosting & cron | Netlify (`@netlify/plugin-nextjs` + scheduled functions) |

---

## Getting started

### Prerequisites
- Node.js 20+
- A PostgreSQL database
- Accounts/keys for: Upstash Redis, Google Gemini, GNews, Cloudinary

### Installation

```bash
git clone https://github.com/garahan/pikirler.git
cd pikirler
npm install            # runs `prisma generate` via postinstall
```

### Environment variables

Create `.env` (or `.env.local`) in the project root:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/pikirler"

# Auth
JWT_SECRET="a-long-random-secret"
ADMIN_SECRET="your-admin-password"     # gates /admin and admin APIs
CRON_SECRET="your-cron-secret"         # required as ?key= on cron endpoints

# Redis (Upstash)
REDIS_URL="https://your-instance.upstash.io"
REDIS_TOKEN="your-redis-token"

# AI / content
GEMINI_API_KEY="your-gemini-key"
GNEWS_API_KEY="your-gnews-key"

# Image uploads (Cloudinary)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-key"
CLOUDINARY_API_SECRET="your-cloudinary-secret"

# Optional tuning
SCHEDULER_TZ_OFFSET="5"     # hours from UTC for active-window checks (default 0)
NEWS_PER_DAY="8"            # max AI news posts per day
NEWS_MIN_GAP_MIN="60"       # minimum minutes between news posts
```

> **Note:** the Redis client reads `REDIS_URL` / `REDIS_TOKEN`. Cron endpoints expect the secret as a query string, e.g. `/api/cron?action=scheduler&key=$CRON_SECRET`.

### Database

```bash
npx prisma db push      # apply the schema
npx prisma db seed      # create bot users + sample posts (idempotent-ish)
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected to `/login` until you register or sign in.

---

## Project structure

This is a Next.js App Router project; the canonical source lives under **`app/`**.

```
pikirler/
├── app/
│   ├── api/                # Route handlers (auth, feed, post, like, save,
│   │   │                   #   repost, reply, follow, profile, search,
│   │   │                   #   activity, content, upload, admin, cron, …)
│   │   └── cron/           # AI bot, news, and scheduler endpoints
│   ├── components/         # PostCard, Composer, Feed, SideNav, AppShell, …
│   ├── admin/  activity/  login/  profile/  saved/  search/  u/[username]/
│   ├── layout.tsx          # Root layout (Inter font, dark theme)
│   ├── page.tsx            # Home feed
│   └── globals.css         # Design tokens + animation keyframes
├── lib/
│   ├── db.ts               # Prisma client singleton
│   ├── redis.ts            # Upstash Redis client
│   ├── gemini.ts           # Gemini reply + news-rewrite helpers
│   ├── auth.ts             # JWT sign/verify, session cookie, getCurrentUser
│   └── toggle.ts           # Generic like/save/repost toggle helper
├── prisma/
│   ├── schema.prisma       # User, Post, Reply, Like, Save, Repost, Follow,
│   │                       #   ScheduledPost, BotReplyLog
│   └── seed.ts             # Bots + sample posts
├── netlify/functions/      # Scheduled functions that call /api/cron
├── middleware.ts           # Auth wall (redirects to /login)
├── netlify.toml            # Build + Netlify Next.js plugin config
├── tailwind.config.js      # Theme, colors, animations
└── DESIGN-SYSTEM.md        # Visual & motion reference
```

> **Heads up — duplicated files.** This snapshot also contains copies of `page.tsx`, `layout.tsx`, `globals.css`, `components/`, and `api/` at the **repo root**, mirroring their `app/` counterparts. Next.js's App Router only reads from `app/`, so the root-level copies are redundant and can drift out of sync. Treat `app/` as the source of truth and consider removing the duplicates.

---

## Data model

Defined in `prisma/schema.prisma`:

- **User** — accounts and bot accounts (`isBot`, `isAdmin` flags)
- **Post** — text + images, optionally linked to a `ScheduledPost`
- **Reply / Like / Save / Repost** — interactions, each unique per `(postId, userId)`
- **Follow** — directed follower → following edges
- **ScheduledPost** — queued content with active-hours window and posting interval
- **BotReplyLog** — record of AI-generated replies (dedup / auditing)

---

## API overview

All handlers live under `app/api/`.

**Auth** — `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`
**Feed & posts** — `/api/feed`, `/api/post`, `/api/post/[id]`
**Interactions** — `/api/like`, `/api/save`, `/api/saved`, `/api/repost`, `/api/reply`, `/api/follow`, `/api/interactions`
**Profiles & discovery** — `/api/profile`, `/api/profile/[username]`, `/api/search`, `/api/activity`
**Media** — `/api/upload` (Cloudinary)
**Admin** — `/api/admin/upload`, `/api/content`, `/api/seed-bots` (gated by `ADMIN_SECRET`)
**Cron** — `/api/cron?action=gemini-bot|news|scheduler` (gated by `CRON_SECRET`)

---

## Scheduled jobs

Cron logic is centralized in `app/api/cron/route.ts` and triggered by Netlify scheduled functions in `netlify/functions/`:

| Function | Schedule | Action |
|---|---|---|
| `cron-gemini.ts` | ~every 2h | AI replies to recent human posts |
| `cron-news.ts` | ~every 3h | Translate/rewrite real news into Turkmen posts |
| `cron-scheduler.ts` | every 30 min | Publish queued scheduled posts |

Each function fetches `/api/cron?action=…&key=$CRON_SECRET`. Set `CRON_SECRET` (and the other env vars) in your Netlify dashboard.

---

## Admin panel

Visit `/admin` and authenticate with `ADMIN_SECRET`. From there you can bulk-upload posts (JSON; see `sample-posts.json` for the shape) and configure automation such as active hours.

---

## Deployment (Netlify)

The repo is configured for Netlify out of the box via `netlify.toml`:

```toml
[build]
  command = "npx prisma generate && npx prisma db push && npx prisma db seed || true && npm run build"
  publish = ".next"
```

1. Connect the repository in Netlify.
2. Add all environment variables (above) under **Site settings → Environment variables**.
3. Deploy. The `@netlify/plugin-nextjs` plugin handles the Next.js build, and the scheduled functions in `netlify/functions/` register automatically.

---

## Design system

See `DESIGN-SYSTEM.md` for the full reference: color tokens, typography (Inter), the cyan→violet signature gradient, motion primitives (`likePop`, `slideUp`, `toastIn`, `breathe`, …), and the component inventory. The same tokens are mirrored in `tailwind.config.js` and `app/globals.css`.

---

## License

MIT — see `LICENSE` for details.

## Author

**Garahan**

---

*Pikirleriň dünýäsi — the world of thoughts.*
