'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import AppShell, { useShell } from '../../components/AppShell';
import PostList from '../../components/PostList';
import EditProfile from '../../components/EditProfile';
import type { Post } from '../../components/PostCard';

type Profile = {
  username: string; displayName: string; avatar: string | null; bio: string | null;
  location: string | null; website: string | null; isBot: boolean; isAdmin: boolean;
  createdAt: string; postCount: number; followerCount: number; followingCount: number;
  isMe: boolean; isFollowing: boolean;
};
const fb = (s: string) => `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(s)}`;

function ProfileInner() {
  const { user: me, reloadUser } = useShell();
  const router = useRouter();
  const username = (useParams().username as string)?.toLowerCase();
  const [p, setP] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [following, setFollowing] = useState(false);
  const [followers, setFollowers] = useState(0);

  const load = useCallback(() => {
    fetch(`/api/profile/${username}`).then((r) => r.json()).then((d) => {
      if (d.user) { setP(d.user); setPosts(d.posts ?? []); setFollowing(d.user.isFollowing); setFollowers(d.user.followerCount); }
    }).finally(() => setLoaded(true));
  }, [username]);
  useEffect(load, [load]);

  const toggleFollow = async () => {
    if (!me) { router.push('/login'); return; }
    const next = !following;
    setFollowing(next); setFollowers((c) => c + (next ? 1 : -1));
    try { await fetch('/api/follow', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username }) }); }
    catch { setFollowing(!next); setFollowers((c) => c + (next ? -1 : 1)); }
  };

  if (loaded && !p) return <div className="py-20 text-center"><p className="text-4xl">👻</p><p className="mt-3 text-muted">Beýle ulanyjy ýok.</p></div>;
  if (!p) return <div className="py-20 text-center text-muted"><span className="animate-radar inline-block">⚡</span></div>;

  const joined = new Date(p.createdAt).toLocaleDateString('tk', { year: 'numeric', month: 'long' });

  return (
    <>
      <header className="sticky top-0 z-30 flex h-[52px] items-center gap-3 border-b border-edge bg-midnight/80 px-4 backdrop-blur-md">
        <button onClick={() => router.back()} className="press text-ink">←</button>
        <span className="font-semibold text-ink">{p.displayName}</span>
      </header>

      {/* banner gradient */}
      <div className="h-24 bg-gradient-to-r from-glow/25 via-accent/25 to-rose/25" />

      <div className="px-4 pb-4">
        <div className="-mt-10 flex items-end justify-between">
          <span className="ring-grad"><Image src={p.avatar || fb(p.username)} alt="" width={84} height={84} className="h-[84px] w-[84px] rounded-full bg-midnight" unoptimized /></span>
          {p.isMe ? (
            <button onClick={() => setEditing(true)} className="press rounded-full border border-edge px-4 py-2 text-sm font-semibold text-ink hover:bg-white/5">Düzet</button>
          ) : (
            <button onClick={toggleFollow} className={`press rounded-full px-5 py-2 text-sm font-semibold ${following ? 'border border-edge text-ink hover:bg-white/5' : 'btn-grad shadow-glowSoft'}`}>{following ? 'Yzarlanýar' : 'Yzarla'}</button>
          )}
        </div>

        <div className="mt-3">
          <div className="flex items-center gap-1.5">
            <h1 className="text-xl font-bold text-ink">{p.displayName}</h1>
            {p.isAdmin && <span className="rounded-full bg-glow/15 px-1.5 py-0.5 text-[10px] font-bold text-glow">admin</span>}
            {p.isBot && !p.isAdmin && <span className="rounded-full bg-white/5 px-1.5 py-0.5 text-[10px] text-muted">bot</span>}
          </div>
          <p className="text-sm text-muted">@{p.username}</p>
          {p.bio && <p className="mt-2 whitespace-pre-wrap text-[15px] text-ink">{p.bio}</p>}

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
            {p.location && <span>📍 {p.location}</span>}
            {p.website && <a href={p.website} target="_blank" rel="noreferrer" className="text-glow hover:underline">🔗 {p.website.replace(/^https?:\/\//, '')}</a>}
            <span>🗓️ {joined}-dan bäri</span>
          </div>

          <div className="mt-3 flex gap-4 text-sm">
            <span className="text-ink"><b>{p.postCount}</b> <span className="text-muted">pikir</span></span>
            <span className="text-ink"><b>{followers}</b> <span className="text-muted">yzarlaýjy</span></span>
            <span className="text-ink"><b>{p.followingCount}</b> <span className="text-muted">yzarlaýan</span></span>
          </div>
        </div>
      </div>

      <div className="border-y border-edge px-4 py-2.5 text-center text-sm font-semibold text-ink">Pikirler</div>

      {posts.length === 0 ? (
        <div className="py-16 text-center"><p className="text-3xl">💭</p><p className="mt-2 text-muted">Heniz pikir ýok.</p></div>
      ) : (
        <PostList posts={posts} authed={!!me} me={me ? { username: me.username, isAdmin: me.isAdmin } : null} />
      )}

      {editing && p.isMe && (
        <EditProfile
          initial={{ username: p.username, displayName: p.displayName, bio: p.bio ?? '', location: p.location ?? '', website: p.website ?? '', avatar: p.avatar || fb(p.username) }}
          onClose={() => setEditing(false)}
          onSaved={() => { reloadUser(); load(); }}
        />
      )}
    </>
  );
}
export default function UserPage() { return <AppShell><ProfileInner /></AppShell>; }
