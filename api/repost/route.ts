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
    const { active, count } = await toggle('repost', postId, me.id);
    return NextResponse.json({ ok: true, reposted: active, count });
  } catch (e) {
    console.error('[repost]', e);
    return NextResponse.json({ error: 'repost_failed' }, { status: 500 });
  }
}
