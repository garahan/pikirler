'use client';

import { useState } from 'react';
import Image from 'next/image';

const styles = ['thumbs', 'bottts', 'fun-emoji', 'adventurer', 'notionists', 'lorelei'];
const mk = (style: string, seed: string) => `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}`;

export interface EditValues { displayName: string; bio: string; location: string; website: string; avatar: string; username: string; }

export default function EditProfile({ initial, onClose, onSaved }: { initial: EditValues; onClose: () => void; onSaved: () => void }) {
  const [displayName, setDisplayName] = useState(initial.displayName);
  const [bio, setBio] = useState(initial.bio);
  const [location, setLocation] = useState(initial.location);
  const [website, setWebsite] = useState(initial.website);
  const [avatar, setAvatar] = useState(initial.avatar);
  const [busy, setBusy] = useState(false);

  const shuffle = () => {
    const style = styles[Math.floor(Math.random() * styles.length)];
    setAvatar(mk(style, initial.username + Math.random().toString(36).slice(2, 6)));
  };

  const save = async () => {
    setBusy(true);
    try {
      const r = await fetch('/api/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ displayName, bio, location, website, avatar }) });
      if (r.ok) { onSaved(); onClose(); }
    } finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div className="animate-slideUp w-full max-w-lg rounded-t-3xl border border-edge bg-card p-5 sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">Profili düzet</h2>
          <button onClick={onClose} className="press text-muted hover:text-ink">✕</button>
        </div>

        <div className="mb-4 flex items-center gap-4">
          <span className="ring-grad"><Image src={avatar} alt="" width={72} height={72} className="h-[72px] w-[72px] rounded-full bg-midnight" unoptimized /></span>
          <button onClick={shuffle} className="press rounded-full border border-edge px-4 py-2 text-sm text-glow hover:bg-glow/10">🎲 Surat üýtget</button>
        </div>

        <div className="space-y-3">
          <Field label="Görkeziljek at"><input value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={40} className="inp" /></Field>
          <Field label="Bio"><textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={160} rows={3} className="inp resize-none" /></Field>
          <Field label="Ýerleşýän ýeri"><input value={location} onChange={(e) => setLocation(e.target.value)} maxLength={60} className="inp" placeholder="Aşgabat, Türkmenistan" /></Field>
          <Field label="Web sahypa"><input value={website} onChange={(e) => setWebsite(e.target.value)} maxLength={100} className="inp" placeholder="https://…" /></Field>
        </div>

        <button onClick={save} disabled={busy} className="press mt-5 w-full rounded-full btn-grad py-3 font-semibold shadow-glowSoft disabled:opacity-40">{busy ? 'Ýatda saklanýar…' : 'Ýatda sakla'}</button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-sm font-medium text-muted">{label}</span>{children}</label>;
}
