import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAdminAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const isAuthenticated = await verifyAdminAuth(request)
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { posts } = await request.json()

    if (!Array.isArray(posts)) {
      return NextResponse.json(
        { error: 'Posts must be an array' },
        { status: 400 }
      )
    }

    // Bulk create posts
    const created = await prisma.post.createMany({
      data: posts.map((post: any) => ({
        content: post.content,
        scheduledFor: post.scheduledFor ? new Date(post.scheduledFor) : new Date(),
        isPublished: post.isPublished ?? true,
      })),
    })

    return NextResponse.json(
      { created: created.count },
      { status: 201 }
    )
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload posts' },
      { status: 500 }
    )
  }
}