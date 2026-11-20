# Purushottam Reddy — Portfolio

A portfolio that took longer to build than some production systems I've shipped. Worth it.

**Live →** [purush-o7.vercel.app](https://purush-o7.vercel.app)

---

## What's inside

A natively scrolling, section-by-section journey through the stack, experience, and projects of a full-stack + ML engineer. Each section has its own visual concept — no two look the same.

| Section | What it does |
|---|---|
| **Hero** | 7,000-particle face with spring physics + cursor repulsion ring |
| **Education** | Campus parallax art + career timeline |
| **KovilLens** | Laptop: project bento (photo, fps, IEEE paper, demo, stack, gallery). Phone: swipeable chapter cards. The live 3D opens full-screen on `/kovil-lens` |
| **Skills** | VS Code-themed editor — live code, animated terminal, interactive AI chat |
| **Experience** | Laptop: sticky split index with sliding role pages. Phone: drawing spine timeline + tap-to-open bottom sheet |
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

**Native scrolling** — nothing steps, snaps or intercepts the wheel, touch or keyboard. The page is a stack of `position: fixed` layers moved by `window.scrollY`, over spacer divs whose count (`_hooks/snap-map.ts`) is derived from the content: the phone Experience timeline, the laptop Experience column and the projects reel each measure themselves and report their length. `use-page-scroll.ts` only restores the position when you come back from `/kovil-lens` and reports the current section to analytics. Scrollable panels inside a section (Skills editor / terminal / chat) are plain `overflow: auto` boxes.

**Particle face** — 7,000 points loaded from a pre-generated JSON file. Each particle has position, colour, and stroke-direction for a traveling wave animation. Mouse proximity creates a warm amber glow; the repulsion ring is mapped to the canvas element bounds (not the window) so it tracks correctly regardless of layout.

**Skills section** — a VS Code mimic with real interactive parts. The terminal `PROBLEMS` tab has humorous self-aware diagnostics (`caffeine_intake: "critical"`, `work_life_balance: undefined`). The chat is FAQ-driven with Framer Motion shared-element transitions — pills physically travel to become message bubbles. The amoeba border uses an SVG `feGaussianBlur` + `feColorMatrix` goo filter on multiple radial-gradient blobs that follow the cursor.

**Experience** — `use-exp-progress.ts` turns `scrollY` into a continuous role position and the layouts write it straight to DOM styles (no React renders in the hot path). Laptop (`ExperienceSplit`): fixed role index on the left, role pages sliding on the right, each page scrolling its own content. Phone (`ExperienceSpine`): a glowing spine that fills as you advance; tapping a card opens `RoleSheet`, a two-stop bottom sheet.

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
│   ├── experience/      # Split index (laptop), spine + bottom sheet (phone), data
│   ├── cylinder/        # Three.js helix, galaxy, orbit cards
│   ├── sections/        # Hero, education, projects shell, footer
│   ├── kovil/           # KovilLens bento (laptop) + chapter cards (phone) + data
├── kovil-lens/          # Full-space 3D explorer route (layout + page)
│   └── particle-face    # 7k-point particle portrait
├── _hooks/
│   ├── use-page-scroll  # Restore-on-return + section analytics (scrolling is native)
│   ├── snap-map         # Device- and content-aware scroll budget
│   └── scroll-nav       # Smooth jump helper
├── _lib/
│   └── analytics        # Typed GA4 event helpers
└── page.tsx             # Section layout + scroll budget
```

---

## Notes for contributors (or future me at 2am)

- Adding scrollable content inside a section? Just use `overflow: auto`; do **not** set `overscroll-behavior: contain` (it would trap the wheel at the panel's end) or `touch-action: pan-x` alone (it blocks vertical swipes).
- All sections are `position: fixed`, layered by z-index, and slide via `translateY` driven by `window.scrollY`. The "page" is just spacer divs — total height = `SECTIONS × 100vh`.
- **Skills window:** the desktop Skills section is a VS Code window — title bar, activity bar, minimap and status bar use the real VS Code icons (`@vscode/codicons`, wrapped by `skills/Codicon.tsx`); the chat is set in the sans font for readability. The phone layout is unchanged.
- **Scroll length:** each measured stage (Experience, projects reel) calls `setLaptopExpStops` / `setReelSnaps` in `snap-map.ts` so the page is exactly as long as its content needs.
- **Phone role sheet:** `RoleSheet` is the shadcn `Drawer` (vaul, `components/ui/drawer.tsx`) with 60% / full snap points; `noBodyStyles` keeps vaul from fixing the body (which would reset `scrollY`).
- **Returning from `/kovil-lens`:** the Explore buttons write `snap:restore=3` to `sessionStorage`; `use-page-scroll.ts` reads it on mount and scrolls to that snap, so Back lands on the KovilLens section.
- The Skills section animations reset only on upward scroll toward KovilLens, not when arriving from Experience. Intentional — you shouldn't have to re-watch an animation just because you scrolled up one section and back down.
- `ssr: false` on all Three.js components. Non-negotiable. Don't remove it and then file an issue.

---

*Built by Purushottam Reddy. If you're reading this on GitHub you're already doing better due diligence than most recruiters.*
