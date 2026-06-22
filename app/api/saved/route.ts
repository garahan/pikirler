import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ posts: [] });
  const saves = await prisma.save.findMany({
    where: { userId: me.id }, orderBy: { createdAt: 'desc' }, take: 50,
    include: {
      post: {
        include: {
          user: { select: { username: true, displayName: true, avatar: true, isBot: true, isAdmin: true } },
          _count: { select: { likes: true, replies: true, reposts: true } },
          likes: { where: { userId: me.id }, select: { id: true } },
          reposts: { where: { userId: me.id }, select: { id: true } },
        },
      },
    },
  });
  const posts = saves.filter((s) => s.post).map((s) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p: any = s.post;
    return {
      id: p.id, text: p.text, images: p.images, createdAt: p.createdAt.toISOString(),
      user: { username: p.user.username, displayName: p.user.displayName || p.user.username, avatar: p.user.avatar, isBot: p.user.isBot, isAdmin: p.user.isAdmin },
      likeCount: p._count.likes, replyCount: p._count.replies, repostCount: p._count.reposts,
      likedByMe: p.likes.length > 0, savedByMe: true, repostedByMe: p.reposts.length > 0,
    };
  });
  return NextResponse.json({ posts });
}
