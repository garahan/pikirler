'use client';

import { useEffect, useState } from 'react';
import Feed from './components/Feed';
import Composer from './components/Composer';
import SideNav from './components/SideNav';
import type { PublicUser } from './components/types';

export default function Home() {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => setUser(d.user))
      .catch(() => {});
  }, []);

  const newThread = () => {
    if (!user) { window.location.href = '/login'; return; }
    setComposerOpen(true);
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setRefresh((n) => n + 1);
  };

  return (
    <div className="min-h-screen md:pl-[68px] lg:pl-[230px]">
      <SideNav user={user} onNewThread={newThread} onLogout={logout} />

      <main className="mx-auto min-h-screen max-w-[600px] border-x border-edge pb-24 md:pb-8">
        {/* feed column header */}
        <header className="sticky top-0 z-30 flex h-[52px] items-center justify-center border-b border-edge bg-midnight/80 px-4 backdrop-blur-md">
          <span className="brand text-lg">Pikirler</span>
        </header>

        <Feed refreshSignal={refresh} authed={!!user} />
      </main>

      <Composer open={composerOpen} onClose={() => setComposerOpen(false)} onPosted={() => setRefresh((n) => n + 1)} />
    </div>
  );
}
