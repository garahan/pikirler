'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkle } from '@/app/components/icons';

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
          mode === 'register' ? { username, password, displayName } : { username, password }
        ),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(MSG[data.error] ?? 'Bir näsazlyk ýüze çykdy.');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch {
      setError('Tora birikmek başartmady.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-7 text-center">
          <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-glow/10 text-glow shadow-glowSoft">
            <Sparkle size={26} />
          </div>
          <h1 className="brand text-3xl">Pikirler</h1>
          <p className="mt-1 text-sm text-muted">Pikirleriň dünýäsine hoş geldiň.</p>
        </div>

        <div className="rounded-3xl border border-edge bg-card p-6">
          {/* tabs */}
          <div className="mb-5 grid grid-cols-2 rounded-full bg-midnight p-1 text-sm font-medium">
            {(['login', 'register'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className={`press rounded-full py-2 transition-colors ${mode === m ? 'bg-glow text-midnight' : 'text-muted'}`}
              >
                {m === 'login' ? 'Gir' : 'Hasaba al'}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ulanyjy ady"
              autoCapitalize="none"
              className="w-full rounded-xl border border-edge bg-midnight px-4 py-3 text-ink outline-none focus:border-glow/50"
            />
            {mode === 'register' && (
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="görkeziljek at (islege görä)"
                className="w-full rounded-xl border border-edge bg-midnight px-4 py-3 text-ink outline-none focus:border-glow/50"
              />
            )}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              placeholder="açar sözi"
              className="w-full rounded-xl border border-edge bg-midnight px-4 py-3 text-ink outline-none focus:border-glow/50"
            />

            {error && <p className="rounded-xl border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-300">{error}</p>}

            <button
              onClick={submit}
              disabled={busy || !username.trim() || !password}
              className="press w-full rounded-full bg-glow py-3 font-semibold text-midnight shadow-glowSoft disabled:opacity-40"
            >
              {busy ? '…' : mode === 'login' ? 'Gir' : 'Hasaba al'}
            </button>
          </div>
        </div>

        <button onClick={() => router.push('/')} className="press mt-4 w-full text-center text-sm text-muted hover:text-ink">
          Diňe pikirlere seret →
        </button>
      </div>
    </main>
  );
}
EOF
echo "login page written"