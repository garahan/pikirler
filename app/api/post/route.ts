import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { content, scheduledFor } = await request.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    const post = await prisma.post.create({
      data: {
        content,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : new Date(),
      },
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error('Post creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}