'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';

export interface PostUser {
  username: string;
  avatar?: string | null;
  isBot?: boolean;
  isAdmin?: boolean;
}
export interface PostReply {
  id: string;
  text: string;
  user: PostUser;
}
export interface Post {
  id: string;
  text: string;
  images: string[];
  createdAt: string;
  user: PostUser;
  likeCount: number;
  replyCount: number;
  likedByMe?: boolean;
  replies?: PostReply[];
}

/** Light haptic — silently ignored where unsupported. */
function tap(ms = 12) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try { navigator.vibrate(ms); } catch {}
  }
}

/** Turkmen relative time: häzir / 5m / 2s / 3g */
function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 45) return 'häzir';
  if (diff < 3600) return `${Math.round(diff / 60)}m`;
  if (diff < 86400) return `${Math.round(diff / 3600)}s`;
  if (diff < 604800) return `${Math.round(diff / 86400)}g`;
  return new Date(iso).toLocaleDateString('tk');
}

const AVATAR_FALLBACK = (seed: string) =>
  `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(seed)}`;

export default function PostCard({ post, index = 0 }: { post: Post; index?: number }) {
  const [liked, setLiked] = useState(!!post.likedByMe);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [saved, setSaved] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [popKey, setPopKey] = useState(0);
  const [bursts, setBursts] = useState<{ id: number; bx: string; by: string }[]>([]);
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replies, setReplies] = useState<PostReply[]>(post.replies ?? []);
  const [replyCount, setReplyCount] = useState(post.replyCount);
  const inFlight = useRef(false);

  const fireBurst = useCallback(() => {
    const dots = Array.from({ length: 8 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 8 + Math.random() * 0.4;
      const dist = 18 + Math.random() * 14;
      return {
        id: Date.now() + i,
        bx: `${Math.cos(angle) * dist}px`,
        by: `${Math.sin(angle) * dist}px`,
      };
    });
    setBursts(dots);
    setTimeout(() => setBursts([]), 520);
  }, []);

  const toggleLike = async () => {
    const next = !liked;
    // optimistic — UI reacts before the network does
    setLiked(next);
    setLikeCount((c) => c + (next ? 1 : -1));
    setPopKey((k) => k + 1);
    if (next) { fireBurst(); tap(16); } else { tap(8); }

    if (inFlight.current) return;
    inFlight.current = true;
    try {
      await fetch('/api/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id }),
      });
    } catch {
      // roll back on failure
      setLiked(!next);
      setLikeCount((c) => c + (next ? -1 : 1));
    } finally {
      inFlight.current = false;
    }
  };

  const sendReply = async () => {
    const text = replyText.trim();
    if (!text) return;
    const optimistic: PostReply = {
      id: `tmp-${Date.now()}`,
      text,
      user: { username: 'sen' },
    };
    setReplies((r) => [optimistic, ...r].slice(0, 3));
    setReplyCount((c) => c + 1);
    setReplyText('');
    setShowReply(false);
    tap(12);
    try {
      await fetch('/api/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id, text }),
      });
    } catch {
      setReplyCount((c) => c - 1);
    }
  };

  const avatar = post.user.avatar || AVATAR_FALLBACK(post.user.username);

  return (
    <article
      className="animate-slideUp rounded-2xl border border-edge bg-card/80 px-4 py-3.5 backdrop-blur-sm"
      style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }}
    >
      {/* header */}
      <div className="flex items-center gap-3">
        <Image
          src={avatar}
          alt={post.user.username}
          width={40}
          height={40}
          className="h-10 w-10 rounded-full bg-midnight ring-1 ring-edge"
          unoptimized
        />
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <span className="truncate font-semibold text-ink">{post.user.username}</span>
          {post.user.isAdmin && (
            <span className="rounded-full bg-glow/15 px-1.5 py-0.5 text-[10px] font-bold text-glow">
              admin
            </span>
          )}
          {post.user.isBot && !post.user.isAdmin && (
            <span className="rounded-full bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-muted">
              bot
            </span>
          )}
        </div>
        <time className="shrink-0 text-xs text-muted">{timeAgo(post.createdAt)}</time>
      </div>

      {/* body */}
      <p className="mt-2.5 whitespace-pre-wrap break-words text-[15px] leading-relaxed text-ink">
        {post.text}
      </p>

      {/* images */}
      {post.images.length > 0 && (
        <div
          className={`mt-3 grid gap-1.5 overflow-hidden rounded-xl ${
            post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
          }`}
        >
          {post.images.slice(0, 4).map((src, i) => (
            <div key={i} className="relative aspect-video bg-midnight">
              <Image src={src} alt="" fill className="object-cover" unoptimized />
            </div>
          ))}
        </div>
      )}

      {/* actions */}
      <div className="mt-3 flex items-center gap-1 text-muted">
        {/* LIKE — the moment */}
        <button
          onClick={toggleLike}
          aria-pressed={liked}
          aria-label="Halaýaryn"
          className="press relative flex items-center gap-1.5 rounded-full px-2.5 py-1.5 hover:bg-glow/10"
        >
          <span className="relative">
            <span
              key={popKey}
              className={`inline-block ${popKey ? 'animate-likePop' : ''} ${
                liked ? 'drop-shadow-[0_0_6px_rgba(0,229,255,0.8)]' : ''
              }`}
            >
              ⚡
            </span>
            {bursts.map((b) => (
              <span
                key={b.id}
                className="burst-dot"
                style={{ '--bx': b.bx, '--by': b.by } as React.CSSProperties}
              />
            ))}
          </span>
          {likeCount > 0 && (
            <span
              key={likeCount}
              className={`animate-countRoll text-sm tabular-nums ${liked ? 'text-glow' : ''}`}
            >
              {likeCount}
            </span>
          )}
        </button>

        {/* REPLY */}
        <button
          onClick={() => { setShowReply((s) => !s); tap(8); }}
          className="press flex items-center gap-1.5 rounded-full px-2.5 py-1.5 hover:bg-white/5"
          aria-label="Jogap ber"
        >
          <span>💬</span>
          {replyCount > 0 && <span className="text-sm tabular-nums">{replyCount}</span>}
        </button>

        {/* REPOST */}
        <button
          onClick={() => { setReposted((r) => !r); tap(10); }}
          className={`press rounded-full px-2.5 py-1.5 hover:bg-white/5 ${
            reposted ? 'text-emerald-400' : ''
          }`}
          aria-pressed={reposted}
          aria-label="Gaýtadan paýlaş"
        >
          🔄
        </button>

        {/* SAVE */}
        <button
          onClick={() => { setSaved((s) => !s); tap(10); }}
          className={`press ml-auto rounded-full px-2.5 py-1.5 hover:bg-white/5 ${
            saved ? 'text-urgent drop-shadow-[0_0_6px_rgba(255,184,0,0.7)]' : ''
          }`}
          aria-pressed={saved}
          aria-label="Sakla"
        >
          📌
        </button>
      </div>

      {/* inline reply composer */}
      {showReply && (
        <div className="animate-slideUp mt-2 flex items-center gap-2">
          <input
            autoFocus
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendReply()}
            placeholder="Jogabyňy ýaz…"
            maxLength={150}
            className="flex-1 rounded-full border border-edge bg-midnight px-4 py-2 text-sm text-ink outline-none focus:border-glow/50"
          />
          <button
            onClick={sendReply}
            disabled={!replyText.trim()}
            className="press rounded-full bg-glow px-4 py-2 text-sm font-semibold text-midnight disabled:opacity-40"
          >
            Iber
          </button>
        </div>
      )}

      {/* recent replies */}
      {replies.length > 0 && (
        <div className="mt-2.5 space-y-1.5 border-l border-edge pl-3">
          {replies.slice(0, 3).map((r) => (
            <p key={r.id} className="text-sm text-muted">
              <span className="font-medium text-ink/90">{r.user.username}</span> {r.text}
            </p>
          ))}
          {replyCount > 3 && (
            <p className="text-xs text-glow/80">we ýene {replyCount - 3} jogap…</p>
          )}
        </div>
      )}
    </article>
  );
}
