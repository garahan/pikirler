import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: { username: string } }) {
  const me = await getCurrentUser();
  const username = params.username.toLowerCase();

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      _count: { select: { posts: true, followers: true, following: true } },
    },
  });
  if (!user) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const isFollowing = me
    ? !!(await prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: me.id, followingId: user.id } },
      }))
    : false;

  const posts = await prisma.post.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 30,
    include: {
      user: { select: { username: true, displayName: true, avatar: true, isBot: true, isAdmin: true } },
      _count: { select: { likes: true, replies: true } },
      likes: me ? { where: { userId: me.id }, select: { id: true } } : false,
      saves: me ? { where: { userId: me.id }, select: { id: true } } : false,
      reposts: me ? { where: { userId: me.id }, select: { id: true } } : false,
    },
  });

  return NextResponse.json({
    user: {
      username: user.username,
      displayName: user.displayName || user.username,
      avatar: user.avatar,
      bio: user.bio,
      location: user.location,
      website: user.website,
      isBot: user.isBot,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt.toISOString(),
      postCount: user._count.posts,
      followerCount: user._count.followers,
      followingCount: user._count.following,
      isMe: me?.id === user.id,
      isFollowing,
    },
    posts: posts.map((p) => shapePost(p)),
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function shapePost(p: any) {
  return {
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
    likedByMe: Array.isArray(p.likes) ? p.likes.length > 0 : false,
    savedByMe: Array.isArray(p.saves) ? p.saves.length > 0 : false,
    repostedByMe: Array.isArray(p.reposts) ? p.reposts.length > 0 : false,
  };
}
