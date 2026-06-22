import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const me = await getCurrentUser();
    if (!me) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const { postId } = await req.json();
    if (!postId) return NextResponse.json({ error: 'no_post' }, { status: 400 });

    const existing = await prisma.like.findUnique({
      where: { postId_userId: { postId, userId: me.id } },
    });

    let liked: boolean;
    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      liked = false;
    } else {
      await prisma.like.create({ data: { postId, userId: me.id } });
      liked = true;
    }
    const likeCount = await prisma.like.count({ where: { postId } });
    return NextResponse.json({ ok: true, liked, likeCount });
  } catch (err) {
    console.error('[like] error', err);
    return NextResponse.json({ error: 'like_failed' }, { status: 500 });
  }
}
