import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser, publicUser } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
