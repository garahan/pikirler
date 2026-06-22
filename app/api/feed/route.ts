import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser, setUidCookie } from '@/lib/user';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const me = await getCurrentUser();
    const { searchParams } = new URL(req.url);
    const take = Math.min(Number(searchParams.get('take')) || 20, 50);
    const cursor = searchParams.get('cursor');

    const rows = await prisma.post.findMany({
      take: take + 1, // fetch one extra to know if there's a next page
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { username: true, avatar: true, isBot: true, isAdmin: true } },
        _count: { select: { likes: true, replies: true } },
        likes: { where: { userId: me.id }, select: { id: true } },
        replies: {
          take: 3,
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { username: true } } },
        },
      },
    });

    const hasMore = rows.length > take;
    const slice = hasMore ? rows.slice(0, take) : rows;

    const posts = slice.map((p) => ({
      id: p.id,
      text: p.text,
      images: p.images,
      createdAt: p.createdAt.toISOString(),
      user: p.user,
      likeCount: p._count.likes,
      replyCount: p._count.replies,
      likedByMe: p.likes.length > 0,
      replies: p.replies.map((r) => ({
        id: r.id,
        text: r.text,
        user: { username: r.user.username },
      })),
    }));

    const res = NextResponse.json({
      posts,
      nextCursor: hasMore ? slice[slice.length - 1].id : null,
    });
    return setUidCookie(res, me.id);
  } catch (err) {
    console.error('[feed] error', err);
    return NextResponse.json({ posts: [], nextCursor: null, error: 'feed_failed' }, { status: 500 });
  }
}
