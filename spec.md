# Whales Market FE — Project Specification

## 1. Product Overview

**Whales Market** là nền tảng giao dịch pre-market cho crypto/DeFi, cho phép người dùng mua bán token trước khi chúng được list chính thức. Dự án FE này chuyển đổi thiết kế Figma thành web app React hoàn chỉnh với giao diện dark theme, mock data, và đầy đủ logic tương tác.

**Mục tiêu**: Pixel-accurate implementation — không phải static HTML, mà là app hoạt động như production.

---

## 2. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React | 19 |
| Language | TypeScript | 5.9+ (strict mode) |
| Styling | Tailwind CSS | v4 (`@tailwindcss/vite`) |
| Build Tool | Vite | 7 |
| Routing | react-router-dom | latest |
| Icons | lucide-react | latest |
| Data | Mock data (no backend) | — |

---

## 3. Pages & Routes

| # | Page | Route | Description |
|---|------|-------|-------------|
| 1 | **Landing / Home** | `/` | Trang chủ — hero section, featured markets, stats overview |
| 2 | **Markets / Dashboard** | `/markets` | Danh sách tất cả markets đang active, bảng giá, filter/search |
| 3 | **Token Detail** | `/markets/:tokenId` | Chi tiết token — chart, order book, buy/sell form, market info |
| 4 | **Portfolio** | `/portfolio` | Portfolio người dùng — holdings, P&L, transaction history |
| 5 | **Points Market** | `/points` | Giao dịch points/airdrop allocations |
| 6 | **OTC Market** | `/otc` | Over-the-counter trading interface |

> Các routes sẽ được confirm chính xác khi đọc Figma design.

---

## 4. Layout Structure

```
┌─────────────────────────────────────────────┐
│  Header / Navbar                            │
│  [Logo] [Markets] [Points] [OTC] [Portfolio]│
│  [Connect Wallet]                           │
├─────────────────────────────────────────────┤
│                                             │
│  Main Content Area                          │
│  (page-specific content)                    │
│                                             │
│                                             │
├─────────────────────────────────────────────┤
│  Footer (optional, based on Figma)          │
└─────────────────────────────────────────────┘
```

- **Header**: Sticky top, dark background, navigation links, wallet connect button
- **Sidebar**: Nếu có trong Figma design
- **Main Content**: Thay đổi theo route
- **Footer**: Stats, links, social media (nếu có trong design)

---

## 5. Core Features & Interactions

### 5.1 Navigation
- React Router `<BrowserRouter>` với `<Link>` components
- Active state trên nav item hiện tại
- Mobile: hamburger menu toggle

### 5.2 Markets Table
- Sortable columns (price, volume, change %)
- Search/filter by token name
- Pagination hoặc infinite scroll
- Click row → navigate to token detail

### 5.3 Token Detail Page
- Price chart placeholder (static hoặc simple visualization)
- Order book (buy/sell sides)
- Buy/Sell form với input validation
- Market stats cards (24h volume, price change, etc.)
- Tab switching (Orders, History, Info)

### 5.4 Portfolio
- Holdings table với P&L calculations
- Transaction history list
- Portfolio summary cards (total value, total P&L)
- Filter by token, date range

### 5.5 Modals & Overlays
- Connect Wallet modal
- Confirm Trade modal
- Success/Error notification toasts
- All modals: overlay backdrop + close button + ESC key close

### 5.6 Global Interactions
- Search: filter mock data real-time
- Tabs: state-based content switching
- Toggles: functional on/off states
- Hover states: matching Figma design
- Transitions: smooth `transition-*` Tailwind classes
- No dead buttons — mọi element clickable đều có handler

---

## 6. Mock Data Schema

### Markets
```typescript
interface Market {
  id: string;
  tokenName: string;
  tokenSymbol: string;
  tokenIcon: string;
  price: number;
  priceChange24h: number;      // percentage
  volume24h: number;
  marketCap: number;
  totalSupply: number;
  status: 'active' | 'upcoming' | 'ended';
  category: 'pre-market' | 'points' | 'otc';
}
```

### Orders
```typescript
interface Order {
  id: string;
  marketId: string;
  side: 'buy' | 'sell';
  price: number;
  amount: number;
  total: number;
  status: 'open' | 'filled' | 'cancelled';
  createdAt: string;
  filledAt?: string;
}
```

### Portfolio Holdings
```typescript
interface Holding {
  id: string;
  marketId: string;
  tokenName: string;
  tokenSymbol: string;
  amount: number;
  avgBuyPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercentage: number;
}
```

