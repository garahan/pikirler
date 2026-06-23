import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateReply, translateNews } from '@/lib/gemini';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ─── helpers (scheduler) ────────────────────────────────────────────────────

function toMin(hhmm?: string | null): number | null {
  if (!hhmm) return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

function nowMinutes(offsetHours: number): number {
  const utc = Date.now() + new Date().getTimezoneOffset() * 60000;
  const local = new Date(utc + offsetHours * 3600000);
  return local.getHours() * 60 + local.getMinutes();
}

function withinWindow(now: number, from: number | null, to: number | null): boolean {
  if (from == null || to == null) return true;
  if (from <= to) return now >= from && now <= to;
  return now >= from || now <= to;
}

// ─── types ───────────────────────────────────────────────────────────────────

type GNewsArticle = { title: string; description: string; url: string };

// ─── GET /api/cron?action=gemini-bot|news|scheduler ─────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');
  const key = searchParams.get('key');

  if (process.env.CRON_SECRET && key !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  // ── GEMINI BOT ──────────────────────────────────────────────────────────────
  if (action === 'gemini-bot') {
    try {
      const candidates = await prisma.post.findMany({
        where: { user: { isBot: false }, replies: { none: {} } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { id: true, text: true },
      });
      if (candidates.length === 0)
        return NextResponse.json({ ok: true, action: 'none', reason: 'no_target' });

      let target = null as { id: string; text: string } | null;
      for (const c of candidates) {
        const already = await prisma.botReplyLog.findFirst({ where: { originalPostId: c.id } });
        if (!already) { target = c; break; }
      }
      if (!target) return NextResponse.json({ ok: true, action: 'none', reason: 'all_replied' });

      const replyText = await generateReply(target.text);
      if (!replyText) return NextResponse.json({ ok: true, action: 'none', reason: 'no_reply_generated' });

      const bots = await prisma.user.findMany({ where: { isBot: true, isAdmin: false }, select: { id: true, username: true } });
      if (bots.length === 0) return NextResponse.json({ ok: true, action: 'none', reason: 'no_bots_seeded' });
      const bot = bots[Math.floor(Math.random() * bots.length)];

      const reply = await prisma.reply.create({ data: { text: replyText, postId: target.id, userId: bot.id } });
      await prisma.botReplyLog.create({ data: { originalPostId: target.id, botUserId: bot.id, replyText } });

      console.log(`[gemini-bot] ${bot.username} replied to ${target.id}`);
      return NextResponse.json({ ok: true, action: 'replied', replyId: reply.id, by: bot.username });
    } catch (err) {
      console.error('[gemini-bot] error', err);
      return NextResponse.json({ error: 'bot_failed' }, { status: 500 });
    }
  }

  // ── NEWS ────────────────────────────────────────────────────────────────────
  if (action === 'news') {
    const GNEWS = process.env.GNEWS_API_KEY;
    if (!GNEWS) return NextResponse.json({ ok: true, action: 'none', reason: 'no_news_key' });

    const DAILY_TARGET = Number(process.env.NEWS_PER_DAY ?? 3);
    const MIN_GAP_MIN = Number(process.env.NEWS_MIN_GAP_MIN ?? 180);

    try {
      const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
      const bot = await prisma.user.upsert({
        where: { username: 'pikirler_news' },
        update: {},
        create: {
          username: 'pikirler_news',
          displayName: 'Pikirler Habarlar',
          isBot: true,
          avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=pikirler_news',
        },
      });

      const todayCount = await prisma.post.count({ where: { userId: bot.id, createdAt: { gte: startOfDay } } });
      if (todayCount >= DAILY_TARGET)
        return NextResponse.json({ ok: true, action: 'none', reason: 'daily_target_reached', todayCount });

      const last = await prisma.post.findFirst({ where: { userId: bot.id }, orderBy: { createdAt: 'desc' }, select: { createdAt: true } });
      if (last) {
        const gapMin = (Date.now() - last.createdAt.getTime()) / 60000;
        if (gapMin < MIN_GAP_MIN)
          return NextResponse.json({ ok: true, action: 'none', reason: 'too_soon', gapMin: Math.round(gapMin) });
      }

      const r = await fetch(`https://gnews.io/api/v4/top-headlines?category=world&lang=en&max=10&apikey=${GNEWS}`);
      const data = await r.json();
      const articles: GNewsArticle[] = Array.isArray(data.articles) ? data.articles : [];
      if (articles.length === 0) return NextResponse.json({ ok: true, action: 'none', reason: 'no_articles' });

      let chosen: GNewsArticle | null = null;
      for (const a of articles) {
        if (!a.title) continue;
        const seen = await prisma.botReplyLog.findFirst({ where: { originalPostId: `news:${a.url}` } });
        if (!seen) { chosen = a; break; }
      }
      if (!chosen) return NextResponse.json({ ok: true, action: 'none', reason: 'all_seen' });

      const text = await translateNews(chosen.title, chosen.description || chosen.title);
      if (!text) return NextResponse.json({ ok: true, action: 'none', reason: 'translate_failed' });

      const post = await prisma.post.create({ data: { text, images: [], userId: bot.id } });
      await prisma.botReplyLog.create({ data: { originalPostId: `news:${chosen.url}`, botUserId: bot.id, replyText: text } });

      console.log('[news] posted', post.id);
      return NextResponse.json({ ok: true, action: 'posted', postId: post.id, source: chosen.url });
    } catch (err) {
      console.error('[news] error', err);
      return NextResponse.json({ error: 'news_failed' }, { status: 500 });
    }
  }

  // ── SCHEDULER ───────────────────────────────────────────────────────────────
  if (action === 'scheduler') {
    try {
      const pending = await prisma.scheduledPost.findMany({
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'asc' },
      });

      if (pending.length === 0)
        return NextResponse.json({ ok: true, action: 'none', reason: 'queue_empty' });

      const cfg = pending[0];
      const tz = Number(process.env.SCHEDULER_TZ_OFFSET ?? 5);
      const now = nowMinutes(tz);

      if (!withinWindow(now, toMin(cfg.activeFrom), toMin(cfg.activeTo)))
        return NextResponse.json({ ok: true, action: 'none', reason: 'inactive_hours' });

      const last = await prisma.scheduledPost.findFirst({
        where: { lastPostedAt: { not: null } },
        orderBy: { lastPostedAt: 'desc' },
        select: { lastPostedAt: true },
      });
      if (last?.lastPostedAt) {
        const elapsedMin = (Date.now() - last.lastPostedAt.getTime()) / 60000;
        const min = cfg.intervalMin ?? 0;
        const max = cfg.intervalMax ?? min;
        const need = min + Math.random() * Math.max(0, max - min);
        if (elapsedMin < need)
          return NextResponse.json({ ok: true, action: 'none', reason: 'interval_not_elapsed' });
      }

      const pick = pending[Math.floor(Math.random() * pending.length)];
      const admin = await prisma.user.upsert({
        where: { username: 'pikirler_admin' },
        update: {},
        create: {
          username: 'pikirler_admin',
          isBot: true,
          isAdmin: true,
          avatar: 'https://api.dicebear.com/7.x/thumbs/svg?seed=pikirler_admin',
        },
      });

      const post = await prisma.post.create({
        data: { text: pick.text, images: pick.images, userId: admin.id, scheduledId: pick.id },
      });
      await prisma.scheduledPost.update({
        where: { id: pick.id },
        data: { status: 'PUBLISHED', lastPostedAt: new Date() },
      });

      console.log('[scheduler] published', post.id);
      return NextResponse.json({ ok: true, action: 'published', postId: post.id });
    } catch (err) {
      console.error('[scheduler] error', err);
      return NextResponse.json({ error: 'scheduler_failed' }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'unknown_action' }, { status: 400 });
}
