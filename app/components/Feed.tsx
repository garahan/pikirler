'use client'

import PostCard from './PostCard'

interface Post {
  id: string
  content: string
  likes: number
  createdAt: string
}

interface FeedProps {
  posts: Post[]
}

export default function Feed({ posts }: FeedProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12 text-text-muted">
        <p>No posts yet. Be the first to share your thoughts!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}