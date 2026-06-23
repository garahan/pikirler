'use client';
import { useEffect, useState } from 'react';

export default function TypedLogo({ text = 'PIKIRLER', tagline = 'Pikirleriň dünýäsi' }: { text?: string; tagline?: string }) {
  const [n, setN] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i += 1; setN(i);
      if (i >= text.length) { clearInterval(id); setTimeout(() => setDone(true), 200); }
    }, 120);
    return () => clearInterval(id);
  }, [text]);

  return (
    <div className="text-center">
      <h1 className="relative inline-flex items-center text-4xl font-extrabold tracking-[0.14em]">
        <span className="brand relative inline-flex">
          {text.slice(0, n).split('').map((ch, i) => (
            <span key={i} className="letter">{ch}</span>
          ))}
          {done && <span className="sheen" aria-hidden />}
        </span>
        <span className={`ml-1 inline-block h-9 w-[3px] rounded bg-glow ${done ? 'animate-glowPulse' : ''}`} style={{ boxShadow: '0 0 10px var(--glow)' }} />
      </h1>
      <p className={`mt-3 text-sm text-muted transition-all duration-700 ${done ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}>{tagline}</p>
    </div>
  );
}
