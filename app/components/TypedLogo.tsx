'use client';

import { useEffect, useState } from 'react';

export default function TypedLogo({ text = 'PIKIRLER', tagline = 'Pikirleriň dünýäsi' }: { text?: string; tagline?: string }) {
  const [n, setN] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i += 1; setN(i);
      if (i >= text.length) { clearInterval(id); setTimeout(() => setDone(true), 250); }
    }, 130);
    return () => clearInterval(id);
  }, [text]);

  return (
    <div className="text-center">
      <h1 className="brand inline-flex items-center text-4xl tracking-[0.12em]">
        <span>{text.slice(0, n)}</span>
        <span className={`ml-0.5 inline-block h-9 w-[3px] rounded bg-glow ${done ? 'animate-glowPulse' : ''}`} style={{ opacity: done ? undefined : 1 }} />
      </h1>
      <p className={`mt-2 text-sm text-muted transition-all duration-700 ${done ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'}`}>{tagline}</p>
    </div>
  );
}
