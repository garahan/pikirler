'use client';

import { useRouter } from 'next/navigation';
import type { PublicUser } from '@/app/components/types';
import {
  HomeFill, Search, Compose, Activity, Profile, Bookmark, Logout, Sparkle,
} from './icons';

type Item = { key: string; label: string; icon: React.ReactNode; soon?: boolean };

export default function SideNav({
  user,
  onNewThread,
  onLogout,
}: {
  user: PublicUser | null;
  onNewThread: () => void;
  onLogout: () => void;
}) {
  const router = useRouter();

  const items: Item[] = [
    { key: 'home', label: 'Baş sahypa', icon: <HomeFill size={24} /> },
    { key: 'search', label: 'Gözleg', icon: <Search size={24} />, soon: true },
    { key: 'activity', label: 'Hereket', icon: <Activity size={24} />, soon: true },
    { key: 'profile', label: 'Profil', icon: <Profile size={24} />, soon: true },
    { key: 'saved', label: 'Saklananlar', icon: <Bookmark size={24} />, soon: true },
  ];

  const go = (it: Item) => {
    if (it.key === 'home') { router.push('/'); return; }
    // placeholder destinations — gently no-op for now
  };

  return (
    <>
      {/* ---------- desktop sidebar ---------- */}
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-[68px] flex-col items-center justify-between border-r border-edge py-5 md:flex lg:w-[230px] lg:items-stretch lg:px-3">
        <div>
          <div className="mb-6 flex items-center gap-2 px-2 lg:px-3">
            <span className="text-glow"><Sparkle size={26} /></span>
            <span className="brand hidden text-xl lg:inline">Pikirler</span>
          </div>

          <nav className="flex flex-col gap-1">
            <button onClick={onNewThread} className="press group flex items-center gap-3 rounded-xl px-3 py-2.5 text-glow hover:bg-glow/10">
              <Compose size={24} />
              <span className="hidden text-[15px] font-semibold lg:inline">Täze pikir</span>
            </button>

            {items.map((it) => (
              <button
                key={it.key}
                onClick={() => go(it)}
                className={`press group flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/5 ${it.key === 'home' ? 'text-ink' : 'text-muted'}`}
              >
                {it.icon}
                <span className="hidden text-[15px] lg:inline">{it.label}</span>
                {it.soon && <span className="ml-auto hidden rounded-full bg-white/5 px-1.5 py-0.5 text-[10px] text-muted lg:inline">ýakynda</span>}
              </button>
            ))}
          </nav>
        </div>

        <div className="w-full">
          {user ? (
            <button onClick={onLogout} className="press flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-muted hover:bg-white/5 hover:text-ink">
              <Logout size={24} />
              <span className="hidden truncate text-[15px] lg:inline">Çyk ({user.displayName})</span>
            </button>
          ) : (
            <button onClick={() => router.push('/login')} className="press flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-glow hover:bg-glow/10">
              <Profile size={24} />
              <span className="hidden text-[15px] font-semibold lg:inline">Gir</span>
            </button>
          )}
        </div>
      </aside>

      {/* ---------- mobile bottom bar ---------- */}
      <nav className="fixed bottom-0 left-0 z-30 flex w-full items-center justify-around border-t border-edge bg-midnight/90 px-2 py-2 backdrop-blur-md md:hidden">
        <button onClick={() => router.push('/')} className="press p-2 text-ink"><HomeFill size={26} /></button>
        <button onClick={() => {}} className="press p-2 text-muted"><Search size={26} /></button>
        <button onClick={onNewThread} className="press grid h-11 w-11 place-items-center rounded-2xl bg-glow text-midnight shadow-glowSoft"><Compose size={24} /></button>
        <button onClick={() => {}} className="press p-2 text-muted"><Activity size={26} /></button>
        {user ? (
          <button onClick={onLogout} className="press p-2 text-muted"><Logout size={26} /></button>
        ) : (
          <button onClick={() => router.push('/login')} className="press p-2 text-glow"><Profile size={26} /></button>
        )}
      </nav>
    </>
  );
}
