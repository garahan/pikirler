'use client';
import PostCard, { type Post, type Me } from './PostCard';

export default function PostList({ posts, authed, me = null }: { posts: Post[]; authed: boolean; me?: Me }) {
  return <div>{posts.map((p, i) => <PostCard key={p.id} post={p} index={i} authed={authed} me={me} />)}</div>;
}
