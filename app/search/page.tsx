'use client';
import { useEffect, useState } from 'react';
import AppShell, { useShell } from '../components/AppShell';
import PostList from '../components/PostList';
import UserRow from '../components/UserRow';
import { Search as SearchIcon } from '../components/icons';
import type { Post } from '../components/PostCard';
import type { RowUser } from '../components/UserRow';

function SearchInner() {
  const { user } = useShell();
  const [q, setQ] = useState('');
  const [users, setUsers] = useState<RowUser[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!q.trim()) { setUsers([]); setPosts([]); return; }
      setLoading(true);
      try {
        const r = await fetch(`/api/content?action=search&q=${encodeURIComponent(q)}`);
        const d = await r.json();
        setUsers(d.users ?? []); setPosts(d.posts ?? []);
      } finally { setLoading(false); }
    }, 280);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <>
      <div className="sticky top-0 z-30 border-b border-edge bg-midnight/80 p-3 backdrop-blur-md">
        <div className="flex items-center gap-2 rounded-full border border-edge bg-card px-4 py-2.5 focus-within:border-glow/50">
          <SearchIcon size={18} />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Pikir ýa-da adam gözle…" className="w-full bg-transparent text-ink outline-none placeholder:text-muted" />
        </div>
      </div>
      {loading && <p className="py-6 text-center text-sm text-muted"><span className="animate-radar inline-block">⚡</span></p>}
      {users.length > 0 && <div className="border-b border-edge"><p className="px-4 pt-3 text-xs font-semibold uppercase tracking-wide text-muted">Adamlar</p>{users.map((u) => <UserRow key={u.username} user={u} />)}</div>}
      {posts.length > 0 && <PostList posts={posts} authed={!!user} me={user ? { username: user.username, isAdmin: user.isAdmin } : null} />}
      {!loading && q.trim() && users.length === 0 && posts.length === 0 && (
        <div className="py-20 text-center"><p className="text-4xl">🔎</p><p className="mt-3 text-muted">Hiç zat tapylmady.</p></div>
      )}
      {!q.trim() && <div className="py-20 text-center"><p className="text-4xl">🔮</p><p className="mt-3 text-muted">Bir zat ýaz we gözle.</p></div>}
    </>
  );
}
export default function SearchPage() { return <AppShell><SearchInner /></AppShell>; }
