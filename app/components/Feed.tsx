'use client';

import { useState } from 'react';
import PostCard from './PostCard';

type Post = {
  id: string;
  text: string;
  images: string[];
  createdAt: Date;
  user: { username: string; avatar: string | null; isBot?: boolean };
  replies: { id: string; text: string; user: { username: string } }[];
  likes: { id: string }[];
};

export default function Feed({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState(initialPosts);

  const handleLike = (postId: string) => {
    // Optimistic update handled inside PostCard
    // We just re-render locally
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              likes: p.likes.length
                ? p.likes.filter((l) => l.id !== 'temp')
                : [{ id: 'temp' }],
            }
          : p
      )
    );
  };

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 text-textSecondary">
        <p className="text-4xl mb-4">🧠</p>
        <p>Pikirler heniz ýok...</p>
        <p className="text-sm">Ilkinji pikir ýazyň!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} onLike={handleLike} />
      ))}
    </div>
  );
}
