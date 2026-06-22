import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const me = await getCurrentUser();
    if (!me) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const { postId, text } = await req.json();
    const clean = String(text ?? '').trim();
    if (!postId || !clean) return NextResponse.json({ error: 'bad_input' }, { status: 400 });
    if (clean.length > 150) return NextResponse.json({ error: 'too_long' }, { status: 400 });

    const reply = await prisma.reply.create({
      data: { text: clean, postId, userId: me.id },
      include: { user: { select: { username: true, displayName: true } } },
    });
    return NextResponse.json({ ok: true, reply }, { status: 201 });
  } catch (err) {
    console.error('[reply] error', err);
    return NextResponse.json({ error: 'reply_failed' }, { status: 500 });
  }
}
