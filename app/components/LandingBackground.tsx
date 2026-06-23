'use client';
import { useMemo } from 'react';

export default function LandingBackground() {
  const sparks = useMemo(
    () => Array.from({ length: 16 }, () => ({
      left: `${Math.random() * 100}%`,
      top: `${40 + Math.random() * 60}%`,
      size: 2 + Math.random() * 4,
      dur: `${7 + Math.random() * 7}s`,
      delay: `${Math.random() * 8}s`,
      dx: `${(Math.random() - 0.5) * 40}px`,
    })),
    []
  );
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="aurora-a absolute -left-1/4 -top-1/4 h-[60vh] w-[60vh] rounded-full bg-glow/20 blur-[90px]" />
      <div className="aurora-b absolute -right-1/4 top-0 h-[55vh] w-[55vh] rounded-full bg-accent/20 blur-[90px]" />
      <div className="aurora-c absolute bottom-0 left-1/3 h-[50vh] w-[50vh] rounded-full bg-rose/15 blur-[100px]" />
      {sparks.map((s, i) => (
        <span key={i} className="spark" style={{ left: s.left, top: s.top, width: s.size, height: s.size, '--dur': s.dur, '--delay': s.delay, '--dx': s.dx }} />
      ))}
    </div>
  );
}
