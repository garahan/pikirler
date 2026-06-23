'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
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

function pwStrength(pw: string): number {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 6) s++;
  if (pw.length >= 10) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^a-zA-Z0-9]/.test(pw)) s++;
  return Math.min(s, 4);
}

const STRENGTH_LABEL = ['', 'Gowşak', 'Orta', 'Gowy', 'Güýçli'];
const STRENGTH_COLOR = ['', '#FF4D8D', '#FFB800', '#A78BFA', '#00E5FF'];

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
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [iconHovered, setIconHovered] = useState(false);
  const [burstParticles, setBurstParticles] = useState<{ id: number; cx: string; cy: string; cr: string; color: string }[]>([]);

  const cardRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const tiltRaf = useRef<number>(0);
  const btnMagRaf = useRef<number>(0);

  // --- Card tilt on mouse move ---
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    cancelAnimationFrame(tiltRaf.current);
    tiltRaf.current = requestAnimationFrame(() => {
      card.style.transform = `perspective(900px) rotateY(${dx * 6}deg) rotateX(${-dy * 5}deg) scale(1.015)`;
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    cancelAnimationFrame(tiltRaf.current);
    card.style.transition = 'transform 0.6s cubic-bezier(0.34,1.56,0.64,1)';
    card.style.transform = 'perspective(900px) rotateY(0deg) rotateX(0deg) scale(1)';
    setTimeout(() => { if (card) card.style.transition = ''; }, 620);
  }, []);

  // --- Magnetic button ---
  const handleBtnMouseMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    cancelAnimationFrame(btnMagRaf.current);
    btnMagRaf.current = requestAnimationFrame(() => {
      btn.style.transform = `translate(${dx * 0.22}px, ${dy * 0.22}px) scale(1.04)`;
    });
  }, []);

  const handleBtnMouseLeave = useCallback(() => {
    const btn = btnRef.current;
    if (!btn) return;
    cancelAnimationFrame(btnMagRaf.current);
    btn.style.transition = 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease, opacity 0.2s ease';
    btn.style.transform = '';
    setTimeout(() => { if (btn) btn.style.transition = ''; }, 420);
  }, []);

  // --- Burst confetti ---
  const triggerBurst = useCallback(() => {
    const particles = Array.from({ length: 26 }, (_, i) => {
      const a = (Math.PI * 2 * i) / 26;
      const dist = 55 + Math.random() * 80;
      return {
        id: i,
        cx: `${Math.cos(a) * dist}px`,
        cy: `${Math.sin(a) * dist}px`,
        cr: `${Math.random() * 540}deg`,
        color: CONFETTI[i % CONFETTI.length],
      };
    });
    setBurstParticles(particles);
    setTimeout(() => setBurstParticles([]), 900);
  }, []);

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
      if (!res.ok) { setError(MSG[data.error] ?? 'Bir näsazlyk ýüze çykdy.'); setBusy(false); return; }
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) { try { navigator.vibrate([12, 40, 18, 30, 24]); } catch {} }
      setCelebrate(true);
      triggerBurst();
      setTimeout(() => { router.push('/'); router.refresh(); }, 820);
    } catch {
      setError('Tora birikmek başartmady.');
      setBusy(false);
    }
  };

  const strength = mode === 'register' ? pwStrength(password) : 0;
  const canSubmit = !busy && !celebrate && username.trim() && password;

  return (
    <main
      className="relative grid min-h-screen place-items-center overflow-hidden px-4 py-10"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <LandingBackground />

      <div className="w-full max-w-sm">

        {/* ── Logo area ── */}
        <div className="mb-6 text-center">
          <div
            className="relative mb-3 inline-flex"
            onMouseEnter={() => setIconHovered(true)}
            onMouseLeave={() => setIconHovered(false)}
          >
            {/* pulse rings */}
            <span
              className="pointer-events-none absolute inset-0 rounded-2xl"
              style={{
                boxShadow: iconHovered
                  ? '0 0 0 8px rgba(0,229,255,0.18), 0 0 0 20px rgba(0,229,255,0.07)'
                  : '0 0 0 0px rgba(0,229,255,0)',
                transition: 'box-shadow 0.4s ease',
                borderRadius: '1rem',
              }}
            />
            {/* expanding ring animation */}
            {iconHovered && (
              <>
                <span style={{
                  position: 'absolute', inset: '-8px', borderRadius: '1.4rem',
                  border: '1.5px solid rgba(0,229,255,0.5)',
                  animation: 'ringExpand 0.7s ease-out forwards',
                  pointerEvents: 'none',
                }} />
                <span style={{
                  position: 'absolute', inset: '-16px', borderRadius: '1.8rem',
                  border: '1px solid rgba(0,229,255,0.25)',
                  animation: 'ringExpand 0.7s 0.12s ease-out forwards',
                  pointerEvents: 'none',
                }} />
              </>
            )}
            <div
              className="animate-floaty inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-grad-primary text-midnight"
              style={{
                boxShadow: iconHovered
                  ? '0 0 32px rgba(0,229,255,0.7), 0 0 8px rgba(0,229,255,0.4)'
                  : '0 0 18px rgba(0,229,255,0.35)',
                transition: 'box-shadow 0.3s ease',
              }}
            >
              <Sparkle size={30} />
            </div>
          </div>
          <TypedLogo />
        </div>

        {/* ── Card ── */}
        <div
          ref={cardRef}
          className="rise-in rounded-3xl border border-white/10 bg-card/70 p-6 shadow-glowSoft backdrop-blur-xl"
          style={{ animationDelay: '1.1s', willChange: 'transform', transformStyle: 'preserve-3d' }}
        >
          {/* ── Mode switcher with sliding pill ── */}
          <div className="relative mb-5 grid grid-cols-2 rounded-full bg-midnight/70 p-1 text-sm font-medium">
            {/* sliding pill */}
            <span
              style={{
                position: 'absolute',
                top: '4px', bottom: '4px',
                left: mode === 'login' ? '4px' : 'calc(50% + 2px)',
                width: 'calc(50% - 6px)',
                borderRadius: '9999px',
                background: 'linear-gradient(110deg, #00E5FF, #A78BFA)',
                transition: 'left 0.35s cubic-bezier(0.34,1.56,0.64,1)',
                pointerEvents: 'none',
              }}
            />
            {(['login', 'register'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className="press relative z-10 rounded-full py-2 transition-colors"
                style={{ color: mode === m ? '#07121a' : 'var(--muted)', fontWeight: mode === m ? 600 : 400 }}
              >
                {m === 'login' ? 'Gir' : 'Hasaba al'}
              </button>
            ))}
          </div>

          {mode === 'register' && (
            <div className="mb-4 animate-slideUp">
              <AvatarPicker seedHint={username} value={avatar} onChange={setAvatar} />
            </div>
          )}

          <div className="space-y-3">
            {/* Username */}
            <div className="relative" style={{ animationDelay: '0.05s' }}>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ulanyjy ady"
                autoCapitalize="none"
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField(null)}
                className="w-full rounded-xl border bg-midnight px-4 py-3 text-ink outline-none transition-all duration-200"
                style={{
                  borderColor: focusedField === 'username' ? 'rgba(0,229,255,0.6)' : 'var(--edge)',
                  boxShadow: focusedField === 'username' ? '0 0 0 3px rgba(0,229,255,0.10), 0 0 18px rgba(0,229,255,0.08)' : 'none',
                }}
              />
            </div>

            {mode === 'register' && (
              <>
                <div className="relative animate-slideUp" style={{ animationDelay: '0.08s' }}>
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="görkeziljek at (islege görä)"
                    onFocus={() => setFocusedField('displayName')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full rounded-xl border bg-midnight px-4 py-3 text-ink outline-none transition-all duration-200"
                    style={{
                      borderColor: focusedField === 'displayName' ? 'rgba(0,229,255,0.6)' : 'var(--edge)',
                      boxShadow: focusedField === 'displayName' ? '0 0 0 3px rgba(0,229,255,0.10)' : 'none',
                    }}
                  />
                </div>
                <div className="relative animate-slideUp" style={{ animationDelay: '0.11s' }}>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value.slice(0, 160))}
                    rows={2}
                    placeholder="bio (islege görä)"
                    onFocus={() => setFocusedField('bio')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full resize-none rounded-xl border bg-midnight px-4 py-3 text-ink outline-none placeholder:text-muted transition-all duration-200"
                    style={{
                      borderColor: focusedField === 'bio' ? 'rgba(0,229,255,0.6)' : 'var(--edge)',
                      boxShadow: focusedField === 'bio' ? '0 0 0 3px rgba(0,229,255,0.10)' : 'none',
                    }}
                  />
                  <span className="absolute bottom-2 right-3 text-[10px] text-muted/50">{bio.length}/160</span>
                </div>
              </>
            )}

            {/* Password */}
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && canSubmit && submit()}
                placeholder="açar sözi"
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                className="w-full rounded-xl border bg-midnight px-4 py-3 text-ink outline-none transition-all duration-200"
                style={{
                  borderColor: focusedField === 'password' ? 'rgba(0,229,255,0.6)' : 'var(--edge)',
                  boxShadow: focusedField === 'password' ? '0 0 0 3px rgba(0,229,255,0.10), 0 0 18px rgba(0,229,255,0.08)' : 'none',
                }}
              />
            </div>

            {/* Password strength meter */}
            {mode === 'register' && password && (
              <div className="animate-slideUp space-y-1 px-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((lvl) => (
                    <div
                      key={lvl}
                      className="h-1 flex-1 rounded-full transition-all duration-300"
                      style={{
                        background: strength >= lvl ? STRENGTH_COLOR[strength] : 'rgba(255,255,255,0.08)',
                        boxShadow: strength >= lvl ? `0 0 6px ${STRENGTH_COLOR[strength]}88` : 'none',
                      }}
                    />
                  ))}
                </div>
                <p className="text-[11px] transition-all duration-300" style={{ color: STRENGTH_COLOR[strength] }}>
                  {STRENGTH_LABEL[strength]}
                </p>
              </div>
            )}

            {/* Error */}
            {error && (
              <p className="animate-slideUp rounded-xl border border-pink/30 bg-pink/10 px-3 py-2 text-sm text-pink">
                {error}
              </p>
            )}

            {/* Submit button */}
            <div className="relative pt-1">
              <button
                ref={btnRef}
                onClick={submit}
                disabled={!canSubmit}
                onMouseMove={handleBtnMouseMove}
                onMouseLeave={handleBtnMouseLeave}
                className="btn-primary press grid h-12 w-full place-items-center rounded-full disabled:opacity-40"
                style={{
                  boxShadow: celebrate
                    ? '0 0 40px rgba(0,229,255,0.8), 0 0 80px rgba(167,139,250,0.4)'
                    : undefined,
                  transition: 'box-shadow 0.3s ease, opacity 0.2s ease',
                }}
              >
                {celebrate ? (
                  <span className="animate-checkPop text-xl">✓</span>
                ) : busy ? (
                  <span className="animate-ringSpin block h-5 w-5 rounded-full border-2 border-midnight/30 border-t-midnight" />
                ) : (
                  <span style={{ letterSpacing: '0.01em' }}>
                    {mode === 'login' ? 'Gir' : 'Hasaba al'}
                  </span>
                )}
              </button>

              {/* Confetti burst */}
              {burstParticles.length > 0 && (
                <span className="pointer-events-none absolute left-1/2 top-1/2">
                  {burstParticles.map((c) => (
                    <span
                      key={c.id}
                      className="confetti"
                      style={{
                        background: c.color,
                        '--cx': c.cx,
                        '--cy': c.cy,
                        '--cr': c.cr,
                        width: `${6 + Math.random() * 6}px`,
                        height: `${6 + Math.random() * 6}px`,
                        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                      } as React.CSSProperties}
                    />
                  ))}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ringExpand keyframe injected inline */}
      <style>{`
        @keyframes ringExpand {
          0%   { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.35); }
        }
        @keyframes glowPulse {
          0%,100% { box-shadow: 0 0 8px #00E5FF; opacity: 1; }
          50%      { box-shadow: 0 0 18px #00E5FF; opacity: 0.6; }
        }
      `}</style>
    </main>
  );
}
