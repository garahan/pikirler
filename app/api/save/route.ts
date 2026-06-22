import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { toggle } from '@/lib/toggle';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { postId } = await req.json();
  if (!postId) return NextResponse.json({ error: 'no_post' }, { status: 400 });
  try {
    const { active, count } = await toggle('save', postId, me.id);
    return NextResponse.json({ ok: true, saved: active, count });
  } catch (e) {
    console.error('[save]', e);
    return NextResponse.json({ error: 'save_failed' }, { status: 500 });
  }
}
