'use client';
import { useEffect } from 'react';
export default function ProfileRedirect() {
  useEffect(() => {
    fetch('/api/auth/me').then((r) => r.json()).then((d) => {
      window.location.href = d.user ? `/u/${d.user.username}` : '/login';
    }).catch(() => { window.location.href = '/login'; });
  }, []);
  return <main className="grid min-h-screen place-items-center text-muted"><span className="animate-radar">⚡</span></main>;
}
