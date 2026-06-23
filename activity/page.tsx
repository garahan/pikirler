'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import AppShell from '../components/AppShell';
import PageHeader from '../components/PageHeader';
import { HeartFill, Comment, Profile } from '../components/icons';

type Item = { type: 'like' | 'reply' | 'follow'; user: { username: string; displayName: string; avatar?: string | null }; postText?: string; text?: string };
const fb = (s: string) => `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(s)}`;

function ActivityInner() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { fetch('/api/activity').then((r) => r.json()).then((d) => setItems(d.items ?? [])).finally(() => setLoaded(true)); }, []);

  const icon = (t: Item['type']) => t === 'like' ? <span className="text-glow"><HeartFill size={18} /></span> : t === 'reply' ? <span className="text-accent"><Comment size={18} /></span> : <span className="text-emerald-400"><Profile size={18} /></span>;
  const verb = (t: Item['type']) => t === 'like' ? 'pikiriňi haladı' : t === 'reply' ? 'jogap ýazdy' : 'saňa agza boldy';

  return (
    <>
      {loaded && items.length === 0 && <div className="py-20 text-center"><p className="text-4xl">🔔</p><p className="mt-3 font-semibold text-ink">Heniz hereket ýok</p><p className="mt-1 text-sm text-muted">Halamalar we jogaplar şu ýerde görner.</p></div>}
      {items.map((it, i) => (
        <button key={i} onClick={() => router.push(`/u/${it.user.username}`)} className="press flex w-full items-center gap-3 border-b border-edge px-4 py-3 text-left hover:bg-white/[0.02]">
          <span className="relative shrink-0">
            <span className="ring-grad"><Image src={it.user.avatar || fb(it.user.username)} alt="" width={40} height={40} className="h-10 w-10 rounded-full bg-card" unoptimized /></span>
            <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-midnight">{icon(it.type)}</span>
          </span>
          <span className="min-w-0">
            <span className="text-sm text-ink"><b>{it.user.displayName}</b> <span className="text-muted">{verb(it.type)}</span></span>
            {(it.text || it.postText) && <span className="block truncate text-sm text-muted">{it.text || it.postText}</span>}
          </span>
        </button>
      ))}
    </>
  );
}
export default function ActivityPage() { return <AppShell header={<PageHeader title="Hereket" />}><ActivityInner /></AppShell>; }
