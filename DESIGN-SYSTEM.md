# Pikirler — Design System & Engagement Blueprint

A practical reference for the look, motion, and retention mechanics. Built around: mobile-first, dark-by-default, Threads-simplicity, Apple-polish, premium-but-not-manipulative.

## 1. Color palette
Defined in `tailwind.config.js` + CSS vars in `globals.css`.

| Token | Hex | Use |
|---|---|---|
| midnight | `#0A0C12` | app background |
| card / surface | `#161C24` / `#11151D` | raised surfaces |
| glow (cyan) | `#00E5FF` | primary action, likes, focus |
| accent (violet) | `#A78BFA` | brand gradient, highlights |
| rose / pink | `#FF4D8D` | errors, accents |
| urgent (amber) | `#FFB800` | saved/bookmarks, urgency |
| ink | `#F1F5F9` | primary text |
| muted | `#8896AB` | secondary text |
| edge | `rgba(120,180,255,0.10)` | hairline borders |

**Signature gradient:** `linear-gradient(110deg, cyan → violet)` — wordmark, primary buttons (`.btn-primary`), avatar rings (`.ring-grad` adds rose).
Action semantics: like=cyan, repost=emerald, share=violet, save=amber. Never red — keeps a unique identity vs Threads/X.

## 2. Typography
- Font: **Inter** (400/500/600/700/800), system fallback.
- Scale (feed-optimized for density): body **14px / leading-snug**, names 14px semibold, meta 13px, micro 11–12px, page titles 17–18px, display (logo) 32–40px tracking-wide.
- Headings use `letter-spacing: -0.04em`; the logo uses `+0.12em` for a premium typed feel.

## 3. Motion design
- Easing: spring `cubic-bezier(0.34,1.56,0.64,1)` for anything that "pops"; ease-out for fades.
- Durations: micro 120ms (tap), standard 260–400ms, ambient loops 2.4–3s.
- Primitives (in `globals.css`): `likePop`, `burst` (particles), `countRoll`, `slideUp`, `toastIn`, `checkPop`, `breathe`, `floaty`, `glowPulse`, `radar`, `shimmer`.
- Rule: every tappable element dips (`.press` → scale .9). Optimistic UI everywhere — never wait on the network to react.
- Respect `prefers-reduced-motion` (already wired).

## 4. Component library (built)
`PostCard`, `Composer`, `Feed`, `PostList`, `SideNav`, `AppShell`, `PageHeader`, `TrendingTopics`, `UserRow`, `EditProfile`, `AvatarPicker`, `TypedLogo`, `icons` (one cohesive 24-grid, 1.75-stroke set).

## 5. Landing
- `/login` is the gate (auth-walled via `middleware.ts`).
- `TypedLogo`: letters of "PIKIRLER" type in (130ms cadence) with a blinking cursor; tagline fades up on completion. Floating sparkle badge above.
- Register tab collects avatar (style picker) + bio for instant personalization.

## 6. Feed
- 600px centered column, hairline row dividers (Threads density), sticky frosted header.
- Infinite scroll (IntersectionObserver), pull-to-refresh radar, shimmer skeletons, trending hashtag pills.
- Floating gradient compose button (mobile bottom bar) / sidebar "Täze pikir".

## 7. Profile
- Gradient banner, ringed avatar, display name + @handle, bio, location, website, join date, post/follower/following counts, follow-morph / edit.

## 8. Notifications (Activity)
- `/activity` aggregates likes, replies, and new followers with a small action badge over each avatar.

## 9–10. Retention & engagement — roadmap (not yet built)
Prioritized, each is a small, additive feature:
1. **Daily streak** ("yzygiderlilik") — `Streak` model (userId, current, longest, lastActiveDate); increment on first daily visit; flame badge in header. *Highest ROI.*
2. **Achievements** — `Achievement` rows (first post, first 10 likes, first 100 followers…); celebratory `checkPop` + confetti toast on unlock.
3. **Reputation/score** — derived from likes+reposts received; show a subtle tier ring color on avatar.
4. **Milestone celebrations** — follower/like thresholds trigger a one-time modal.
5. **Recommended users** — "Kimi yzarlamaly" rail from most-followed / shared-interest.
6. **"New pikirler" pill** — slides in at top when fresh posts arrive (poll every 30s).

Guardrail: celebrate genuine actions, never fabricate scarcity, guilt, or fake counts. Keep the bot badge visible.

## 11. UX flows
- **First run:** land `/login` → register (avatar+bio) → home feed.
- **Create:** FAB → Composer → upload images (Cloudinary) → optimistic insert → success toast.
- **Engage:** like (burst+haptic) / reply (inline) / repost / save / share (copy link) — all optimistic, all persisted.
- **Discover:** Search (people+posts), Trending pills, profiles.
- **Manage:** delete own posts (admin deletes any) via the ⋯ menu.

## 12. Wireframe (text)
```
┌ Sidebar ┐ ┌──────── Feed (max 600) ────────┐
│ ✦ logo  │ │ [frosted sticky header]        │
│ + new   │ │ 🔥 trending pills              │
│ home    │ │ ┌ avatar  name · time   ⋯ ┐    │
│ search  │ │ │ text…                    │    │
│ activity│ │ │ [image grid]             │    │
│ saved   │ │ │ ♥12  💬3  ⇄  ➤      🔖   │    │
│ profile │ │ └──────────────────────────┘    │
│ ───     │ │ … infinite scroll …            │
│ avatar  │ └────────────────────────────────┘
└─────────┘   (mobile: bottom tab bar + FAB)
```

## 13. Implementation recommendations
- **Liquid-glass surfaces:** apply `backdrop-blur-md` + translucent bg (`bg-midnight/70`) + 1px `border-edge` for the frosted look; reserve heavy blur for sticky bars (perf).
- **Performance:** keep animations on `transform`/`opacity` only (GPU). Avoid layout-animating width/height. Virtualize the feed when lists exceed ~200 items.
- **Images:** Cloudinary upload is wired; add `f_auto,q_auto` transforms to the delivered URL for smaller payloads.
- **Accessibility:** maintain `:focus-visible` rings, `aria-pressed` on toggles, and ≥40px tap targets.
- **Next steps before public launch:** rate limiting (Upstash, already provisioned), then the streak + recommended-users rails for retention.
