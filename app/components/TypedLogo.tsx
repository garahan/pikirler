'use client';

import { useEffect, useState, useRef } from 'react';

// Removed 'DÜŞÜNJE'
const WORDS = ['PAÝHAS', 'OÝLANMA', 'IDEÝALAR', 'YLHAM', 'PIKIRLER'];

export default function TypedLogo({ tagline = 'Pikirleriň dünýäsi' }: { tagline?: string }) {
  const [display, setDisplay] = useState('');
  const [done, setDone] = useState(false);
  const [cursor, setCursor] = useState(true);
  
  // Kept Glitch and Restart logic, removed Highlight logic
  const [isGlitching, setIsGlitching] = useState(false);
  const [playCount, setPlayCount] = useState(0); 
  
  const cancelled = useRef(false);

  useEffect(() => {
    cancelled.current = false;
    setDone(false);
    setIsGlitching(false);
    setDisplay('');

    const FINAL_WORD = WORDS[WORDS.length - 1];
    const sleep = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));

    const typeWord = async (word: string, deleteAfter: boolean) => {
      // 1. Typing out the word with human-like variable speed
      for (let i = 1; i <= word.length; i++) {
        if (cancelled.current) return;
        setDisplay(word.slice(0, i));
        
        // Calculate a random speed between 60ms and 140ms
        const randomTypingSpeed = Math.floor(Math.random() * 80) + 60;
        await sleep(randomTypingSpeed);
      }

      // If it's the final word, apply glitch effect and stop
      if (!deleteAfter) {
        if (cancelled.current) return;
        setIsGlitching(true);
        await sleep(300); // Glitch duration
        if (cancelled.current) return;
        setIsGlitching(false);
        return;
      }

      // Wait a moment so the user can read the completed word
      await sleep(800); 
      if (cancelled.current) return;

      // 2. Backspacing the word
      for (let i = word.length - 1; i >= 0; i--) {
        if (cancelled.current) return;
        setDisplay(word.slice(0, i));
        await sleep(40); // Fast, consistent backspacing
      }
      
      // Brief pause before starting the next word
      await sleep(350); 
    };

    const run = async () => {
      for (let w = 0; w < WORDS.length - 1; w++) {
        await typeWord(WORDS[w], true);
        if (cancelled.current) return;
      }
      await typeWord(FINAL_WORD, false);
      if (!cancelled.current) setDone(true);
    };

    run();
    return () => { cancelled.current = true; };
  }, [playCount]);

  useEffect(() => {
    if (done) return;
    const id = setInterval(() => setCursor((c) => !c), 500);
    return () => clearInterval(id);
  }, [done]);

  const handleRestart = () => {
    if (done) setPlayCount((prev) => prev + 1);
  };

  return (
    <div className="text-center flex flex-col items-center">
      <style>{`
        @keyframes textShine {
          to { background-position: 200% center; }
        }
        @keyframes glitchAnim {
          0% { transform: translate(0) }
          20% { transform: translate(-2px, 2px) }
          40% { transform: translate(-2px, -2px) }
          60% { transform: translate(2px, 2px) }
          80% { transform: translate(2px, -2px) }
          100% { transform: translate(0) }
        }
        .glitch-fx {
          animation: glitchAnim 0.3s cubic-bezier(.25, .46, .45, .94) both infinite;
          text-shadow: 2px 0 #00E5FF, -2px 0 #A78BFA;
        }
        .hover-physics {
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .hover-physics:hover {
          transform: scale(1.05);
        }
      `}</style>

      <h1
        onClick={handleRestart}
        title={done ? "Click to replay" : ""}
        className={`relative inline-flex items-center gap-[2px] ${
          done ? 'cursor-pointer hover-physics' : ''
        }`}
      >
        <span className="sr-only">{WORDS[WORDS.length - 1]}</span>

        {/* The Aura Glow */}
        <span
          aria-hidden="true"
          className="absolute inset-0 z-0 pointer-events-none select-none"
          style={{
            fontWeight: 800,
            letterSpacing: '-0.04em',
            fontSize: '2rem',
            background: 'linear-gradient(110deg, #00E5FF, #7af9ff 35%, #A78BFA 85%)',
            backgroundSize: '200% auto',
            animation: 'textShine 4s linear infinite',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            filter: 'blur(16px)',
            opacity: done ? 0.5 : 0.2,
            transition: 'opacity 0.6s ease',
          }}
        >
          {display}
        </span>

        {/* Main Text Element */}
        <span
          aria-hidden="true"
          className={`relative z-10 ${isGlitching ? 'glitch-fx' : ''}`}
          style={{
            fontWeight: 800,
            letterSpacing: '-0.04em',
            fontSize: '2rem',
            minWidth: display.length ? undefined : '1ch',
            display: 'inline-block',
            background: 'linear-gradient(110deg, #00E5FF, #7af9ff 35%, #A78BFA 85%)',
            backgroundSize: '200% auto',
            animation: 'textShine 4s linear infinite',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: 'transparent',
          }}
        >
          {display || '\u00A0'}
        </span>

        {/* Blinking Cursor */}
        <span
          aria-hidden="true"
          className="relative z-10"
          style={{
            display: 'inline-block',
            width: '3px',
            height: '1.9rem',
            borderRadius: '2px',
            background: '#00E5FF',
            boxShadow: '0 0 10px #00E5FF',
            opacity: done ? 0 : cursor ? 1 : 0,
            transition: 'opacity 0.1s',
            verticalAlign: 'middle',
          }}
        />
      </h1>
      
      <p
        className="mt-1 text-sm select-none"
        style={{
          color: 'var(--muted, #888)',
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
