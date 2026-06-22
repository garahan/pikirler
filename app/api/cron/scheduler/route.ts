import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Verify Vercel cron secret
const CRON_SECRET = process.env.CRON_SECRET

export async function GET(request: NextRequest) {
  if (request.headers.get('authorization') !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Find scheduled posts that should be published
    const postsToPublish = await prisma.post.findMany({
      where: {
        isPublished: false,
        scheduledFor: {
          lte: new Date(),
        },
      },
    })

    // Update them to published
    for (const post of postsToPublish) {
      await prisma.post.update({
        where: { id: post.id },
        data: { isPublished: true },
      })
    }

    return NextResponse.json(
      { published: postsToPublish.length },
      { status: 200 }
    )
  } catch (error) {
    console.error('Scheduler error:', error)
    return NextResponse.json(
      { error: 'Scheduler failed' },
      { status: 500 }
    )
  }
}