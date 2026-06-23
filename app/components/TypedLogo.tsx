'use client';

import { useEffect, useState, useRef } from 'react';

const WORDS = ['PAÝHAS', 'OÝLANMA', 'IDEÝALAR', 'YLHAM', 'DÜŞÜNJE', 'PIKIRLER'];

export default function TypedLogo({ tagline = 'Pikirleriň dünýäsi' }: { tagline?: string }) {
  const [display, setDisplay] = useState('');
  const [done, setDone] = useState(false);
  const [cursor, setCursor] = useState(true);
  const cancelled = useRef(false);

  useEffect(() => {
    cancelled.current = false;
    // Dynamically grab the last word from the array
    const FINAL_WORD = WORDS[WORDS.length - 1]; 
    const sleep = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));

    const typeWord = async (word: string, deleteAfter: boolean) => {
      for (let i = 1; i <= word.length; i++) {
        if (cancelled.current) return;
        setDisplay(word.slice(0, i));
        await sleep(deleteAfter ? 80 : 110);
      }
      if (!deleteAfter) return;
      await sleep(320);
      for (let i = word.length - 1; i >= 0; i--) {
        if (cancelled.current) return;
        setDisplay(word.slice(0, i));
        await sleep(48);
      }
      await sleep(140);
    };

    const run = async () => {
      // Loop through all words EXCEPT the last one
      for (let w = 0; w < WORDS.length - 1; w++) {
        await typeWord(WORDS[w], true);
        if (cancelled.current) return;
      }
      // Type the final word and leave it
      await typeWord(FINAL_WORD, false);
      if (!cancelled.current) setDone(true);
    };

    run();
    return () => { cancelled.current = true; };
  }, []);

  useEffect(() => {
    if (done) return;
    const id = setInterval(() => setCursor((c) => !c), 530);
    return () => clearInterval(id);
  }, [done]);

  return (
    <div className="text-center">
      <h1 className="relative inline-flex items-center gap-[2px]">
        {/* Screen-reader only text for accessibility */}
        <span className="sr-only">{WORDS[WORDS.length - 1]}</span>
        
        {/* Animated text hidden from screen readers */}
        <span
          aria-hidden="true"
          style={{
            fontWeight: 800,
            letterSpacing: '-0.04em',
            fontSize: '2rem',
            background: 'linear-gradient(110deg, #00E5FF, #7af9ff 35%, #A78BFA 85%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: 'transparent',
            minWidth: display.length ? undefined : '1ch',
            display: 'inline-block',
          }}
        >
          {display || '\u00A0'}
        </span>
        
        {/* Blinking cursor */}
        <span
          aria-hidden="true"
          style={{
            display: 'inline-block',
            width: '3px',
            height: '1.9rem',
            borderRadius: '2px',
            background: '#00E5FF',
            boxShadow: '0 0 10px #00E5FF',
            opacity: done ? 1 : cursor ? 1 : 0,
            transition: done ? '' : 'opacity 0.1s',
            animation: done ? 'glowPulse 2s ease-in-out infinite' : undefined,
            verticalAlign: 'middle',
          }}
        />
      </h1>
      <p
        className="mt-1 text-sm"
        style={{
          color: 'var(--muted)',
          opacity: done ? 1 : 0,
          transform: done ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 0.7s ease, transform 0.7s ease',
        }}
      >
        {tagline}
      </p>
    </div>
  );
}
