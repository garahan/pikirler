'use client';

import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import type { PublicUser } from './types';
import { HomeFill, Home, Search, Compose, Activity, Profile, Bookmark, BookmarkFill, Logout, Sparkle } from './icons';

const fb = (s: string) => `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(s)}`;

export default function SideNav({ user, onNewThread, onLogout }: { user: PublicUser | null; onNewThread: () => void; onLogout: () => void }) {
  const router = useRouter();
  const path = usePathname();
  const active = (href: string) => (href === '/' ? path === '/' : path.startsWith(href));

  const items = [
    { href: '/', label: 'Baş sahypa', on: <HomeFill size={24} />, off: <Home size={24} /> },
    { href: '/search', label: 'Gözleg', on: <Search size={24} />, off: <Search size={24} /> },
    { href: '/activity', label: 'Hereket', on: <Activity size={24} />, off: <Activity size={24} /> },
    { href: '/saved', label: 'Saklananlar', on: <BookmarkFill size={24} />, off: <Bookmark size={24} /> },
  ];
  const profileHref = user ? `/u/${user.username}` : '/login';

  return (
    <>
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-[68px] flex-col items-center justify-between border-r border-edge py-5 md:flex lg:w-[230px] lg:items-stretch lg:px-3">
        <div className="w-full">
          <div className="mb-6 flex items-center gap-2 px-2 lg:px-3">
            <span className="text-glow"><Sparkle size={26} /></span>
            <span className="brand hidden text-xl lg:inline">Pikirler</span>
          </div>
          <nav className="flex flex-col gap-1">
            <button onClick={onNewThread} className="press group flex items-center gap-3 rounded-xl px-3 py-2.5 text-glow hover:bg-glow/10">
              <Compose size={24} /><span className="hidden text-[15px] font-semibold lg:inline">Täze pikir</span>
            </button>
            {items.map((it) => (
              <button key={it.href} onClick={() => router.push(it.href)} className={`press flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/5 ${active(it.href) ? 'text-ink' : 'text-muted'}`}>
                {active(it.href) ? it.on : it.off}
                <span className="hidden text-[15px] lg:inline">{it.label}</span>
              </button>
            ))}
            <button onClick={() => router.push(profileHref)} className={`press flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/5 ${active('/u/') ? 'text-ink' : 'text-muted'}`}>
              <Profile size={24} /><span className="hidden text-[15px] lg:inline">Profil</span>
            </button>
          </nav>
        </div>

        <div className="w-full">
          {user ? (
            <div className="flex items-center gap-2 lg:px-1">
              <button onClick={() => router.push(profileHref)} className="press ring-grad shrink-0"><Image src={user.avatar || fb(user.username)} alt="" width={32} height={32} className="h-8 w-8 rounded-full bg-card" unoptimized /></button>
              <span className="hidden min-w-0 flex-1 lg:block"><span className="block truncate text-sm font-medium text-ink">{user.displayName}</span></span>
              <button onClick={onLogout} className="press hidden text-muted hover:text-ink lg:block" aria-label="Çyk"><Logout size={20} /></button>
            </div>
          ) : (
            <button onClick={() => router.push('/login')} className="press flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-glow hover:bg-glow/10">
              <Profile size={24} /><span className="hidden text-[15px] font-semibold lg:inline">Gir</span>
            </button>
          )}
        </div>
      </aside>

      <nav className="fixed bottom-0 left-0 z-30 flex w-full items-center justify-around border-t border-edge bg-midnight/90 px-2 py-2 backdrop-blur-md md:hidden">
        <button onClick={() => router.push('/')} className={`press p-2 ${active('/') ? 'text-ink' : 'text-muted'}`}>{active('/') ? <HomeFill size={26} /> : <Home size={26} />}</button>
        <button onClick={() => router.push('/search')} className={`press p-2 ${active('/search') ? 'text-ink' : 'text-muted'}`}><Search size={26} /></button>
        <button onClick={onNewThread} className="press grid h-11 w-11 place-items-center rounded-2xl btn-grad shadow-glowSoft"><Compose size={24} /></button>
        <button onClick={() => router.push('/activity')} className={`press p-2 ${active('/activity') ? 'text-ink' : 'text-muted'}`}><Activity size={26} /></button>
       <button
  onClick={() => router.push(profileHref)}
  className={`press flex items-center justify-center p-2 ${
    active('/u/') ? 'text-ink' : 'text-muted'
  }`}
>
  {user ? (
    <Image
      src={user.avatar || fb(user.username)}
      alt=""
      width={28}
      height={28}
      className={`h-7 w-7 rounded-full object-cover ${
        active('/u/') ? 'ring-2 ring-cyan-400' : ''
      }`}
      unoptimized
    />
  ) : (
    <Profile size={26} />
  )}
</button>
          {user ? <span className="ring-grad"><Image src={user.avatar || fb(user.username)} alt="" width={26} height={26} className="h-[26px] w-[26px] rounded-full bg-card" unoptimized /></span> : <Profile size={26} />}
        </button>
      </nav>
    </>
  );
}
