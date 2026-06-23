import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateReply } from '@/lib/gemini';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const key = new URL(req.url).searchParams.get('key');
  if (process.env.CRON_SECRET && key !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    // a real (human) user's post with NO replies yet...
    const candidates = await prisma.post.findMany({
      where: { user: { isBot: false }, replies: { none: {} } },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, text: true },
    });
    if (candidates.length === 0) {
      console.log('[gemini-bot] no eligible posts');
      return NextResponse.json({ ok: true, action: 'none', reason: 'no_target' });
    }

    // ...and that a bot hasn't already replied to (belt-and-suspenders via the log)
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
