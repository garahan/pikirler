import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
