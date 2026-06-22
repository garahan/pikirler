import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { redis } from '@/lib/redis';

export async function POST(req: NextRequest) {
  try {
    const { text, images } = await req.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    if (text.length > 500) {
      return NextResponse.json({ error: 'Max 500 characters' }, { status: 400 });
    }

    // Find or create a demo user
    let user = await prisma.user.findUnique({
      where: { username: 'demo_user' },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          username: 'demo_user',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
        },
      });
    }

    const post = await prisma.post.create({
      data: {
        text: text.trim(),
        images: images || [],
        userId: user.id,
      },
    });

    await redis.lpush('global_feed', post.id);
    await redis.ltrim('global_feed', 0, 999);

    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
