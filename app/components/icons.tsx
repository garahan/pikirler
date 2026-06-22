import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement> & { size?: number };
const base = (size = 24) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.9,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export const Home = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h5v-6h4v6h5V9.5" /></svg>
);
export const HomeFill = ({ size, ...p }: P) => (
  <svg {...base(size)} fill="currentColor" stroke="none" {...p}><path d="M11.3 2.3a1 1 0 0 1 1.4 0l8 7.2A1 1 0 0 1 21 10.3V20a1 1 0 0 1-1 1h-4.5a1 1 0 0 1-1-1v-4.5h-3V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9.7a1 1 0 0 1 .3-.8Z" /></svg>
);
export const Search = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /></svg>
);
export const Compose = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M12 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-6" /><path d="m17.5 3.5 3 3L12 15l-4 1 1-4Z" /></svg>
);
export const Heart = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M12 20s-7-4.4-9.3-9.2C1.2 7.6 3 4.7 6 4.7c1.9 0 3.2 1.1 4 2.3.8-1.2 2.1-2.3 4-2.3 3 0 4.8 2.9 3.3 6.1C19 15.6 12 20 12 20Z" /></svg>
);
export const HeartFill = ({ size, ...p }: P) => (
  <svg {...base(size)} fill="currentColor" stroke="none" {...p}><path d="M12 21s-7.5-4.7-9.9-9.8C.4 7.5 2.4 4 6 4c2 0 3.4 1.1 4 2.2C10.6 5.1 12 4 14 4c3.6 0 5.6 3.5 3.9 7.2C19.5 16.3 12 21 12 21Z" /></svg>
);
export const Comment = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M12 21a9 9 0 1 0-8.2-5.3L3 21l5.3-.8A9 9 0 0 0 12 21Z" /></svg>
);
export const Repost = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M4 8h11l-2.5-2.5M20 16H9l2.5 2.5" /><path d="M4 8v2.5M20 16v-2.5" /></svg>
);
export const Share = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M21 3 10.5 13.5M21 3l-6.5 18-4-8-8-4Z" /></svg>
);
export const Bookmark = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M6 3h12v18l-6-4.2L6 21Z" /></svg>
);
export const BookmarkFill = ({ size, ...p }: P) => (
  <svg {...base(size)} fill="currentColor" stroke="none" {...p}><path d="M6 3h12a0 0 0 0 1 0 0v17.6a.6.6 0 0 1-.95.5L12 17.3l-5.05 3.8A.6.6 0 0 1 6 20.6Z" /></svg>
);
export const Activity = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M12 20s-7-4.4-9.3-9.2C1.2 7.6 3 4.7 6 4.7c1.9 0 3.2 1.1 4 2.3.8-1.2 2.1-2.3 4-2.3 3 0 4.8 2.9 3.3 6.1C19 15.6 12 20 12 20Z" /></svg>
);
export const Profile = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><circle cx="12" cy="8" r="4" /><path d="M4 20a8 8 0 0 1 16 0" /></svg>
);
export const Logout = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}><path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" /><path d="M10 12H3m0 0 3.5-3.5M3 12l3.5 3.5" /></svg>
);
export const Sparkle = ({ size, ...p }: P) => (
  <svg {...base(size)} fill="currentColor" stroke="none" {...p}><path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8Z" /></svg>
);
