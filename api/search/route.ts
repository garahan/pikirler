import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const me = await getCurrentUser();
  const q = (new URL(req.url).searchParams.get('q') || '').trim();
  if (!q) return NextResponse.json({ posts: [], users: [] });

  const [users, posts] = await Promise.all([
    prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: q.toLowerCase(), mode: 'insensitive' } },
          { displayName: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 8,
      select: { username: true, displayName: true, avatar: true, bio: true, isBot: true, isAdmin: true },
    }),
    prisma.post.findMany({
      where: { text: { contains: q, mode: 'insensitive' } },
      orderBy: { createdAt: 'desc' },
      take: 25,
      include: {
        user: { select: { username: true, displayName: true, avatar: true, isBot: true, isAdmin: true } },
        _count: { select: { likes: true, replies: true } },
        likes: me ? { where: { userId: me.id }, select: { id: true } } : false,
        saves: me ? { where: { userId: me.id }, select: { id: true } } : false,
        reposts: me ? { where: { userId: me.id }, select: { id: true } } : false,
      },
    }),
  ]);

  return NextResponse.json({
    users: users.map((u) => ({ ...u, displayName: u.displayName || u.username })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    posts: posts.map((p: any) => ({
      id: p.id, text: p.text, images: p.images, createdAt: p.createdAt.toISOString(),
      user: { username: p.user.username, displayName: p.user.displayName || p.user.username, avatar: p.user.avatar, isBot: p.user.isBot, isAdmin: p.user.isAdmin },
      likeCount: p._count.likes, replyCount: p._count.replies,
      likedByMe: Array.isArray(p.likes) && p.likes.length > 0,
      savedByMe: Array.isArray(p.saves) && p.saves.length > 0,
      repostedByMe: Array.isArray(p.reposts) && p.reposts.length > 0,
    })),
  });
}
