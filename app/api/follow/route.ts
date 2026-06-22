import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { username } = await req.json();
  const target = await prisma.user.findUnique({ where: { username: String(username ?? '').toLowerCase() } });
  if (!target) return NextResponse.json({ error: 'no_user' }, { status: 404 });
  if (target.id === me.id) return NextResponse.json({ error: 'self' }, { status: 400 });

  try {
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
