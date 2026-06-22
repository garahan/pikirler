'use client';

import { useState } from 'react';
import Feed from './components/Feed';
import CreatePost from './components/CreatePost';

export default function Home() {
  const [refresh, setRefresh] = useState(0);

  return (
    <main className="mx-auto min-h-screen max-w-xl px-4 pb-28">
      {/* header */}
      <header className="sticky top-0 z-30 -mx-4 flex items-center justify-between border-b border-edge bg-midnight/80 px-4 py-3 backdrop-blur-md">
        <h1 className="brand text-2xl">Pikirler</h1>
        <button
          onClick={() => setRefresh((n) => n + 1)}
          className="press text-lg text-muted hover:text-glow"
          aria-label="Täzele"
        >
          ↻
        </button>
      </header>

      <Feed refreshSignal={refresh} />

      <CreatePost onPosted={() => setRefresh((n) => n + 1)} />
    </main>
  );
}
