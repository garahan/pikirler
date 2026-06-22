import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { gemini } from '@/lib/gemini'

const CRON_SECRET = process.env.CRON_SECRET

export async function GET(request: NextRequest) {
  if (request.headers.get('authorization') !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get recent posts
    const recentPosts = await prisma.post.findMany({
      where: {
        isPublished: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    })

    // Generate AI responses for posts
    const responses = []
    for (const post of recentPosts) {
      try {
        const aiResponse = await gemini.generateResponse(post.content)
        responses.push({
          postId: post.id,
          response: aiResponse,
        })
      } catch (error) {
        console.error('Failed to generate response for post:', post.id, error)
      }
    }

    return NextResponse.json(
      { processed: responses.length, responses },
      { status: 200 }
    )
  } catch (error) {
    console.error('Gemini bot error:', error)
    return NextResponse.json(
      { error: 'Gemini bot failed' },
      { status: 500 }
    )
  }
}