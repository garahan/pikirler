import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/** "HH:MM" -> minutes since midnight, or null. */
function toMin(hhmm?: string | null): number | null {
  if (!hhmm) return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

/** Now in a given UTC offset (default +5 = Turkmenistan), minutes since midnight. */
function nowMinutes(offsetHours: number): number {
  const utc = Date.now() + new Date().getTimezoneOffset() * 60000;
  const local = new Date(utc + offsetHours * 3600000);
  return local.getHours() * 60 + local.getMinutes();
}

function withinWindow(now: number, from: number | null, to: number | null): boolean {
  if (from == null || to == null) return true; // no window set = always active
  if (from <= to) return now >= from && now <= to; // same-day window
  return now >= from || now <= to; // overnight window (e.g. 22:00–02:00)
}

export async function GET(req: NextRequest) {
  // protect: cron-job.org calls .../scheduler?key=YOUR_CRON_SECRET
  const key = new URL(req.url).searchParams.get('key');
  if (process.env.CRON_SECRET && key !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const pending = await prisma.scheduledPost.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
    });

    if (pending.length === 0) {
      console.log('[scheduler] no pending posts');
      return NextResponse.json({ ok: true, action: 'none', reason: 'queue_empty' });
    }

    const cfg = pending[0];
    const tz = Number(process.env.SCHEDULER_TZ_OFFSET ?? 5);
    const now = nowMinutes(tz);

    if (!withinWindow(now, toMin(cfg.activeFrom), toMin(cfg.activeTo))) {
      console.log('[scheduler] outside active hours', cfg.activeFrom, '-', cfg.activeTo);
      return NextResponse.json({ ok: true, action: 'none', reason: 'inactive_hours' });
    }

    // interval gate — based on the most recent publish
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
      if (elapsedMin < need) {
        console.log(`[scheduler] too soon: ${elapsedMin.toFixed(1)}m < ${need.toFixed(1)}m`);
        return NextResponse.json({ ok: true, action: 'none', reason: 'interval_not_elapsed' });
      }
    }

    // pick a random pending post and publish it as the admin bot
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
