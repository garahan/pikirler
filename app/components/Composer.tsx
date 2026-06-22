'use client';

import { useRef, useState } from 'react';
import { Sparkle } from './icons';

const MAX = 500;

function tap(ms = 12) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try { navigator.vibrate(ms); } catch {}
  }
}

type Phase = 'idle' | 'sending' | 'done';

export default function Composer({
  open,
  onClose,
  onPosted,
}: {
  open: boolean;
  onClose: () => void;
  onPosted?: () => void;
}) {
  const [text, setText] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [phase, setPhase] = useState<Phase>('idle');
  const [toast, setToast] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const remaining = MAX - text.length;
  const pct = Math.min(text.length / MAX, 1);
  const near = remaining <= 40;

  const reset = () => setTimeout(() => { setText(''); setImages([]); setPhase('idle'); }, 200);
  const close = () => { onClose(); reset(); };

  const pickImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, 4 - images.length);
    setImages((p) => [...p, ...files.map((f) => URL.createObjectURL(f))].slice(0, 4));
    tap(8);
  };

  const publish = async () => {
    if (!text.trim() || phase !== 'idle') return;
    setPhase('sending');
    tap(14);
    try {
      const res = await fetch('/api/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim(), images }),
      });
      if (res.status === 401) { window.location.href = '/login'; return; }
      setPhase('done');
      tap(22);
      setToast(true);
      setTimeout(() => setToast(false), 1800);
      onPosted?.();
      setTimeout(close, 650);
    } catch {
      setPhase('idle');
    }
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center" onClick={close}>
          <div className="animate-slideUp w-full max-w-lg rounded-t-3xl border border-edge bg-card p-5 sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold text-ink">Täze pikir</h2>
              <button onClick={close} className="press text-muted hover:text-ink" aria-label="Yap">✕</button>
            </div>

            <textarea
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, MAX))}
              placeholder="Näme pikir edýärsiň?"
              rows={4}
              className="w-full resize-none bg-transparent text-[15px] leading-relaxed text-ink outline-none placeholder:text-muted"
            />

            {images.length > 0 && (
              <div className="mt-2 grid grid-cols-4 gap-2">
                {images.map((src, i) => (
                  <div key={i} className="relative aspect-square overflow-hidden rounded-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    <button onClick={() => setImages((p) => p.filter((_, j) => j !== i))} className="press absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-black/70 text-xs text-white">✕</button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 flex items-center justify-between">
              <button onClick={() => fileRef.current?.click()} disabled={images.length >= 4} className="press flex items-center gap-2 rounded-full border border-edge px-3 py-2 text-sm text-muted hover:text-glow disabled:opacity-40">
                🖼️ Surat
              </button>
              <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={pickImages} />

              <div className="flex items-center gap-3">
{text.length > 80 && (
  <div className="relative h-8 w-8">
    <svg viewBox="0 0 36 36" className="h-8 w-8 -rotate-90">
      <circle
        cx="18"
        cy="18"
        r="15"
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="3"
      />
      <circle
        cx="18"
        cy="18"
        r="15"
        fill="none"
        stroke={near ? '#FFB800' : '#00E5FF'}
        strokeWidth="3"
        strokeDasharray={94.2}
        strokeDashoffset={94.2 * (1 - pct)}
        strokeLinecap="round"
        style={{
          transition:
            'stroke-dashoffset 0.2s ease, stroke 0.2s ease',
        }}
      />
    </svg>

    {near && (
      <span className="absolute inset-0 grid place-items-center text-[10px] font-bold text-urgent">
        {remaining}
      </span>
    )}
  </div>
)}

                <button onClick={publish} disabled={!text.trim() || phase !== 'idle'} className="btn-primary press grid h-11 min-w-[7rem] place-items-center rounded-full px-5 disabled:opacity-40">
                  {phase === 'idle' && 'Paýlaş'}
                  {phase === 'sending' && <span className="animate-ringSpin block h-5 w-5 rounded-full border-2 border-midnight/30 border-t-midnight" />}
                  {phase === 'done' && <span className="animate-checkPop text-xl">✓</span>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="animate-toastIn fixed bottom-24 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/15 px-5 py-2.5 text-sm font-semibold text-emerald-300 shadow-[0_0_24px_rgba(16,185,129,0.35)] backdrop-blur">
          <Sparkle size={16} /> Söz goşuldy!
        </div>
      )}
    </>
  );
}
