'use client';
import { useEffect, useState } from 'react';
import AppShell, { useShell } from '../components/AppShell';
import PageHeader from '../components/PageHeader';
import PostList from '../components/PostList';
import type { Post } from '../components/PostCard';

function SavedInner() {
  const { user } = useShell();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    fetch('/api/saved').then((r) => r.json()).then((d) => setPosts(d.posts ?? [])).finally(() => setLoaded(true));
  }, []);
  return (
    <>
      {loaded && posts.length === 0 && <div className="py-20 text-center"><p className="text-4xl">📌</p><p className="mt-3 font-semibold text-ink">Saklanan pikir ýok</p><p className="mt-1 text-sm text-muted">Halan pikirleriňi sakla.</p></div>}
      <PostList posts={posts} authed={!!user} me={user ? { username: user.username, isAdmin: user.isAdmin } : null} />
    </>
  );
}
export default function SavedPage() { return <AppShell header={<PageHeader title="Saklananlar" />}><SavedInner /></AppShell>; }
