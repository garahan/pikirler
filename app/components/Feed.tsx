'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PostCard, { type Post } from './PostCard';
import TrendingTopics, { type Topic } from './TrendingTopics';

const PAGE = 20;

function Skeleton() {
  return (
    <div className="rounded-2xl border border-edge bg-card/60 px-4 py-3.5">
      <div className="flex items-center gap-3">
        <div className="skeleton h-10 w-10 rounded-full" />
        <div className="skeleton h-3.5 w-28 rounded-full" />
      </div>
      <div className="skeleton mt-3 h-3 w-full rounded-full" />
      <div className="skeleton mt-2 h-3 w-3/4 rounded-full" />
    </div>
  );
}

export default function Feed({ refreshSignal = 0 }: { refreshSignal?: number }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const sentinel = useRef<HTMLDivElement>(null);
  const pullStart = useRef(0);
  const [pull, setPull] = useState(0);

  const load = useCallback(
    async (reset = false) => {
      if (loading && !reset) return;
      setLoading(true);
      try {
        const params = new URLSearchParams({ take: String(PAGE) });
        if (!reset && cursor) params.set('cursor', cursor);
        const res = await fetch(`/api/feed?${params}`);
        const data: { posts: Post[]; nextCursor: string | null } = await res.json();
        const incoming = data.posts ?? [];
        setPosts((prev) => (reset ? incoming : [...prev, ...incoming]));
        setCursor(data.nextCursor);
        if (!data.nextCursor || incoming.length < PAGE) setDone(true);
      } catch {
        if (reset) setPosts([]);
      } finally {
        setLoading(false);
      }
    },
    [cursor, loading]
  );

  // initial + external refresh
  useEffect(() => {
    setDone(false);
    setCursor(null);
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshSignal]);

  // infinite scroll
  useEffect(() => {
    const el = sentinel.current;
    if (!el || done) return;
    const io = new IntersectionObserver(
      (entries) => entries[0].isIntersecting && !loading && load(),
      { rootMargin: '600px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [load, loading, done]);

  // pull-to-refresh (touch)
  const onTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) pullStart.current = e.touches[0].clientY;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!pullStart.current) return;
    const d = e.touches[0].clientY - pullStart.current;
    if (d > 0 && window.scrollY === 0) setPull(Math.min(d * 0.5, 80));
  };
  const onTouchEnd = async () => {
    if (pull > 56) {
      setRefreshing(true);
      setDone(false);
      setCursor(null);
      await load(true);
      setRefreshing(false);
    }
    setPull(0);
    pullStart.current = 0;
  };

  // trending from loaded posts (top 10 hashtags)
  const topics: Topic[] = useMemo(() => {
    const counts = new Map<string, number>();
    posts.forEach((p) =>
      (p.text.match(/#([\p{L}\p{N}_]+)/gu) ?? []).forEach((h) => {
        const tag = h.slice(1);
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      })
    );
    return [...counts.entries()]
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [posts]);

  const visible = active
    ? posts.filter((p) => p.text.toLowerCase().includes(`#${active.toLowerCase()}`))
    : posts;

  return (
    <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      {/* pull-to-refresh indicator */}
      {(pull > 0 || refreshing) && (
        <div
          className="flex items-center justify-center text-glow"
          style={{ height: refreshing ? 44 : pull }}
        >
          <span className={refreshing || pull > 56 ? 'animate-radar' : ''}>📡</span>
        </div>
      )}

      <TrendingTopics topics={topics} active={active} onSelect={setActive} />

      <div className="mt-3 space-y-3">
        {visible.map((p, i) => (
          <PostCard key={p.id} post={p} index={i} />
        ))}

        {loading && posts.length === 0 && (
          <>
            <Skeleton />
            <Skeleton />
            <Skeleton />
          </>
        )}

        {!loading && visible.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-4xl">💭</p>
            <p className="mt-3 font-semibold text-ink">
              {active ? `#${active} barada heniz pikir ýok` : 'Heniz pikir ýok'}
            </p>
            <p className="mt-1 text-sm text-muted">Ilkinji bolup pikiriňi paýlaş.</p>
          </div>
        )}

        <div ref={sentinel} className="h-px" />

        {loading && posts.length > 0 && !done && (
          <div className="py-4 text-center text-sm text-muted">
            <span className="animate-radar inline-block">⚡</span>
          </div>
        )}

        {done && visible.length > 0 && (
          <p className="py-6 text-center text-xs text-muted">Hemmesini gördüň ✦</p>
        )}
      </div>
    </div>
  );
}
