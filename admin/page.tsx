'use client';

import { useState } from 'react';

const PLACEHOLDER = `[
  { "text": "Salam, Pikirler!", "images": [] },
  { "text": "Täze gün, täze pikir #Pikirler" }
]`;

export default function AdminPage() {
  const [secret, setSecret] = useState('');
  const [json, setJson] = useState('');
  const [scheduled, setScheduled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const upload = async () => {
    setResult(null);
    let posts: unknown;
    try {
      posts = JSON.parse(json);
    } catch {
      setResult({ ok: false, msg: 'JSON nädogry. Formaty barla.' });
      return;
    }
    if (!Array.isArray(posts)) {
      setResult({ ok: false, msg: 'JSON massiw (array) bolmaly.' });
      return;
    }

    setBusy(true);
    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
        body: JSON.stringify({ posts, scheduled }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult({
          ok: false,
          msg: data.error === 'unauthorized' ? 'Gizlin söz nädogry.' : `Ýalňyşlyk: ${data.error}`,
        });
      } else {
        setResult({
          ok: true,
          msg: `${data.count} pikir ${data.mode === 'scheduled' ? 'nobata goşuldy' : 'çap edildi'} ✓`,
        });
        setJson('');
      }
    } catch {
      setResult({ ok: false, msg: 'Tora birikmek başartmady.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-lg px-4 py-8">
      <h1 className="brand text-2xl">Admin</h1>
      <p className="mt-1 text-sm text-muted">Köpçülikleýin pikir ýükle.</p>

      <label className="mt-6 block text-sm font-medium text-ink">Gizlin söz</label>
      <input
        type="password"
        value={secret}
        onChange={(e) => setSecret(e.target.value)}
        placeholder="ADMIN_SECRET"
        className="mt-1 w-full rounded-xl border border-edge bg-card px-4 py-2.5 text-ink outline-none focus:border-glow/50"
      />

      <label className="mt-4 block text-sm font-medium text-ink">Pikirler (JSON)</label>
      <textarea
        value={json}
        onChange={(e) => setJson(e.target.value)}
        placeholder={PLACEHOLDER}
        rows={10}
        className="mt-1 w-full resize-y rounded-xl border border-edge bg-card px-4 py-3 font-mono text-sm text-ink outline-none focus:border-glow/50"
      />

      <label className="mt-3 flex items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          checked={scheduled}
          onChange={(e) => setScheduled(e.target.checked)}
          className="h-4 w-4 accent-[#00E5FF]"
        />
        Derrew çap etme — nobata goş (scheduler üçin)
      </label>

      <button
        onClick={upload}
        disabled={busy || !secret || !json.trim()}
        className="press mt-5 w-full rounded-full bg-glow py-3 font-semibold text-midnight shadow-glowSoft disabled:opacity-40"
      >
        {busy ? 'Ýüklenýär…' : scheduled ? 'Nobata goş' : 'Çap et'}
      </button>

      {result && (
        <p
          className={`animate-slideUp mt-4 rounded-xl border px-4 py-3 text-sm ${
            result.ok
              ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
              : 'border-red-400/30 bg-red-400/10 text-red-300'
          }`}
        >
          {result.msg}
        </p>
      )}
    </main>
  );
}
