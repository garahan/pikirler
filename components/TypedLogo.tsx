'use client';
import { useEffect, useState } from 'react';

// Words that feel like "brainstorming" — similar vibe to Pikirler (Turkmen for "thoughts/ideas")
const WORDS = [
  'PIKIRLER',
  'THOUGHTS',
  'DÜŞÜNJE',
  'PIKIRLER',
  'IDËÝA',
  'OÝLANMA',
  'PIKIRLER',
];

export default function TypedLogo({ tagline = 'Pikirleriň dünýäsi' }: { tagline?: string }) {
  const [display, setDisplay] = useState('');
  const [done, setDone] = useState(false);
  const [cursor, setCursor] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const FINAL = 'PIKIRLER';

    const sleep = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));

    const typeWord = async (word: string, deleteAfter: boolean) => {
      // type in
      for (let i = 1; i <= word.length; i++) {
        if (cancelled) return;
        setDisplay(word.slice(0, i));
        await sleep(deleteAfter ? 80 : 110);
      }
      if (!deleteAfter) return;
      await sleep(320);
      // delete
      for (let i = word.length - 1; i >= 0; i--) {
        if (cancelled) return;
        setDisplay(word.slice(0, i));
        await sleep(50);
      }
      await sleep(140);
    };

    const run = async () => {
      // type all brainstorm words except the last
      for (let w = 0; w < WORDS.length - 1; w++) {
        await typeWord(WORDS[w], true);
        if (cancelled) return;
      }
      // final: type PIKIRLER and stay
      await typeWord(FINAL, false);
      if (!cancelled) {
        setDone(true);
      }
    };

    run();
    return () => { cancelled = true; };
  }, []);

  // blinking cursor before done
  useEffect(() => {
    if (done) return;
    const id = setInterval(() => setCursor((c) => !c), 530);
    return () => clearInterval(id);
  }, [done]);

  return (
    <div className="text-center">
      <h1 className="relative inline-flex items-center text-4xl font-extrabold tracking-[0.14em]">
        <span className="brand relative inline-flex">
          {display.split('').map((ch, i) => (
            <span key={i} className="letter">{ch}</span>
          ))}
          {done && <span className="sheen" aria-hidden />}
        </span>
        <span
          className={`ml-1 inline-block h-9 w-[3px] rounded bg-glow ${done ? 'animate-glowPulse' : cursor ? 'opacity-100' : 'opacity-0'}`}
          style={{ boxShadow: '0 0 10px var(--glow)', transition: done ? '' : 'opacity 0.1s' }}
        />
      </h1>
      <p className={`mt-3 text-sm text-muted transition-all duration-700 ${done ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}>
        {tagline}
      </p>
    </div>
  );
}
