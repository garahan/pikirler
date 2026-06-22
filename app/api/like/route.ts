import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { postId } = await request.json()

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      )
    }

    // Check if like already exists
    const existingLike = await prisma.like.findFirst({
      where: { postId },
    })

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: { id: existingLike.id },
      })

      const post = await prisma.post.update({
        where: { id: postId },
        data: { likes: { decrement: 1 } },
      })

      return NextResponse.json({ liked: false, post })
    } else {
      // Like
      await prisma.like.create({
        data: { postId },
      })

      const post = await prisma.post.update({
        where: { id: postId },
        data: { likes: { increment: 1 } },
      })

      return NextResponse.json({ liked: true, post })
    }
  } catch (error) {
    console.error('Like error:', error)
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    )
  }
}