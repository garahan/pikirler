'use client';
export default function PageHeader({ title, brand }: { title?: string; brand?: boolean }) {
  return (
    <header className="sticky top-0 z-30 flex h-[52px] items-center justify-center border-b border-edge bg-midnight/80 px-4 backdrop-blur-md">
      {brand ? <span className="brand text-lg">Pikirler</span> : <span className="font-semibold text-ink">{title}</span>}
    </header>
  );
}
