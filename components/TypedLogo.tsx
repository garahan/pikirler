'use client';

import { useEffect, useState } from 'react';

const WORDS = ['PIKIRLER', 'THOUGHTS', 'DÜŞÜNJE', 'PIKIRLER', 'IDËÝA', 'OÝLANMA', 'PIKIRLER'];

export default function TypedLogo({ tagline = 'Pikirleriň dünýäsi' }: { tagline?: string }) {
  const [display, setDisplay] = useState('');
  const [done, setDone] = useState(false);
  const [cursor, setCursor] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const FINAL = 'PIKIRLER';
    const sleep = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));

    const typeWord = async (word: string, deleteAfter: boolean) => {
      for (let i = 1; i <= word.length; i++) {
        if (cancelled) return;
        setDisplay(word.slice(0, i));
        await sleep(deleteAfter ? 80 : 110);
      }
      if (!deleteAfter) return;
      await sleep(320);
      for (let i = word.length - 1; i >= 0; i--) {
        if (cancelled) return;
        setDisplay(word.slice(0, i));
        await sleep(50);
      }
      await sleep(140);
    };

    const run = async () => {
      for (let w = 0; w < WORDS.length - 1; w++) {
        await typeWord(WORDS[w], true);
        if (cancelled) return;
      }
      await typeWord(FINAL, false);
      if (!cancelled) setDone(true);
    };

    run();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (done) return;
    const id = setInterval(() => setCursor((c) => !c), 530);
    return () => clearInterval(id);
  }, [done]);

  return (
    <div style={{ textAlign: 'center' }}>
      <h1
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          fontSize: '2.25rem',
          fontWeight: 800,
          letterSpacing: '0.14em',
          color: '#ffffff',
          background: 'none',
          WebkitTextFillColor: '#ffffff',
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            color: '#ffffff',
            WebkitTextFillColor: '#ffffff',
            minWidth: '8ch',
          }}
        >
          {display}
        </span>
        <span
          style={{
            display: 'inline-block',
            width: '3px',
            height: '2.25rem',
            borderRadius: '2px',
            background: '#00e5ff',
            marginLeft: '2px',
            boxShadow: '0 0 10px #00e5ff',
            opacity: done ? 1 : cursor ? 1 : 0,
            transition: done ? '' : 'opacity 0.1s',
          }}
        />
      </h1>
      <p
        style={{
          marginTop: '0.75rem',
          fontSize: '0.875rem',
          color: 'rgba(255,255,255,0.5)',
          opacity: done ? 1 : 0,
          transform: done ? 'translateY(0)' : 'translateY(8px)',
          transition: 'all 0.7s',
        }}
      >
        {tagline}
      </p>
    </div>
  );
}
