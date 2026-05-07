# Purushottam Reddy — Portfolio

A portfolio that took longer to build than some production systems I've shipped. Worth it.

**Live →** [purush-o7.vercel.app](https://purush-o7.vercel.app)

---

## What's inside

A scroll-snapped, section-by-section journey through the stack, experience, and projects of a full-stack + ML engineer. Each section has its own visual concept — no two look the same.

| Section | What it does |
|---|---|
| **Hero** | 7,000-particle face with spring physics + cursor repulsion ring |
| **Education** | Campus parallax art + career timeline |
| **KovilLens** | AR project showcase with 3D temple viewer and image gallery |
| **Skills** | VS Code-themed editor — live code, animated terminal, interactive AI chat |
| **Experience** | Stacking card deck — 5 roles, scrollable bullet points with fade mask |
| **Projects** | Three.js helix — cards orbit a 3D galaxy, click to expand |
| **Footer** | Peacock particle canvas + contact links |

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, static export) |
| 3D | Three.js + React Three Fiber + Drei |
| Animation | Framer Motion |
| Styling | Tailwind CSS + inline styles |
| Icons | Lucide React |
| Analytics | Google Analytics 4 (custom events) |
| Fonts | Space Grotesk · Fira Code · Inter |
| Deploy | Vercel |

---

## Noteworthy implementation details

**Scroll snap** — custom RAF-based snap engine (no CSS scroll-snap). Handles wheel, touch, and keyboard with easing curves and a lock/unlock cycle to prevent double-advances.

**Scroll passthrough** — terminal, chat, and experience content panels capture wheel events when they have content to scroll. Uses an overscroll accumulator: `deltaY` values are summed at the boundary; once the total exceeds **80px**, the event falls through to the snap engine and advances the section. No timers, no gesture detection — just distance. Works the same on both trackpad and mouse wheel. Add `data-scroll-passthrough` to any new scrollable container and it gets this behaviour for free.

**Particle face** — 7,000 points loaded from a pre-generated JSON file. Each particle has position, colour, and stroke-direction for a traveling wave animation. Mouse proximity creates a warm amber glow; the repulsion ring is mapped to the canvas element bounds (not the window) so it tracks correctly regardless of layout.

**Skills section** — a VS Code mimic with real interactive parts. The terminal `PROBLEMS` tab has humorous self-aware diagnostics (`caffeine_intake: "critical"`, `work_life_balance: undefined`). The chat is FAQ-driven with Framer Motion shared-element transitions — pills physically travel to become message bubbles. The amoeba border uses an SVG `feGaussianBlur` + `feColorMatrix` goo filter on multiple radial-gradient blobs that follow the cursor.

**Experience cards** — all 5 cards live in the DOM simultaneously, position-animated via direct style mutation in a scroll listener (no React re-renders in the hot path). Text wrap during card entry is prevented by using `transform: translateX()` instead of `left` — changing `left` causes reflow and text breaks mid-animation.

---

## Running locally

```bash
pnpm install
pnpm dev --host        # --host exposes on local network for mobile testing
```

Open [http://localhost:3000](http://localhost:3000).

```bash
pnpm build             # production build
pnpm start             # serve the build
```

Node 18+ required. Tested on Chrome, Firefox, Safari, and iOS Safari.

---

## Project structure

```
app/
├── _components/
│   ├── skills/          # VS Code section (editor, terminal, chat, amoeba bg)
│   ├── experience/      # Stacking card deck + data
│   ├── cylinder/        # Three.js helix, galaxy, orbit cards
│   ├── sections/        # Hero, education, projects, footer
│   └── particle-face    # 7k-point particle portrait
├── _hooks/
│   ├── use-scroll-snap  # Custom scroll snap engine
│   └── scroll-nav       # Section navigation bridge
├── _lib/
│   └── analytics        # Typed GA4 event helpers
└── page.tsx             # Section layout + scroll budget
```

---

## Notes for contributors (or future me at 2am)

- Adding new scrollable content inside a section? Put `data-scroll-passthrough` on the container. The snap hook handles the boundary handoff automatically.
- All sections are `position: fixed`, layered by z-index, and slide via `translateY` driven by `window.scrollY`. The "page" is just spacer divs — total height = `SECTIONS × 100vh`.
- The Skills section animations reset only on upward scroll toward KovilLens, not when arriving from Experience. Intentional — you shouldn't have to re-watch an animation just because you scrolled up one section and back down.
- `ssr: false` on all Three.js components. Non-negotiable. Don't remove it and then file an issue.

---

*Built by Purushottam Reddy. If you're reading this on GitHub you're already doing better due diligence than most recruiters.*
