'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import SideNav from './SideNav';
import Composer from './Composer';
import type { PublicUser } from './types';

type Shell = { user: PublicUser | null; refreshKey: number; openComposer: () => void; reloadUser: () => void };
const Ctx = createContext<Shell>({ user: null, refreshKey: 0, openComposer: () => {}, reloadUser: () => {} });
export const useShell = () => useContext(Ctx);

export default function AppShell({ header, children }: { header?: React.ReactNode; children: React.ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [open, setOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const reloadUser = () => { fetch('/api/auth/me').then((r) => r.json()).then((d) => setUser(d.user)).catch(() => {}); };
  useEffect(reloadUser, []);

  const newThread = () => { if (!user) { window.location.href = '/login'; return; } setOpen(true); };
  const logout = async () => { await fetch('/api/auth/logout', { method: 'POST' }); window.location.href = '/login'; };

  return (
    <Ctx.Provider value={{ user, refreshKey, openComposer: newThread, reloadUser }}>
      <div className="min-h-screen md:pl-[68px] lg:pl-[230px]">
        <SideNav user={user} onNewThread={newThread} onLogout={logout} />
        <main className="mx-auto min-h-screen max-w-[600px] border-x border-edge pb-24 md:pb-10">
          {header}
          {children}
        </main>
        <Composer open={open} onClose={() => setOpen(false)} onPosted={() => setRefreshKey((k) => k + 1)} />
      </div>
    </Ctx.Provider>
  );
}
