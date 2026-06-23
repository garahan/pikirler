import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { translateNews } from '@/lib/gemini';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DAILY_TARGET = Number(process.env.NEWS_PER_DAY ?? 3);
const MIN_GAP_MIN = Number(process.env.NEWS_MIN_GAP_MIN ?? 180); // ~3h between posts

type GNewsArticle = { title: string; description: string; url: string };

export async function GET(req: NextRequest) {
  const key = new URL(req.url).searchParams.get('key');
  if (process.env.CRON_SECRET && key !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const GNEWS = process.env.GNEWS_API_KEY;
  if (!GNEWS) return NextResponse.json({ ok: true, action: 'none', reason: 'no_news_key' });

  try {
    // how many news posts already today? (logged on a dedicated bot)
    const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
    const bot = await prisma.user.upsert({
      where: { username: 'pikirler_news' },
      update: {},
      create: { username: 'pikirler_news', displayName: 'Pikirler Habarlar', isBot: true, avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=pikirler_news' },
    });

    const todayCount = await prisma.post.count({ where: { userId: bot.id, createdAt: { gte: startOfDay } } });
    if (todayCount >= DAILY_TARGET) return NextResponse.json({ ok: true, action: 'none', reason: 'daily_target_reached', todayCount });

    const last = await prisma.post.findFirst({ where: { userId: bot.id }, orderBy: { createdAt: 'desc' }, select: { createdAt: true } });
    if (last) {
      const gapMin = (Date.now() - last.createdAt.getTime()) / 60000;
      if (gapMin < MIN_GAP_MIN) return NextResponse.json({ ok: true, action: 'none', reason: 'too_soon', gapMin: Math.round(gapMin) });
    }

    // fetch real top headlines
    const r = await fetch(`https://gnews.io/api/v4/top-headlines?category=world&lang=en&max=10&apikey=${GNEWS}`);
    const data = await r.json();
    const articles: GNewsArticle[] = Array.isArray(data.articles) ? data.articles : [];
    if (articles.length === 0) return NextResponse.json({ ok: true, action: 'none', reason: 'no_articles' });

    // skip any headline we've already posted (dedupe by storing url in BotReplyLog.originalPostId)
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
    // mark this url as used so we don't repeat it
    await prisma.botReplyLog.create({ data: { originalPostId: `news:${chosen.url}`, botUserId: bot.id, replyText: text } });

    console.log('[news] posted', post.id);
    return NextResponse.json({ ok: true, action: 'posted', postId: post.id, source: chosen.url });
  } catch (err) {
    console.error('[news] error', err);
    return NextResponse.json({ error: 'news_failed' }, { status: 500 });
  }
}
