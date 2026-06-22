'use client'

import { useState } from 'react'

interface Post {
  id: string
  content: string
  likes: number
  createdAt: string
}

interface PostCardProps {
  post: Post
}

export default function PostCard({ post }: PostCardProps) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post.likes)

  const handleLike = async () => {
    try {
      const response = await fetch('/api/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id }),
      })

      if (response.ok) {
        const data = await response.json()
        setLiked(data.liked)
        setLikeCount(data.post.likes)
      }
    } catch (error) {
      console.error('Failed to toggle like:', error)
    }
  }

  const date = new Date(post.createdAt)
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="bg-secondary border border-border rounded-lg p-4 hover:border-accent/50 transition-colors animate-slideUp">
      <div className="flex justify-between items-start mb-3">
        <span className="text-sm text-text-muted">{formattedDate}</span>
      </div>

      <p className="text-text mb-4 leading-relaxed">{post.content}</p>

      <div className="flex items-center gap-4 pt-3 border-t border-border">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 text-sm transition-colors ${
            liked ? 'text-red-500' : 'text-text-muted hover:text-accent'
          }`}
        >
          <span className="text-lg">{liked ? '❤️' : '🤍'}</span>
          <span>{likeCount}</span>
        </button>
      </div>
    </div>
  )
}