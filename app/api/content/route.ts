import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function shapePost(p: any, meId?: string) {
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
    likeCount: p._count?.likes ?? 0,
    replyCount: p._count?.replies ?? 0,
    repostCount: p._count?.reposts ?? 0,
    likedByMe: Array.isArray(p.likes) && p.likes.length > 0,
    savedByMe: Array.isArray(p.saves) && p.saves.length > 0,
    repostedByMe: Array.isArray(p.reposts) && p.reposts.length > 0,
    replies: Array.isArray(p.replies)
      ? p.replies.map((r: { id: string; text: string; user: { username: string; displayName: string | null } }) => ({
          id: r.id,
          text: r.text,
          user: { username: r.user.username, displayName: r.user.displayName || r.user.username },
        }))
      : undefined,
  };
}

// GET /api/content?action=feed|saved|search
export async function GET(req: NextRequest) {
  const me = await getCurrentUser();
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') ?? 'feed';

  // --- FEED ---
  if (action === 'feed') {
    try {
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
            take: 3,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { username: true, displayName: true } } },
          },
        },
      });
      const hasMore = rows.length > take;
      const slice = hasMore ? rows.slice(0, take) : rows;
      return NextResponse.json({
        posts: slice.map((p) => shapePost(p, me?.id)),
        nextCursor: hasMore ? slice[slice.length - 1].id : null,
      });
    } catch (err) {
      console.error('[feed] error', err);
      return NextResponse.json({ posts: [], nextCursor: null, error: 'feed_failed' }, { status: 500 });
    }
  }

  // --- SAVED ---
  if (action === 'saved') {
    if (!me) return NextResponse.json({ posts: [] });
    const saves = await prisma.save.findMany({
      where: { userId: me.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
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
    const posts = saves
      .filter((s) => s.post)
      .map((s) => ({ ...shapePost(s.post, me.id), savedByMe: true }));
    return NextResponse.json({ posts });
  }

  // --- SEARCH ---
  if (action === 'search') {
    const q = (searchParams.get('q') || '').trim();
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
      posts: posts.map((p) => shapePost(p, me?.id)),
    });
  }

  return NextResponse.json({ error: 'unknown_action' }, { status: 400 });
}

// POST /api/content  (create post)
export async function POST(req: NextRequest) {
  try {
    const me = await getCurrentUser();
    if (!me) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    const { text, images } = await req.json();
    const clean = String(text ?? '').trim();
    if (!clean) return NextResponse.json({ error: 'empty' }, { status: 400 });
    if (clean.length > 500) return NextResponse.json({ error: 'too_long' }, { status: 400 });
    const imgs = Array.isArray(images) ? images.filter((x) => typeof x === 'string').slice(0, 4) : [];
    const post = await prisma.post.create({ data: { text: clean, images: imgs, userId: me.id } });
    return NextResponse.json({ ok: true, post }, { status: 201 });
  } catch (err) {
    console.error('[post] error', err);
    return NextResponse.json({ error: 'create_failed' }, { status: 500 });
  }
}

// DELETE /api/content?id=<postId>
export async function DELETE(req: NextRequest) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'no_id' }, { status: 400 });
  const post = await prisma.post.findUnique({ where: { id }, select: { userId: true } });
  if (!post) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  if (post.userId !== me.id && !me.isAdmin) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  try {
    await prisma.post.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[delete post]', e);
    return NextResponse.json({ error: 'delete_failed' }, { status: 500 });
  }
}
