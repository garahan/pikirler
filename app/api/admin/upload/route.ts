import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { posts, activeFrom, activeTo, intervalMin, intervalMax } = await req.json();

    if (!posts || !Array.isArray(posts) || posts.length === 0) {
      return NextResponse.json({ error: 'Invalid posts array' }, { status: 400 });
    }

    for (const p of posts) {
      if (!p.text || p.text.trim().length === 0) {
        return NextResponse.json(
          { error: 'Each post must have text' },
          { status: 400 }
        );
      }
    }

    const created = [];
    for (const p of posts) {
      const scheduled = await prisma.scheduledPost.create({
        data: {
          text: p.text.trim(),
          images: p.images || [],
          activeFrom: activeFrom || '08:00',
          activeTo: activeTo || '23:00',
          intervalMin: parseInt(intervalMin) || 5,
          intervalMax: parseInt(intervalMax) || 20,
          status: 'PENDING',
        },
      });
      created.push(scheduled);
    }

    return NextResponse.json({
      success: true,
      count: created.length,
      message: `${created.length} posts scheduled!`,
    });
  } catch (error) {
    console.error('Admin upload error:', error);
    return NextResponse.json({ error: 'Failed to schedule posts' }, { status: 500 });
  }
}
