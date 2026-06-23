'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkle } from '@/app/components/icons';
import TypedLogo from '@/app/components/TypedLogo';
import AvatarPicker from '@/app/components/AvatarPicker';
import LandingBackground from '@/app/components/LandingBackground';

type Mode = 'login' | 'register';

const MSG: Record<string, string> = {
  bad_username: 'Ulanyjy ady 3–20 harp, diňe a–z, 0–9, _ bolmaly.',
  weak_password: 'Açar sözi azyndan 6 belgi bolmaly.',
  username_taken: 'Bu ulanyjy ady eýýäm alyndy.',
  invalid_credentials: 'Ulanyjy ady ýa-da açar sözi nädogry.',
};

const CONFETTI = ['#00E5FF', '#A78BFA', '#FF4D8D', '#FFB800', '#34D399'];

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [celebrate, setCelebrate] = useState(false);

  const burst = () => Array.from({ length: 18 }, (_, i) => {
    const a = (Math.PI * 2 * i) / 18; const dist = 70 + Math.random() * 60;
    return { id: i, cx: `${Math.cos(a) * dist}px`, cy: `${Math.sin(a) * dist}px`, cr: `${Math.random() * 360}deg`, color: CONFETTI[i % CONFETTI.length] };
  });

  const submit = async () => {
    setError('');
    setBusy(true);
    try {
      const res = await fetch(`/api/auth?action=${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          mode === 'register'
            ? { username, password, displayName, bio, avatar }
            : { username, password }
        ),
      });
      const data = await res.json();
      if (!res.ok) { setError(MSG[data.error] ?? 'Bir näsazlyk ýüze çykdy.'); setBusy(false); return; }
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) { try { navigator.vibrate([12, 40, 18]); } catch {} }
      setCelebrate(true);
      setTimeout(() => { router.push('/'); router.refresh(); }, 720);
    } catch {
      setError('Tora birikmek başartmady.');
      setBusy(false);
    }
  };

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-4 py-10">
      <LandingBackground />
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="animate-floaty mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-grad-primary text-midnight shadow-glow">
            <Sparkle size={30} />
          </div>
          <TypedLogo />
        </div>

        <div className="rise-in rounded-3xl border border-white/10 bg-card/70 p-6 shadow-glowSoft backdrop-blur-xl" style={{ animationDelay: '1.1s' }}>
          <div className="mb-5 grid grid-cols-2 rounded-full bg-midnight/70 p-1 text-sm font-medium">
            {(['login', 'register'] as Mode[]).map((m) => (
              <button key={m} onClick={() => { setMode(m); setError(''); }}
                className={`press rounded-full py-2 transition-colors ${mode === m ? 'bg-grad-primary text-midnight' : 'text-muted'}`}>
                {m === 'login' ? 'Gir' : 'Hasaba al'}
              </button>
            ))}
          </div>

          {mode === 'register' && (
            <div className="mb-4">
              <AvatarPicker seedHint={username} value={avatar} onChange={setAvatar} />
            </div>
          )}

          <div className="space-y-3">
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="ulanyjy ady" autoCapitalize="none"
              className="w-full rounded-xl border border-edge bg-midnight px-4 py-3 text-ink outline-none focus:border-glow/50" />

            {mode === 'register' && (
              <>
                <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="görkeziljek at (islege görä)"
                  className="w-full rounded-xl border border-edge bg-midnight px-4 py-3 text-ink outline-none focus:border-glow/50" />
                <textarea value={bio} onChange={(e) => setBio(e.target.value.slice(0, 160))} rows={2} placeholder="bio (islege görä)"
                  className="w-full resize-none rounded-xl border border-edge bg-midnight px-4 py-3 text-ink outline-none placeholder:text-muted focus:border-glow/50" />
              </>
            )}

            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()} placeholder="açar sözi"
              className="w-full rounded-xl border border-edge bg-midnight px-4 py-3 text-ink outline-none focus:border-glow/50" />

            {error && <p className="rounded-xl border border-pink/30 bg-pink/10 px-3 py-2 text-sm text-pink">{error}</p>}

            <div className="relative">
              <button onClick={submit} disabled={busy || celebrate || !username.trim() || !password}
                className="btn-primary press grid h-12 w-full place-items-center rounded-full">
                {celebrate ? <span className="animate-checkPop text-xl">✓</span> : busy ? <span className="animate-ringSpin block h-5 w-5 rounded-full border-2 border-midnight/30 border-t-midnight" /> : (mode === 'login' ? 'Gir' : 'Hasaba al')}
              </button>
              {celebrate && (
                <span className="pointer-events-none absolute left-1/2 top-1/2">
                  {burst().map((c) => (
                    <span key={c.id} className="confetti" style={{ background: c.color, '--cx': c.cx, '--cy': c.cy, '--cr': c.cr } as React.CSSProperties} />
                  ))}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
