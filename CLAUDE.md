# CLAUDE.md — Whales Market FE

## Project Overview

Whales Market frontend — convert Figma design into a fully functional React web app.
This is a **Figma-to-Live-Code** project. The goal is pixel-accurate implementation with real FE logic, not static HTML screenshots.

## Tech Stack

- **React 19** + **TypeScript**
- **Tailwind CSS v4** (via `@tailwindcss/vite` plugin, import with `@import "tailwindcss"`)
- **Vite 7** (dev server & build)
- No backend — all data is **mock data** (JSON/hardcode)

## Commands

- `npm run dev` — start dev server
- `npm run build` — type-check + production build
- `npm run preview` — preview production build

## Project Structure

```
src/
├── pages/           # Page-level components (one per route)
├── components/      # Shared/reusable components
├── layouts/         # Layout wrappers (Sidebar, Header, etc.)
├── mock-data/       # JSON mock data files
├── hooks/           # Custom React hooks
├── utils/           # Utility functions
├── types/           # TypeScript type definitions
├── assets/          # Images, icons, fonts
└── App.tsx          # Root component with routing
```

## Core Requirements (MUST HAVE)

1. **Multi-page app with routing** — use react-router-dom for navigation between pages
2. **Every button/link must respond** — no dead clicks. Navigate, open modal, toggle, filter, etc.
3. **Mock data everywhere** — display realistic data from JSON files, never empty placeholders
4. **FE logic must work** — search, sort, filter, tab switch, form input, modal open/close, toggles
5. **Pixel-accurate to Figma** — match layout, spacing, typography, colors exactly from the design

## Quality Levels (aim for Excellent)

| Level | Criteria |
|-------|----------|
| Minimum | Multi-page, navigation works, layout close to Figma, desktop view |
| Good | Pixel-accurate, FE logic works (click, filter, toggle, modal), mock data correct, responsive mobile |
| Excellent | Complete flow like real app, smooth animation/transition, responsive, feels production-ready |

## Scoring Criteria

| Criteria | Weight | Focus |
|----------|--------|-------|
| AI Utilization | 30% | Workflow efficiency, prompt quality |
| Pixel Accuracy & Logic | 25% | Figma match, FE logic works, mock data correct |
| Completeness | 20% | % of scope completed, number of pages |
| Responsive & Interaction | 15% | Mobile responsive, hover states, animations, transitions |
| Presentation | 10% | Clean demo, smooth flow |

## Coding Conventions

### General
- Use TypeScript strict mode — no `any` types
- Functional components only, use hooks
- File naming: PascalCase for components (`TokenCard.tsx`), camelCase for utils (`formatNumber.ts`)
- One component per file

### Tailwind CSS
- Use Tailwind utility classes directly, avoid custom CSS unless absolutely necessary
- Follow Figma design tokens: use exact colors, spacing, font sizes from the design
- Use Tailwind's responsive prefixes: `sm:`, `md:`, `lg:`, `xl:` for responsive design
- Dark theme is the primary theme (Whales Market uses dark UI)

### Components
- Extract reusable components: buttons, cards, modals, tables, tabs, inputs
- Props should be typed with TypeScript interfaces
- Keep components focused — one responsibility per component

### Routing
- Use react-router-dom with `<BrowserRouter>`
- Define all routes in `App.tsx`
- Use `<Link>` or `useNavigate()` for navigation — never `<a href>`

### Mock Data
- Store in `src/mock-data/` as `.ts` files with typed exports
- Use realistic data that matches what Whales Market would display (tokens, prices, markets, etc.)
- Import and use in components — never hardcode data inline in JSX

### Interactions
- Every clickable element must have a handler
- Modals: use state to toggle visibility, include overlay + close button
- Tabs: use state to track active tab, render content conditionally
- Search/Filter: filter mock data array based on input
- Hover states: use Tailwind `hover:` classes matching Figma design
- Transitions: use Tailwind `transition-*` classes for smooth animations

## Pre-Submission Checklist

- [ ] `npm run dev` runs without errors
- [ ] `npm run build` succeeds (no TypeScript errors)
- [ ] Multiple pages with working navigation
- [ ] No dead buttons — every click has a response
- [ ] Mock data displays correctly, no empty placeholders
- [ ] FE logic works: filter, search, modal, tab switch
- [ ] Layout matches Figma (spacing, typography, colors)
- [ ] Responsive on mobile
- [ ] No console errors in browser
- [ ] Code pushed to GitHub

## Design Reference

- **Primary theme**: Dark mode (dark backgrounds, light text)
- **Product**: Whales Market — a crypto/DeFi pre-market trading platform
- **Key pages to implement**: Markets/Dashboard, Token Detail, Portfolio, etc.
- Always reference the Figma design via MCP when implementing any page or component
- Match colors, border-radius, shadows, and spacing exactly from Figma

## Important Notes

- When receiving a Figma URL or node reference, use the Figma MCP tools to read the design directly
- Build page by page — complete one page fully before moving to the next
- After building each page, compare with Figma and fix any visual differences
- Prioritize desktop view first, then add responsive mobile
- Install dependencies as needed (react-router-dom, lucide-react for icons, etc.)
