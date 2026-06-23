import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const [likes, replies, follows] = await Promise.all([
    prisma.like.findMany({
      where: { post: { userId: me.id }, NOT: { userId: me.id } },
      orderBy: { id: 'desc' }, take: 20,
      include: { user: { select: { username: true, displayName: true, avatar: true } }, post: { select: { id: true, text: true } } },
    }),
    prisma.reply.findMany({
      where: { post: { userId: me.id }, NOT: { userId: me.id } },
      orderBy: { createdAt: 'desc' }, take: 20,
      include: { user: { select: { username: true, displayName: true, avatar: true } }, post: { select: { id: true, text: true } } },
    }),
    prisma.follow.findMany({
      where: { followingId: me.id }, orderBy: { createdAt: 'desc' }, take: 20,
      include: { follower: { select: { username: true, displayName: true, avatar: true } } },
    }),
  ]);

  const items = [
    ...likes.map((l) => ({ type: 'like' as const, user: shape(l.user), postText: l.post.text, at: '' })),
    ...replies.map((r) => ({ type: 'reply' as const, user: shape(r.user), postText: r.post.text, text: r.text, at: r.createdAt.toISOString() })),
    ...follows.map((f) => ({ type: 'follow' as const, user: shape(f.follower), at: f.createdAt.toISOString() })),
  ];
  return NextResponse.json({ items });
}

function shape(u: { username: string; displayName: string | null; avatar: string | null }) {
  return { username: u.username, displayName: u.displayName || u.username, avatar: u.avatar };
}