### Transactions
```typescript
interface Transaction {
  id: string;
  marketId: string;
  type: 'buy' | 'sell';
  price: number;
  amount: number;
  total: number;
  fee: number;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
}
```

> Schema sẽ được điều chỉnh dựa trên Figma design thực tế.

---

## 7. Project Structure

```
src/
├── assets/              # Images, icons, fonts
├── components/          # Shared/reusable components
│   ├── Button.tsx
│   ├── Modal.tsx
│   ├── Table.tsx
│   ├── Tabs.tsx
│   ├── SearchInput.tsx
│   ├── TokenIcon.tsx
│   ├── PriceChange.tsx
│   └── ...
├── layouts/             # Layout wrappers
│   ├── MainLayout.tsx   # Header + Footer + content slot
│   └── Header.tsx
├── pages/               # Page components (one per route)
│   ├── Home.tsx
│   ├── Markets.tsx
│   ├── TokenDetail.tsx
│   ├── Portfolio.tsx
│   └── ...
├── mock-data/           # Typed mock data
│   ├── markets.ts
│   ├── orders.ts
│   ├── portfolio.ts
│   └── transactions.ts
├── hooks/               # Custom hooks
│   ├── useSearch.ts
│   ├── useSort.ts
│   └── useModal.ts
├── utils/               # Utilities
│   ├── formatNumber.ts
│   ├── formatDate.ts
│   └── cn.ts            # classNames helper
├── types/               # TypeScript types
│   └── index.ts
├── App.tsx              # Root + Routes
├── main.tsx             # Entry point
└── index.css            # Tailwind imports
```

---

## 8. Design Specifications

| Property | Value |
|----------|-------|
| Theme | Dark mode (primary) |
| Background | Deep dark (#0D0D0F hoặc theo Figma) |
| Card Background | Slightly lighter dark (#1A1A2E hoặc theo Figma) |
| Primary Color | Brand color từ Figma (likely blue/green) |
| Text Primary | White / near-white |
| Text Secondary | Gray (#9CA3AF range) |
| Border | Subtle dark borders (#2A2A3E range) |
| Border Radius | Theo Figma (likely 8px-16px) |
| Font | Theo Figma (Inter / system font) |

> Tất cả giá trị chính xác sẽ được lấy từ Figma design tokens.

---

## 9. Responsive Breakpoints

| Breakpoint | Width | Target |
|------------|-------|--------|
| Mobile | < 640px (`sm:`) | Phone |
| Tablet | 640px - 1024px (`md:`, `lg:`) | Tablet |
| Desktop | > 1024px (`xl:`) | Desktop (primary) |

- Desktop first → sau đó responsive xuống mobile
- Mobile: single column, hamburger nav, stacked cards
- Tablet: 2-column where appropriate

---

## 10. Dependencies to Install

```bash
npm install react-router-dom lucide-react
```

Thêm nếu cần:
- `clsx` hoặc `tailwind-merge` — conditional classNames
- `recharts` — nếu cần chart visualization
- `framer-motion` — nếu cần animation phức tạp

---

## 11. Development Workflow

1. **Setup**: Install dependencies, verify `npm run dev` works
2. **Layout first**: Build Header, MainLayout, Footer
3. **Page by page**: Implement từng page theo Figma
   - Đọc Figma design → Code → So sánh → Fix differences
4. **Mock data**: Tạo realistic data cho mỗi page
5. **Interactions**: Wire up tất cả buttons, modals, filters, tabs
6. **Responsive**: Add mobile breakpoints
7. **Polish**: Hover states, transitions, animations
8. **QA**: Build check, console errors, dead clicks audit

---

## 12. Quality Checklist

### Must Pass
- [ ] `npm run dev` — no errors
- [ ] `npm run build` — no TypeScript errors
- [ ] Multi-page routing works
- [ ] No dead buttons/links
- [ ] Mock data renders correctly
- [ ] Search/filter/sort functional
- [ ] Modals open/close properly
- [ ] Layout matches Figma

### Should Pass
- [ ] Responsive on mobile
- [ ] Hover states match Figma
- [ ] Smooth transitions/animations
- [ ] No console errors
- [ ] Tab switching works
- [ ] Form inputs validate

### Nice to Have
- [ ] Loading states / skeletons
- [ ] Toast notifications
- [ ] Keyboard shortcuts (ESC close modal)
- [ ] Scroll animations
- [ ] Production-ready feel
