import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const me = await getCurrentUser();
    const { searchParams } = new URL(req.url);
    const take = Math.min(Number(searchParams.get('take')) || 20, 50);
    const cursor = searchParams.get('cursor');

    const rows = await prisma.post.findMany({
      take: take + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { username: true, displayName: true, avatar: true, isBot: true, isAdmin: true } },
        _count: { select: { likes: true, replies: true, reposts: true } },
        likes: me ? { where: { userId: me.id }, select: { id: true } } : false,
        saves: me ? { where: { userId: me.id }, select: { id: true } } : false,
        reposts: me ? { where: { userId: me.id }, select: { id: true } } : false,
        replies: {
          take: 3, orderBy: { createdAt: 'desc' },
          include: { user: { select: { username: true, displayName: true } } },
        },
      },
    });

    const hasMore = rows.length > take;
    const slice = hasMore ? rows.slice(0, take) : rows;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const posts = slice.map((p: any) => ({
      id: p.id,
      text: p.text,
      images: p.images,
      createdAt: p.createdAt.toISOString(),
      user: {
        username: p.user.username,
        displayName: p.user.displayName || p.user.username,
        avatar: p.user.avatar,
        isBot: p.user.isBot,
        isAdmin: p.user.isAdmin,
      },
      likeCount: p._count.likes,
      replyCount: p._count.replies,
      repostCount: p._count.reposts,
      likedByMe: Array.isArray(p.likes) && p.likes.length > 0,
      savedByMe: Array.isArray(p.saves) && p.saves.length > 0,
      repostedByMe: Array.isArray(p.reposts) && p.reposts.length > 0,
      replies: p.replies.map((r: { id: string; text: string; user: { username: string; displayName: string | null } }) => ({
        id: r.id, text: r.text,
        user: { username: r.user.username, displayName: r.user.displayName || r.user.username },
      })),
    }));

    return NextResponse.json({ posts, nextCursor: hasMore ? slice[slice.length - 1].id : null });
  } catch (err) {
    console.error('[feed] error', err);
    return NextResponse.json({ posts: [], nextCursor: null, error: 'feed_failed' }, { status: 500 });
  }
}
