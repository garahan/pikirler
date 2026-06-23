import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser, publicUser } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

// GET /api/profile?username=<username>  — public profile
export async function GET(req: NextRequest) {
  const me = await getCurrentUser();
  const username = (new URL(req.url).searchParams.get('username') || '').toLowerCase();
  if (!username) return NextResponse.json({ error: 'no_username' }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { username },
    include: { _count: { select: { posts: true, followers: true, following: true } } },
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

// PATCH /api/profile  — update own profile
export async function PATCH(req: NextRequest) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json();
  const data: Record<string, string | null> = {};
  if (typeof body.displayName === 'string') data.displayName = body.displayName.trim().slice(0, 40) || me.username;
  if (typeof body.bio === 'string') data.bio = body.bio.trim().slice(0, 160) || null;
  if (typeof body.location === 'string') data.location = body.location.trim().slice(0, 60) || null;
  if (typeof body.website === 'string') data.website = body.website.trim().slice(0, 100) || null;
  if (typeof body.avatar === 'string' && body.avatar.startsWith('http')) data.avatar = body.avatar;

  try {
    const updated = await prisma.user.update({ where: { id: me.id }, data });
    return NextResponse.json({ ok: true, user: publicUser(updated) });
  } catch (e) {
    console.error('[profile patch]', e);
    return NextResponse.json({ error: 'update_failed' }, { status: 500 });
  }
}
