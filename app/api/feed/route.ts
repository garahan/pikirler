import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const posts = await prisma.post.findMany({
      where: {
        isPublished: true,
        scheduledFor: {
          lte: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    })

    return NextResponse.json(posts)
  } catch (error) {
    console.error('Feed error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feed' },
      { status: 500 }
    )
  }
}