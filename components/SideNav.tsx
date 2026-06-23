'use client';

import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import type { PublicUser } from './types';
import {
  HomeFill, Home, Search, Compose, Activity, Profile, Bookmark, BookmarkFill, Logout, Sparkle,
} from './icons';

const fb = (s: string) => `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(s)}`;

type NavItem = {
  href: string;
  label: string;
  Icon: (p: { size?: number }) => JSX.Element;
  IconActive: (p: { size?: number }) => JSX.Element;
};

const ITEMS: NavItem[] = [
  { href: '/', label: 'Baş sahypa', Icon: Home, IconActive: HomeFill },
  { href: '/search', label: 'Gözleg', Icon: Search, IconActive: Search },
  { href: '/activity', label: 'Hereket', Icon: Activity, IconActive: Activity },
  { href: '/saved', label: 'Saklananlar', Icon: Bookmark, IconActive: BookmarkFill },
];

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
  const path = usePathname();
  const active = (href: string) => (href === '/' ? path === '/' : path.startsWith(href));
  const profileHref = user ? `/u/${user.username}` : '/login';

  return (
    <>
      {/* desktop sidebar */}
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-[68px] flex-col items-center justify-between border-r border-edge py-5 md:flex lg:w-[230px] lg:items-stretch lg:px-3">
        <div className="w-full">
          <div className="mb-6 flex items-center justify-center gap-2 px-2 lg:justify-start lg:px-3">
            <span className="text-glow"><Sparkle size={26} /></span>
            <span className="brand hidden text-xl lg:inline">Pikirler</span>
          </div>

          <nav className="flex flex-col items-center gap-1 lg:items-stretch">
            <button
              onClick={onNewThread}
              className="press flex items-center gap-3 rounded-xl px-3 py-2.5 text-glow hover:bg-glow/10"
            >
              <Compose size={24} />
              <span className="hidden text-[15px] font-semibold lg:inline">Täze pikir</span>
            </button>

            {ITEMS.map((it) => {
              const on = active(it.href);
              const Ico = on ? it.IconActive : it.Icon;
              return (
                <button
                  key={it.href}
                  onClick={() => router.push(it.href)}
                  className={`press flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/5 ${on ? 'text-ink' : 'text-muted'}`}
                >
                  <Ico size={24} />
                  <span className="hidden text-[15px] lg:inline">{it.label}</span>
                </button>
              );
            })}

            <button
              onClick={() => router.push(profileHref)}
              className={`press flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/5 ${active('/u/') ? 'text-ink' : 'text-muted'}`}
            >
              <Profile size={24} />
              <span className="hidden text-[15px] lg:inline">Profil</span>
            </button>
          </nav>
        </div>

        <div className="w-full">
          {user ? (
            <div className="flex items-center justify-center gap-2 lg:justify-start lg:px-1">
              <button onClick={() => router.push(profileHref)} className="press shrink-0">
                <Image src={user.avatar || fb(user.username)} alt="" width={32} height={32} className="h-8 w-8 rounded-full bg-card ring-1 ring-edge" unoptimized />
              </button>
              <span className="hidden min-w-0 flex-1 truncate text-sm font-medium text-ink lg:block">{user.displayName}</span>
              <button onClick={onLogout} className="press hidden text-muted hover:text-ink lg:block" aria-label="Çyk"><Logout size={20} /></button>
            </div>
          ) : (
            <button onClick={() => router.push('/login')} className="press flex w-full items-center justify-center gap-3 rounded-xl px-3 py-2.5 text-glow hover:bg-glow/10 lg:justify-start">
              <Profile size={24} />
              <span className="hidden text-[15px] font-semibold lg:inline">Gir</span>
            </button>
          )}
        </div>
      </aside>

      {/* mobile bottom bar */}
      <nav className="fixed bottom-0 left-0 z-30 flex w-full items-center justify-around border-t border-edge bg-midnight/90 px-2 py-2 backdrop-blur-md md:hidden">
        <button onClick={() => router.push('/')} className={`press p-2 ${active('/') ? 'text-ink' : 'text-muted'}`}>
          {active('/') ? <HomeFill size={26} /> : <Home size={26} />}
        </button>
        <button onClick={() => router.push('/search')} className={`press p-2 ${active('/search') ? 'text-ink' : 'text-muted'}`}><Search size={26} /></button>
        <button onClick={onNewThread} className="press grid h-11 w-11 place-items-center rounded-2xl btn-grad shadow-glowSoft"><Compose size={24} /></button>
        <button onClick={() => router.push('/activity')} className={`press p-2 ${active('/activity') ? 'text-ink' : 'text-muted'}`}><Activity size={26} /></button>
        <button onClick={() => router.push(profileHref)} className="press p-1">
          {user
            ? <Image src={user.avatar || fb(user.username)} alt="" width={28} height={28} className={`h-7 w-7 rounded-full bg-card ${active('/u/') ? 'ring-2 ring-glow' : 'ring-1 ring-edge'}`} unoptimized />
            : <span className={active('/u/') ? 'text-ink' : 'text-muted'}><Profile size={26} /></span>}
        </button>
      </nav>
    </>
  );
}
