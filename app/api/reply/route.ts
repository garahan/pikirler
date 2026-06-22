import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { postId, text } = await req.json();

    if (!postId || !text || text.trim().length === 0) {
      return NextResponse.json({ error: 'Post ID and text required' }, { status: 400 });
    }

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

    const reply = await prisma.reply.create({
      data: {
        text: text.trim(),
        postId,
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true, reply });
  } catch (error) {
    console.error('Reply error:', error);
    return NextResponse.json({ error: 'Failed to create reply' }, { status: 500 });
  }
}
