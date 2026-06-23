'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Heart, HeartFill, Comment, Repost, Share, Bookmark, BookmarkFill, More, Trash } from './icons';

export interface PostUser { username: string; displayName?: string; avatar?: string | null; isBot?: boolean; isAdmin?: boolean; }
export interface PostReply { id: string; text: string; user: PostUser; }
export interface Post {
  id: string; text: string; images: string[]; createdAt: string; user: PostUser;
  likeCount: number; replyCount: number; repostCount?: number;
  likedByMe?: boolean; savedByMe?: boolean; repostedByMe?: boolean; replies?: PostReply[];
}
export type Me = { username: string; isAdmin: boolean } | null;

function tap(ms = 12) { if (typeof navigator !== 'undefined' && 'vibrate' in navigator) { try { navigator.vibrate(ms); } catch {} } }
function timeAgo(iso: string): string {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 45) return 'häzir';
  if (d < 3600) return `${Math.round(d / 60)}m`;
  if (d < 86400) return `${Math.round(d / 3600)}s`;
  if (d < 604800) return `${Math.round(d / 86400)}g`;
  return new Date(iso).toLocaleDateString('tk');
}
const fallback = (s: string) => `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(s)}`;

export default function PostCard({ post, index = 0, authed = false, me = null }: { post: Post; index?: number; authed?: boolean; me?: Me }) {
  const router = useRouter();
  const [liked, setLiked] = useState(!!post.likedByMe);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [saved, setSaved] = useState(!!post.savedByMe);
  const [reposted, setReposted] = useState(!!post.repostedByMe);
  const [repostCount, setRepostCount] = useState(post.repostCount ?? 0);
  const [popKey, setPopKey] = useState(0);
  const [bursts, setBursts] = useState<{ id: number; bx: string; by: string }[]>([]);
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replies, setReplies] = useState<PostReply[]>(post.replies ?? []);
  const [replyCount, setReplyCount] = useState(post.replyCount);
  const [copied, setCopied] = useState(false);
  const [menu, setMenu] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [badImg, setBadImg] = useState<Set<number>>(new Set());
  const [heartFx, setHeartFx] = useState(false);
  const inFlight = useRef(false);

  const canDelete = !!me && (me.username === post.user.username || me.isAdmin);
  const gate = () => { if (!authed) { router.push('/login'); return false; } return true; };

  const fireBurst = useCallback(() => {
    setBursts(Array.from({ length: 10 }, (_, i) => {
      const a = (Math.PI * 2 * i) / 10 + Math.random() * 0.4; const dist = 18 + Math.random() * 14;
      return { id: Date.now() + i, bx: `${Math.cos(a) * dist}px`, by: `${Math.sin(a) * dist}px` };
    }));
    setTimeout(() => setBursts([]), 540);
  }, []);

  const hit = async (url: string) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ postId: post.id }) });

  const toggleLike = async () => {
    if (!gate()) return; const next = !liked;
    setLiked(next); setLikeCount((c) => c + (next ? 1 : -1)); setPopKey((k) => k + 1);
    if (next) { fireBurst(); tap(16); } else tap(8);
    if (inFlight.current) return; inFlight.current = true;
    try { await hit('/api/interactions?action=like'); } catch { setLiked(!next); setLikeCount((c) => c + (next ? -1 : 1)); } finally { inFlight.current = false; }
  };
  const toggleRepost = async () => {
    if (!gate()) return; const next = !reposted;
    setReposted(next); setRepostCount((c) => c + (next ? 1 : -1)); tap(12);
    try { await hit('/api/interactions?action=repost'); } catch { setReposted(!next); setRepostCount((c) => c + (next ? -1 : 1)); }
  };
  const toggleSave = async () => {
    if (!gate()) return; const next = !saved; setSaved(next); tap(12);
    try { await hit('/api/interactions?action=save'); } catch { setSaved(!next); }
  };
  const share = async () => {
    tap(8);
    const url = typeof window !== 'undefined' ? `${window.location.origin}/?p=${post.id}` : '';
    if (typeof navigator !== 'undefined' && navigator.share) { navigator.share({ text: post.text, url }).catch(() => {}); return; }
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1400); } catch {}
  };
  const remove = async () => {
    setMenu(false); setDeleted(true); tap(14);
    try { await fetch(`/api/content?id=${post.id}`, { method: 'DELETE' }); } catch { setDeleted(false); }
  };
  const sendReply = async () => {
    if (!gate()) return; const text = replyText.trim(); if (!text) return;
    setReplies((r) => [{ id: `tmp-${Date.now()}`, text, user: { username: 'sen', displayName: 'Sen' } }, ...r].slice(0, 3));
    setReplyCount((c) => c + 1); setReplyText(''); setShowReply(false); tap(12);
    try { await fetch('/api/interactions?action=reply', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ postId: post.id, text }) }); } catch { setReplyCount((c) => c - 1); }
  };

  const doubleLike = () => {
    if (!authed) { router.push('/login'); return; }
    if (!liked) toggleLike();
    setHeartFx(true);
    setTimeout(() => setHeartFx(false), 850);
  };

  if (deleted) return null;
  const avatar = post.user.avatar || fallback(post.user.username);
  const name = post.user.displayName || post.user.username;
  const goProfile = () => router.push(`/u/${post.user.username}`);
  const goodImages = post.images.filter((_, i) => !badImg.has(i));

  return (
    <article className="animate-slideUp relative border-b border-edge px-4 py-2.5 transition-colors hover:bg-white/[0.015]" style={{ animationDelay: `${Math.min(index, 8) * 30}ms` }}>
      <div className="flex gap-2.5">
        <button onClick={goProfile} className="press shrink-0 ring-grad self-start" aria-label={name}>
          <Image src={avatar} alt={name} width={38} height={38} className="h-[38px] w-[38px] rounded-full bg-card" unoptimized />
        </button>

        <div className="min-w-0 flex-1" onDoubleClick={doubleLike}>
          <div className="flex items-center gap-1.5">
            <button onClick={goProfile} className="truncate text-[14px] font-semibold text-ink hover:underline">{name}</button>
            {post.user.isAdmin && <span className="rounded-full bg-glow/15 px-1.5 py-px text-[9px] font-bold text-glow">admin</span>}
            {post.user.isBot && !post.user.isAdmin && <span className="rounded-full bg-white/5 px-1.5 py-px text-[9px] font-medium text-muted">bot</span>}
            <span className="text-muted">·</span>
            <time className="text-[13px] text-muted">{timeAgo(post.createdAt)}</time>

            {canDelete && (
              <div className="relative ml-auto">
                <button onClick={() => setMenu((m) => !m)} className="press -mr-1 rounded-full p-1 text-muted hover:text-ink" aria-label="Menýu"><More size={18} /></button>
                {menu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenu(false)} />
                    <div className="animate-slideUp absolute right-0 top-7 z-20 w-32 overflow-hidden rounded-xl border border-edge bg-card shadow-glowSoft">
                      <button onClick={remove} className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-rose hover:bg-rose/10"><Trash size={16} /> Poz</button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <p className="mt-0.5 whitespace-pre-wrap break-words text-[14px] leading-snug text-ink">{post.text}</p>

          {goodImages.length > 0 && (
            <div className={`mt-2 grid gap-1 overflow-hidden rounded-xl ${goodImages.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {post.images.map((src, i) => badImg.has(i) ? null : (
                <div key={i} className="relative aspect-[4/3] bg-card">
                  <Image src={src} alt="" fill className="object-cover" unoptimized onError={() => setBadImg((s) => new Set(s).add(i))} />
                </div>
              ))}
            </div>
          )}

          <div className="-ml-1.5 mt-1 flex items-center gap-0.5 text-muted">
            <button onClick={toggleLike} aria-pressed={liked} aria-label="Hala" className="press group relative flex h-8 items-center gap-1 rounded-full px-2 hover:bg-glow/10">
              <span className="relative grid place-items-center">
                <span key={popKey} className={`grid place-items-center ${popKey ? 'animate-likePop' : ''} ${liked ? 'text-glow drop-shadow-[0_0_7px_rgba(0,229,255,0.85)]' : 'group-hover:text-glow'}`}>
                  {liked ? <HeartFill size={18} /> : <Heart size={18} />}
                </span>
                {bursts.map((b) => <span key={b.id} className="burst-dot" style={{ '--bx': b.bx, '--by': b.by } as React.CSSProperties} />)}
              </span>
              {likeCount > 0 && <span className={`text-[13px] tabular-nums ${liked ? 'text-glow' : ''}`}>{likeCount}</span>}
            </button>

            <button onClick={() => { if (!gate()) return; setShowReply((s) => !s); tap(8); }} aria-label="Jogap" className="press group flex h-8 items-center gap-1 rounded-full px-2 hover:bg-white/5">
              <span className="group-hover:text-ink"><Comment size={18} /></span>
              {replyCount > 0 && <span className="text-[13px] tabular-nums">{replyCount}</span>}
            </button>

            <button onClick={toggleRepost} aria-pressed={reposted} aria-label="Repost" className={`press group flex h-8 items-center gap-1 rounded-full px-2 hover:bg-white/5 ${reposted ? 'text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.6)]' : 'group-hover:text-emerald-400'}`}>
              <Repost size={18} />{repostCount > 0 && <span className="text-[13px] tabular-nums">{repostCount}</span>}
            </button>

            <button onClick={share} aria-label="Paylas" className="press group relative flex h-8 items-center rounded-full px-2 hover:bg-white/5">
              <span className="group-hover:text-accent"><Share size={17} /></span>
              {copied && <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-accent px-2 py-1 text-[11px] font-semibold text-midnight">Göçürildi</span>}
            </button>

            <button onClick={toggleSave} aria-pressed={saved} aria-label="Sakla" className={`press group ml-auto flex h-8 items-center rounded-full px-2 hover:bg-white/5 ${saved ? 'text-urgent drop-shadow-[0_0_6px_rgba(255,184,0,0.7)]' : 'group-hover:text-urgent'}`}>
              {saved ? <BookmarkFill size={17} /> : <Bookmark size={17} />}
            </button>
          </div>

          {showReply && (
            <div className="animate-slideUp mt-1 flex items-center gap-2">
              <input autoFocus value={replyText} onChange={(e) => setReplyText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendReply()} placeholder="Jogabyňy ýaz…" maxLength={150} className="flex-1 rounded-full border border-edge bg-card px-4 py-1.5 text-sm text-ink outline-none focus:border-glow/50" />
              <button onClick={sendReply} disabled={!replyText.trim()} className="btn-primary press rounded-full px-4 py-1.5 text-sm disabled:opacity-40">Iber</button>
            </div>
          )}

          {replies.length > 0 && (
            <div className="mt-1.5 space-y-1 border-l border-edge pl-3">
              {replies.slice(0, 3).map((r) => (
                <p key={r.id} className="text-[13px] text-muted"><span className="font-medium text-ink/90">{r.user.displayName || r.user.username}</span> {r.text}</p>
              ))}
              {replyCount > 3 && <p className="text-[12px] text-glow/80">we ýene {replyCount - 3} jogap…</p>}
            </div>
          )}
        </div>
      </div>
      {heartFx && (
        <span className="heart-pop"><HeartFill size={88} /></span>
      )}
    </article>
  );
}    if (inFlight.current) return; inFlight.current = true;
    try { await hit('/api/like'); } catch { setLiked(!next); setLikeCount((c) => c + (next ? -1 : 1)); } finally { inFlight.current = false; }
  };
  const toggleRepost = async () => {
    if (!gate()) return; const next = !reposted;
    setReposted(next); setRepostCount((c) => c + (next ? 1 : -1)); tap(12);
    try { await hit('/api/repost'); } catch { setReposted(!next); setRepostCount((c) => c + (next ? -1 : 1)); }
  };
  const toggleSave = async () => {
    if (!gate()) return; const next = !saved; setSaved(next); tap(12);
    try { await hit('/api/save'); } catch { setSaved(!next); }
  };
  const share = async () => {
    tap(8);
    const url = typeof window !== 'undefined' ? `${window.location.origin}/?p=${post.id}` : '';
    if (typeof navigator !== 'undefined' && navigator.share) { navigator.share({ text: post.text, url }).catch(() => {}); return; }
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1400); } catch {}
  };
  const remove = async () => {
    setMenu(false); setDeleted(true); tap(14);
    try { await fetch(`/api/post/${post.id}`, { method: 'DELETE' }); } catch { setDeleted(false); }
  };
  const sendReply = async () => {
    if (!gate()) return; const text = replyText.trim(); if (!text) return;
    setReplies((r) => [{ id: `tmp-${Date.now()}`, text, user: { username: 'sen', displayName: 'Sen' } }, ...r].slice(0, 3));
    setReplyCount((c) => c + 1); setReplyText(''); setShowReply(false); tap(12);
    try { await fetch('/api/reply', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ postId: post.id, text }) }); } catch { setReplyCount((c) => c - 1); }
  };

  const doubleLike = () => {
    if (!authed) { router.push('/login'); return; }
    if (!liked) toggleLike();
    setHeartFx(true);
    setTimeout(() => setHeartFx(false), 850);
  };

  if (deleted) return null;
  const avatar = post.user.avatar || fallback(post.user.username);
  const name = post.user.displayName || post.user.username;
  const goProfile = () => router.push(`/u/${post.user.username}`);
  const goodImages = post.images.filter((_, i) => !badImg.has(i));

  return (
    <article className="animate-slideUp relative border-b border-edge px-4 py-2.5 transition-colors hover:bg-white/[0.015]" style={{ animationDelay: `${Math.min(index, 8) * 30}ms` }}>
      <div className="flex gap-2.5">
        <button onClick={goProfile} className="press shrink-0 ring-grad self-start" aria-label={name}>
          <Image src={avatar} alt={name} width={38} height={38} className="h-[38px] w-[38px] rounded-full bg-card" unoptimized />
        </button>

        <div className="min-w-0 flex-1" onDoubleClick={doubleLike}>
          <div className="flex items-center gap-1.5">
            <button onClick={goProfile} className="truncate text-[14px] font-semibold text-ink hover:underline">{name}</button>
            {post.user.isAdmin && <span className="rounded-full bg-glow/15 px-1.5 py-px text-[9px] font-bold text-glow">admin</span>}
            {post.user.isBot && !post.user.isAdmin && <span className="rounded-full bg-white/5 px-1.5 py-px text-[9px] font-medium text-muted">bot</span>}
            <span className="text-muted">·</span>
            <time className="text-[13px] text-muted">{timeAgo(post.createdAt)}</time>

            {canDelete && (
              <div className="relative ml-auto">
                <button onClick={() => setMenu((m) => !m)} className="press -mr-1 rounded-full p-1 text-muted hover:text-ink" aria-label="Menýu"><More size={18} /></button>
                {menu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenu(false)} />
                    <div className="animate-slideUp absolute right-0 top-7 z-20 w-32 overflow-hidden rounded-xl border border-edge bg-card shadow-glowSoft">
                      <button onClick={remove} className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-rose hover:bg-rose/10"><Trash size={16} /> Poz</button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <p className="mt-0.5 whitespace-pre-wrap break-words text-[14px] leading-snug text-ink">{post.text}</p>

          {goodImages.length > 0 && (
            <div className={`mt-2 grid gap-1 overflow-hidden rounded-xl ${goodImages.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {post.images.map((src, i) => badImg.has(i) ? null : (
                <div key={i} className="relative aspect-[4/3] bg-card">
                  <Image src={src} alt="" fill className="object-cover" unoptimized onError={() => setBadImg((s) => new Set(s).add(i))} />
                </div>
              ))}
            </div>
          )}

          <div className="-ml-1.5 mt-1 flex items-center gap-0.5 text-muted">
            <button onClick={toggleLike} aria-pressed={liked} aria-label="Hala" className="press group relative flex h-8 items-center gap-1 rounded-full px-2 hover:bg-glow/10">
              <span key={popKey} className={`relative grid place-items-center ${popKey ? 'animate-likePop' : ''} ${liked ? 'text-glow drop-shadow-[0_0_7px_rgba(0,229,255,0.85)]' : 'group-hover:text-glow'}`}>
                {liked ? <HeartFill size={18} /> : <Heart size={18} />}
                {bursts.map((b) => <span key={b.id} className="burst-dot" style={{ '--bx': b.bx, '--by': b.by } as React.CSSProperties} />)}
              </span>
              {likeCount > 0 && <span key={likeCount} className={`animate-countRoll text-[13px] tabular-nums ${liked ? 'text-glow' : ''}`}>{likeCount}</span>}
            </button>

            <button onClick={() => { if (!gate()) return; setShowReply((s) => !s); tap(8); }} aria-label="Jogap" className="press group flex h-8 items-center gap-1 rounded-full px-2 hover:bg-white/5">
              <span className="group-hover:text-ink"><Comment size={18} /></span>
              {replyCount > 0 && <span className="text-[13px] tabular-nums">{replyCount}</span>}
            </button>

            <button onClick={toggleRepost} aria-pressed={reposted} aria-label="Repost" className={`press group flex h-8 items-center gap-1 rounded-full px-2 hover:bg-white/5 ${reposted ? 'text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.6)]' : 'group-hover:text-emerald-400'}`}>
              <Repost size={18} />{repostCount > 0 && <span className="text-[13px] tabular-nums">{repostCount}</span>}
            </button>

            <button onClick={share} aria-label="Paylas" className="press group relative flex h-8 items-center rounded-full px-2 hover:bg-white/5">
              <span className="group-hover:text-accent"><Share size={17} /></span>
              {copied && <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-accent px-2 py-1 text-[11px] font-semibold text-midnight">Göçürildi</span>}
            </button>

            <button onClick={toggleSave} aria-pressed={saved} aria-label="Sakla" className={`press group ml-auto flex h-8 items-center rounded-full px-2 hover:bg-white/5 ${saved ? 'text-urgent drop-shadow-[0_0_6px_rgba(255,184,0,0.7)]' : 'group-hover:text-urgent'}`}>
              {saved ? <BookmarkFill size={17} /> : <Bookmark size={17} />}
            </button>
          </div>

          {showReply && (
            <div className="animate-slideUp mt-1 flex items-center gap-2">
              <input autoFocus value={replyText} onChange={(e) => setReplyText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendReply()} placeholder="Jogabyňy ýaz…" maxLength={150} className="flex-1 rounded-full border border-edge bg-card px-4 py-1.5 text-sm text-ink outline-none focus:border-glow/50" />
              <button onClick={sendReply} disabled={!replyText.trim()} className="btn-primary press rounded-full px-4 py-1.5 text-sm disabled:opacity-40">Iber</button>
            </div>
          )}

          {replies.length > 0 && (
            <div className="mt-1.5 space-y-1 border-l border-edge pl-3">
              {replies.slice(0, 3).map((r) => (
                <p key={r.id} className="text-[13px] text-muted"><span className="font-medium text-ink/90">{r.user.displayName || r.user.username}</span> {r.text}</p>
              ))}
              {replyCount > 3 && <p className="text-[12px] text-glow/80">we ýene {replyCount - 3} jogap…</p>}
            </div>
          )}
        </div>
      </div>
      {heartFx && (
        <span className="heart-pop"><HeartFill size={88} /></span>
      )}
    </article>
  );
}
