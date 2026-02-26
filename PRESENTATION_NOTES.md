# Whales Market v2 — Presentation Notes

## Live Demo

https://wm-fe-slug.vercel.app

## Pages Implemented

| Page | Route | Description |
|------|-------|-------------|
| Markets (Home) | `/markets` | Live/Upcoming/Ended market tabs, top metrics, recent trades |
| Token Detail | `/markets/:tokenId` | Trade panel, order book, recent trades, my orders |
| Dashboard | `/dashboard` | Profile, settlement banners, open/ended orders |
| Staking | `/staking` | Coming soon page |
| Earn | `/earn` | Coming soon page |

## Key Features

- **Pixel-accurate Figma implementation** — colors, spacing, typography matched exactly
- **Full FE logic** — search, sort, filter, tab switch, modal open/close, toggles
- **Mock data everywhere** — realistic crypto data, no empty placeholders
- **Wallet connection flow** — connect modal, wallet state management, dashboard empty state
- **Settlement banners** — animated countdown, clickable market pills, empty state with custom illustration
- **Recent trades** — live-updating with slide-in animation, tier icons, RS badges
- **Skeleton loaders** — smooth loading states for dashboard
- **Responsive design** — desktop + mobile layouts
- **Dark theme** — primary design following Whales Market brand

## Tech Stack

- React 19 + TypeScript
- Tailwind CSS v4 (via @tailwindcss/vite)
- Vite 7
- React Router v7

## How to Run Locally

```bash
npm install
npm run dev
```

## GitHub Repository

https://github.com/SlugMacro/wm-fe
