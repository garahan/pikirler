'use client';
import PostCard, { type Post } from './PostCard';

export default function PostList({ posts, authed }: { posts: Post[]; authed: boolean }) {
  return (
    <div>
      {posts.map((p, i) => <PostCard key={p.id} post={p} index={i} authed={authed} />)}
    </div>
  );
}
