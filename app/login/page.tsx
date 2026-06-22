'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkle } from '@/app/components/icons';
import AvatarPicker from '@/app/components/AvatarPicker';

type Mode = 'login' | 'register';

const MSG: Record<string, string> = {
  bad_username: 'Ulanyjy ady 3–20 harp, diňe a–z, 0–9, _ bolmaly.',
  weak_password: 'Açar sözi azyndan 6 belgi bolmaly.',
  username_taken: 'Bu ulanyjy ady eýýäm alyndy.',
  invalid_credentials: 'Ulanyjy ady ýa-da açar sözi nädogry.',
};

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

  const submit = async () => {
    setError('');
    setBusy(true);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          mode === 'register'
            ? { username, password, displayName, bio, avatar }
            : { username, password }
        ),
      });
      const data = await res.json();
      if (!res.ok) setError(MSG[data.error] ?? 'Bir näsazlyk ýüze çykdy.');
      else { router.push('/'); router.refresh(); }
    } catch {
      setError('Tora birikmek başartmady.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="animate-floaty mb-2 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-grad-primary text-midnight shadow-glowSoft">
            <Sparkle size={26} />
          </div>
          <h1 className="brand text-3xl">Pikirler</h1>
          <p className="mt-1 text-sm text-muted">Pikirleriň dünýäsine hoş geldiň.</p>
        </div>

        <div className="rounded-3xl border border-edge bg-card p-6">
          <div className="mb-5 grid grid-cols-2 rounded-full bg-midnight p-1 text-sm font-medium">
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

            <button onClick={submit} disabled={busy || !username.trim() || !password}
              className="btn-primary press w-full rounded-full py-3">
              {busy ? '…' : mode === 'login' ? 'Gir' : 'Hasaba al'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
