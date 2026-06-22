'use client';

import { useState } from 'react';

export default function AdminPage() {
  const [secret, setSecret] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [activeFrom, setActiveFrom] = useState('08:00');
  const [activeTo, setActiveTo] = useState('23:00');
  const [intervalMin, setIntervalMin] = useState(5);
  const [intervalMax, setIntervalMax] = useState(20);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = () => {
    if (secret === process.env.NEXT_PUBLIC_ADMIN_SECRET) {
      setAuthenticated(true);
      setMessage('');
    } else {
      setMessage('Nädogry açar!');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setMessage('Iberilýär...');
    try {
      const text = await file.text();
      const posts = JSON.parse(text);
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ posts, activeFrom, activeTo, intervalMin, intervalMax }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`✅ ${data.count} sany post shedulera goşuldy!`);
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (e) {
      setMessage('❌ JSON formaty nädogry');
    }
    setUploading(false);
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-midnight flex items-center justify-center p-4">
        <div className="bg-card p-8 rounded-xl border border-borderGlow max-w-sm w-full">
          <h1 className="text-2xl font-bold text-cyan">Admin</h1>
          <p className="text-textSecondary text-sm">Admin açaryny giriziň</p>
          <input
            type="password"
            className="bg-black/30 text-textMain p-2 rounded mt-4 w-full border border-borderGlow focus:border-cyan outline-none"
            placeholder="Açar"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
          {message && <p className="text-red-400 text-sm mt-2">{message}</p>}
          <button onClick={handleLogin} className="mt-4 bg-cyan text-midnight px-6 py-2 rounded-full font-bold w-full">
            Gir
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight text-textMain p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-cyan">Pikirler Admin</h1>
        <p className="text-textSecondary">Bulk upload & scheduler</p>

        <div className="mt-8 bg-card p-6 rounded-xl border border-borderGlow">
          <h2 className="text-xl text-amber font-semibold">📤 Bulk Upload (JSON)</h2>
          <div className="mt-2">
            <input
              type="file"
              accept=".json"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-textSecondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan/20 file:text-cyan hover:file:bg-cyan/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-textSecondary text-sm">Başlangyç wagty</label>
              <input
                type="time"
                value={activeFrom}
                onChange={(e) => setActiveFrom(e.target.value)}
                className="bg-black/30 p-2 rounded w-full border border-borderGlow focus:border-cyan outline-none"
              />
            </div>
            <div>
              <label className="block text-textSecondary text-sm">Gutarnyk wagty</label>
              <input
                type="time"
                value={activeTo}
                onChange={(e) => setActiveTo(e.target.value)}
                className="bg-black/30 p-2 rounded w-full border border-borderGlow focus:border-cyan outline-none"
              />
            </div>
            <div>
              <label className="block text-textSecondary text-sm">Aralyk (min) – iň az</label>
              <input
                type="number"
                value={intervalMin}
                onChange={(e) => setIntervalMin(Number(e.target.value))}
                className="bg-black/30 p-2 rounded w-full border border-borderGlow focus:border-cyan outline-none"
              />
            </div>
            <div>
              <label className="block text-textSecondary text-sm">Aralyk (min) – iň köp</label>
              <input
                type="number"
                value={intervalMax}
                onChange={(e) => setIntervalMax(Number(e.target.value))}
                className="bg-black/30 p-2 rounded w-full border border-borderGlow focus:border-cyan outline-none"
              />
            </div>
          </div>

          {message && <p className="mt-3 text-sm text-textMain">{message}</p>}

          <button
            onClick={handleUpload}
            disabled={uploading || !file}
            className="mt-4 bg-amber text-midnight px-8 py-3 rounded-full font-bold hover:shadow-glow transition disabled:opacity-50"
          >
            {uploading ? 'Iberilýär...' : '🚀 Sheduler-i işe giriz'}
          </button>
        </div>

        <div className="mt-4 p-4 bg-card/50 rounded-lg border border-borderGlow">
          <p className="text-xs text-textSecondary">
            📝 JSON format: <code className="bg-black/30 px-2 py-1 rounded text-cyan">[{"text":"Söz", "images":["url"]}]</code>
          </p>
        </div>
      </div>
    </div>
  );
}
