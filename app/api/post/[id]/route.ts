import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const post = await prisma.post.findUnique({ where: { id: params.id }, select: { userId: true } });
  if (!post) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  if (post.userId !== me.id && !me.isAdmin) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  try {
    await prisma.post.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[delete post]', e);
    return NextResponse.json({ error: 'delete_failed' }, { status: 500 });
  }
}
