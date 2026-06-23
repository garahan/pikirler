import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/upload
 * Header: x-admin-secret: <ADMIN_SECRET>
 * Body:   { posts: [{ text: string, images?: string[] }], scheduled?: boolean }
 *
 * The secret is validated SERVER-SIDE only. Never expose ADMIN_SECRET to the
 * client (no NEXT_PUBLIC_*). The /admin page collects it into a header at
 * request time and never bundles it into the build.
 */
export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-admin-secret');
  if (!process.env.ADMIN_SECRET || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const items = Array.isArray(body?.posts) ? body.posts : [];
    const scheduled = !!body?.scheduled;

    const clean = items
      .map((p: { text?: unknown; images?: unknown }) => ({
        text: String(p?.text ?? '').trim(),
        images: Array.isArray(p?.images)
          ? p.images.filter((x: unknown) => typeof x === 'string').slice(0, 4)
          : [],
      }))
      .filter((p: { text: string }) => p.text.length > 0 && p.text.length <= 500);

    if (clean.length === 0) {
      return NextResponse.json({ error: 'no_valid_posts' }, { status: 400 });
    }

    if (scheduled) {
      const created = await prisma.scheduledPost.createMany({
        data: clean.map((p: { text: string; images: string[] }) => ({
          text: p.text,
          images: p.images,
          status: 'PENDING',
        })),
      });
      return NextResponse.json({ ok: true, mode: 'scheduled', count: created.count });
    }

    // publish immediately as the admin bot
    const admin = await prisma.user.upsert({
      where: { username: 'pikirler_admin' },
      update: {},
      create: {
        username: 'pikirler_admin',
        isBot: true,
        isAdmin: true,
        avatar: 'https://api.dicebear.com/7.x/thumbs/svg?seed=pikirler_admin',
      },
    });

    const created = await prisma.post.createMany({
      data: clean.map((p: { text: string; images: string[] }) => ({
        text: p.text,
        images: p.images,
        userId: admin.id,
      })),
    });

    return NextResponse.json({ ok: true, mode: 'published', count: created.count });
  } catch (err) {
    console.error('[admin/upload] error', err);
    return NextResponse.json({ error: 'upload_failed' }, { status: 500 });
  }
}
