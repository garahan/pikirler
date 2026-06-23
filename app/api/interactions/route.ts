import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { toggle } from '@/lib/toggle';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST /api/interactions?action=like|follow|repost|save|reply
export async function POST(req: NextRequest) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const action = new URL(req.url).searchParams.get('action');

  // --- LIKE ---
  if (action === 'like') {
    try {
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

  // --- FOLLOW ---
  if (action === 'follow') {
    try {
      const { username } = await req.json();
      const target = await prisma.user.findUnique({ where: { username: String(username ?? '').toLowerCase() } });
      if (!target) return NextResponse.json({ error: 'no_user' }, { status: 404 });
      if (target.id === me.id) return NextResponse.json({ error: 'self' }, { status: 400 });
      const existing = await prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: me.id, followingId: target.id } },
      });
      let following: boolean;
      if (existing) {
        await prisma.follow.delete({ where: { id: existing.id } });
        following = false;
      } else {
        await prisma.follow.create({ data: { followerId: me.id, followingId: target.id } });
        following = true;
      }
      const followers = await prisma.follow.count({ where: { followingId: target.id } });
      return NextResponse.json({ ok: true, following, followers });
    } catch (e) {
      console.error('[follow]', e);
      return NextResponse.json({ error: 'follow_failed' }, { status: 500 });
    }
  }

  // --- REPOST ---
  if (action === 'repost') {
    try {
      const { postId } = await req.json();
      if (!postId) return NextResponse.json({ error: 'no_post' }, { status: 400 });
      const { active, count } = await toggle('repost', postId, me.id);
      return NextResponse.json({ ok: true, reposted: active, count });
    } catch (e) {
      console.error('[repost]', e);
      return NextResponse.json({ error: 'repost_failed' }, { status: 500 });
    }
  }

  // --- SAVE ---
  if (action === 'save') {
    try {
      const { postId } = await req.json();
      if (!postId) return NextResponse.json({ error: 'no_post' }, { status: 400 });
      const { active, count } = await toggle('save', postId, me.id);
      return NextResponse.json({ ok: true, saved: active, count });
    } catch (e) {
      console.error('[save]', e);
      return NextResponse.json({ error: 'save_failed' }, { status: 500 });
    }
  }

  // --- REPLY ---
  if (action === 'reply') {
    try {
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

  return NextResponse.json({ error: 'unknown_action' }, { status: 400 });
}
