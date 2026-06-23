'use client';

import { useEffect, useState, useRef } from 'react';

const WORDS = ['PAÝHAS', 'OÝLANMA', 'IDEÝALAR', 'YLHAM', 'DÜŞÜNJE', 'PIKIRLER'];

export default function TypedLogo({ tagline = 'Pikirleriň dünýäsi' }: { tagline?: string }) {
  const [display, setDisplay] = useState('');
  const [done, setDone] = useState(false);
  const [cursor, setCursor] = useState(true);
  
  // New states for the advanced effects
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);
  const [playCount, setPlayCount] = useState(0); 
  
  const cancelled = useRef(false);

  useEffect(() => {
    // Reset everything on mount / restart
    cancelled.current = false;
    setDone(false);
    setIsHighlighted(false);
    setIsGlitching(false);
    setDisplay('');

    const FINAL_WORD = WORDS[WORDS.length - 1];
    const sleep = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));

    const typeWord = async (word: string, deleteAfter: boolean) => {
      // Type out the word
      for (let i = 1; i <= word.length; i++) {
        if (cancelled.current) return;
        setDisplay(word.slice(0, i));
        await sleep(100);
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

      await sleep(600); // Pause so the user can read the word
      if (cancelled.current) return;

      // Effect 2: Highlight & Erase instead of backspacing
      setIsHighlighted(true);
      await sleep(250); // Hold the highlight momentarily

      if (cancelled.current) return;
      setIsHighlighted(false);
      setDisplay(''); // Instantly clear
      await sleep(350); // Pause before typing the next word
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
  }, [playCount]); // Re-run effect when playCount increases

  // Cursor blink logic
  useEffect(() => {
    if (done) return;
    const id = setInterval(() => setCursor((c) => !c), 500);
    return () => clearInterval(id);
  }, [done]);

  // Effect 6: Interactive Restart
  const handleRestart = () => {
    if (done) setPlayCount((prev) => prev + 1);
  };

  return (
    <div className="text-center flex flex-col items-center">
      {/* Embedded Styles for Animations */}
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
        {/* Screen reader text */}
        <span className="sr-only">{WORDS[WORDS.length - 1]}</span>

        {/* Effect 3: The Aura (Background Glow) */}
        <span
          aria-hidden="true"
          className="absolute inset-0 z-0 pointer-events-none select-none"
          style={{
            fontWeight: 800,
            letterSpacing: '-0.04em',
            fontSize: '2rem',
            background: 'linear-gradient(110deg, #00E5FF, #7af9ff 35%, #A78BFA 85%)',
            backgroundSize: '200% auto',
            animation: 'textShine 4s linear infinite', // Effect 1
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            filter: 'blur(16px)',
            opacity: done ? 0.5 : 0.2, // Aura brightens when done
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
            padding: '0 4px', // Space for the highlight box
            margin: '0 -4px',
            borderRadius: '4px',
            // Toggle styles for Highlight & Erase
            ...(isHighlighted
              ? {
                  background: 'rgba(0, 229, 255, 0.3)',
                  color: '#fff',
                  WebkitTextFillColor: '#fff',
                }
              : {
                  background: 'linear-gradient(110deg, #00E5FF, #7af9ff 35%, #A78BFA 85%)',
                  backgroundSize: '200% auto',
                  animation: 'textShine 4s linear infinite', // Effect 1
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  color: 'transparent',
                }),
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
            opacity: done ? 0 : cursor ? 1 : 0, // Hides when done so hover scaling looks clean
            transition: 'opacity 0.1s',
            verticalAlign: 'middle',
          }}
        />
      </h1>
      
      {/* Tagline */}
      <p
        className="mt-1 text-sm select-none"
        style={{
          color: 'var(--muted, #888)', // fallback color if --muted isn't set
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
