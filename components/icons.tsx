import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement> & { size?: number };
// one cohesive system: 24 grid, 1.75 stroke, round caps/joins
const base = (size = 24) => ({
  width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
  stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
});
const fill = (size = 24) => ({ width: size, height: size, viewBox: '0 0 24 24', fill: 'currentColor' });

export const Home = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M3.2 11 12 3.5l8.8 7.5" /><path d="M5.2 9.6V20a1 1 0 0 0 1 1H9v-5.5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1V21h2.8a1 1 0 0 0 1-1V9.6" /></svg>);
export const HomeFill = ({ size, ...p }: P) => (<svg {...fill(size)} {...p}><path d="M11.35 2.94a1 1 0 0 1 1.3 0l8.5 7.2A1 1 0 0 1 21.5 11v9.2a1 1 0 0 1-1 1H15a1 1 0 0 1-1-1V16a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v4.2a1 1 0 0 1-1 1H3.5a1 1 0 0 1-1-1V11a1 1 0 0 1 .35-.76Z" /></svg>);

export const Search = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><circle cx="11" cy="11" r="7" /><path d="m20.5 20.5-3.6-3.6" /></svg>);
export const Compose = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M11 4H6.5A2.5 2.5 0 0 0 4 6.5v11A2.5 2.5 0 0 0 6.5 20h11a2.5 2.5 0 0 0 2.5-2.5V13" /><path d="m18 3.2 2.8 2.8L12.4 14.4l-3.5.7.7-3.5Z" /></svg>);

export const Heart = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M12 20.3C6.7 16.9 3 13.4 3 9.5 3 7 5 5.2 7.4 5.2c1.7 0 3.2 1 3.9 2.4l.7 1.3.7-1.3c.7-1.4 2.2-2.4 3.9-2.4C21 5.2 23 7 23 9.5c0 3.9-3.7 7.4-9 10.8Z" transform="translate(-1)" /></svg>);
export const HeartFill = ({ size, ...p }: P) => (<svg {...fill(size)} {...p}><path d="M12 20.7C6.4 17.1 2.5 13.4 2.5 9.3 2.5 6.6 4.7 4.6 7.4 4.6c1.9 0 3.5 1 4.6 2.7C13 5.6 14.7 4.6 16.6 4.6c2.7 0 4.9 2 4.9 4.7 0 4.1-3.9 7.8-9.5 11.4Z" /></svg>);

export const Comment = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M21 11.6c0 4.2-4 7.6-9 7.6a10 10 0 0 1-2.9-.43L4 20.5l1.1-3.6A7.1 7.1 0 0 1 3 11.6C3 7.4 7 4 12 4s9 3.4 9 7.6Z" /></svg>);
export const Repost = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M4.5 9.5V8.2A2.7 2.7 0 0 1 7.2 5.5H17l-2.3-2.3M19.5 14.5v1.3a2.7 2.7 0 0 1-2.7 2.7H7l2.3 2.3" /></svg>);
export const Share = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M21.5 3 11 13.6M21.5 3 15 21l-3.9-7.4L3.7 9.7Z" /></svg>);
export const Bookmark = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M6.5 4.5h11a1 1 0 0 1 1 1V20l-6.5-4-6.5 4V5.5a1 1 0 0 1 1-1Z" /></svg>);
export const BookmarkFill = ({ size, ...p }: P) => (<svg {...fill(size)} {...p}><path d="M6.5 3.5h11a1.5 1.5 0 0 1 1.5 1.5v15.4a.6.6 0 0 1-.92.5L12 16.7l-6.08 4.2a.6.6 0 0 1-.92-.5V5A1.5 1.5 0 0 1 6.5 3.5Z" /></svg>);

export const Activity = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M12 20.3C6.7 16.9 3 13.4 3 9.5 3 7 5 5.2 7.4 5.2c1.7 0 3.2 1 3.9 2.4l.7 1.3.7-1.3c.7-1.4 2.2-2.4 3.9-2.4C21 5.2 23 7 23 9.5c0 3.9-3.7 7.4-9 10.8Z" transform="translate(-1)" /></svg>);
export const Profile = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><circle cx="12" cy="8" r="3.6" /><path d="M4.5 20a7.5 7.5 0 0 1 15 0" /></svg>);
export const Logout = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M14 4.5h3.5A2 2 0 0 1 19.5 6.5v11a2 2 0 0 1-2 2H14" /><path d="M10 12H3.5m0 0 3.3-3.3M3.5 12l3.3 3.3" /></svg>);
export const Sparkle = ({ size, ...p }: P) => (<svg {...fill(size)} {...p}><path d="M12 2l1.7 5.1a3 3 0 0 0 1.9 1.9L20.7 11l-5.1 1.7a3 3 0 0 0-1.9 1.9L12 19.7l-1.7-5.1a3 3 0 0 0-1.9-1.9L3.3 11l5.1-1.7a3 3 0 0 0 1.9-1.9Z" /></svg>);
export const More = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none" /></svg>);
export const Trash = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M4 6.5h16M9 6.5V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v1.5M6.5 6.5 7.3 19a1.5 1.5 0 0 0 1.5 1.4h6.4a1.5 1.5 0 0 0 1.5-1.4l.8-12.5" /></svg>);
