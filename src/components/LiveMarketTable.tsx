import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { MarketTab, SortConfig, SortField, UpcomingSortField, EndedSortField, UpcomingMarket, EndedMarket, InvestorAvatar } from '../types';
import { liveMarkets, upcomingMarkets, endedMarkets, marketTabCounts } from '../mock-data/markets';
import { formatPrice, formatVolume, formatPercent } from '../utils/formatNumber';
import MiniChart from './MiniChart';
import MoniScoreBar from './MoniScoreBar';
import TokenIcon from './TokenIcon';
import { useMarketLiveUpdates, type FlashDirection, type LiveMarket } from '../hooks/useMarketLiveUpdates';

const ENDED_PAGE_SIZE = 6;

/* ───── Shared helpers ───── */

function SortIcon({ active, direction }: { active: boolean; direction: 'asc' | 'desc' | null }) {
  return (
    <div className="ml-1 inline-flex flex-col gap-[1px]">
      <svg width="6" height="4" viewBox="0 0 6 4" fill="none">
        <path d="M3 0L6 4H0L3 0Z" fill={active && direction === 'asc' ? '#f9f9fa' : '#3a3a3d'} />
      </svg>
      <svg width="6" height="4" viewBox="0 0 6 4" fill="none">
        <path d="M3 4L0 0H6L3 4Z" fill={active && direction === 'desc' ? '#f9f9fa' : '#3a3a3d'} />
      </svg>
    </div>
  );
}

function formatUTCDate(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  const date = `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${d.getUTCFullYear()}`;
  const hours = d.getUTCHours();
  const minutes = String(d.getUTCMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 || 12;
  const time = `${String(h12).padStart(2, '0')}:${minutes} ${ampm}`;
  return { date, time };
}

/* ───── Live-market cells ───── */

function SettlementCell({ market }: { market: LiveMarket }) {
  const [countdown, setCountdown] = useState('');

  const calculateCountdown = useCallback(() => {
    if (!market.settleTime) return '';
    const diff = new Date(market.settleTime).getTime() - Date.now();
    if (diff <= 0) return '0h:0m:0s';
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return `${h}h:${String(m).padStart(2, '0')}m:${String(s).padStart(2, '0')}s`;
  }, [market.settleTime]);

  useEffect(() => {
    if (!market.settleTime) return;
    const isCountdownType = market.settlementStatus === 'in-progress' || market.settlementStatus === 'upcoming';
    if (!isCountdownType) return;

    setCountdown(calculateCountdown());
    const timer = setInterval(() => setCountdown(calculateCountdown()), 1000);
    return () => clearInterval(timer);
  }, [market.settleTime, market.settlementStatus, calculateCountdown]);

  if (!market.settleTime) {
    return (
      <div className="flex flex-col items-end">
        <span className="text-sm font-normal text-[#7a7a83]">TBA</span>
      </div>
    );
  }

  if (market.settlementStatus === 'in-progress') {
    return (
      <div className="flex flex-col items-end gap-1">
        <span className="text-sm font-medium text-[#fb923c] tabular-nums">{countdown}</span>
        <span className="inline-flex items-center rounded-full bg-[rgba(249,115,22,0.1)] px-2 py-0.5 text-[10px] font-medium uppercase leading-3 text-[#fb923c]">
          In Progress
        </span>
      </div>
    );
  }

  if (market.settlementStatus === 'upcoming') {
    return (
      <div className="flex flex-col items-end gap-1">
        <span className="text-sm font-medium text-[#5bd197] tabular-nums">{countdown}</span>
        <span className="inline-flex items-center rounded-full bg-[rgba(22,194,132,0.1)] px-2 py-0.5 text-[10px] font-medium uppercase leading-3 text-[#5bd197]">
          Upcoming
        </span>
      </div>
    );
  }

  const { date, time } = formatUTCDate(market.settleTime);
  return (
    <div className="flex flex-col items-end gap-1">
      <span className="text-sm font-normal text-[#f9f9fa]">{date}</span>
      <span className="text-xs font-normal text-[#7a7a83]">{time}</span>
    </div>
  );
}

function LiveTokenCell({ market }: { market: LiveMarket }) {
  return (
    <div className="flex items-center gap-3">
      <TokenIcon symbol={market.tokenSymbol} chain={market.chain} size="md" />
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-[#f9f9fa]">{market.tokenSymbol}</span>
          {market.settlementStatus === 'new-market' && (
            <span className="inline-flex items-center rounded-full bg-[rgba(59,130,246,0.1)] px-2 py-0.5 text-[10px] font-medium uppercase leading-3 text-[#60a5fa]">
              New Market
            </span>
          )}
        </div>
        <span className="text-xs font-normal text-[#7a7a83]">{market.tokenName}</span>
      </div>
    </div>
  );
}

function PriceCell({ price, change, flash }: { price: number; change: number; flash: FlashDirection }) {
  const isPositive = change >= 0;

  const flashClass = flash === 'up'
    ? 'animate-[flashGreen_1.2s_ease-out]'
    : flash === 'down'
      ? 'animate-[flashRed_1.2s_ease-out]'
      : '';

  return (
    <div className="flex flex-col items-end gap-1">
      <span className={`text-sm font-medium tabular-nums transition-colors ${flashClass} ${flash === 'up' ? 'text-[#5bd197]' : flash === 'down' ? 'text-[#fd5e67]' : 'text-[#f9f9fa]'}`}>
        ${formatPrice(price)}
      </span>
      <span className={`text-xs font-normal tabular-nums ${isPositive ? 'text-[#5bd197]' : 'text-[#fd5e67]'}`}>
        {formatPercent(change)}
      </span>
    </div>
  );
}

function VolumeCell({ volume, change, flash }: { volume: number; change: number; flash: FlashDirection }) {
  const isPositive = change >= 0;

  const flashClass = flash === 'up'
    ? 'animate-[flashGreen_1.2s_ease-out]'
    : flash === 'down'
      ? 'animate-[flashRed_1.2s_ease-out]'
      : '';

  return (
    <div className="flex flex-col items-end gap-1">
      <span className={`text-sm font-medium tabular-nums transition-colors ${flashClass} ${flash ? 'text-[#f9f9fa]' : 'text-[#f9f9fa]'}`}>
        {formatVolume(volume)}
      </span>
      <span className={`text-xs font-normal tabular-nums ${isPositive ? 'text-[#5bd197]' : 'text-[#fd5e67]'}`}>
        {formatPercent(change)}
      </span>
    </div>
  );
}

/* ───── Upcoming-specific cells ───── */

function UpcomingTokenCell({ market }: { market: UpcomingMarket }) {
  return (
    <div className="flex items-center gap-3">
      <TokenIcon symbol={market.tokenSymbol} chain={market.chain} size="md" />
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-[#f9f9fa]">{market.tokenSymbol}</span>
          {market.settlementStatus === 'new-market' && (
            <span className="inline-flex items-center rounded-full bg-[rgba(59,130,246,0.1)] px-2 py-0.5 text-[10px] font-medium uppercase leading-3 text-[#60a5fa]">
              New Market
            </span>
          )}
        </div>
        <span className="text-xs font-normal text-[#7a7a83]">{market.tokenName}</span>
      </div>
    </div>
  );
}

function InvestorAvatarsCell({ investors, extra }: { investors: InvestorAvatar[]; extra: number }) {
  if (investors.length === 0) {
    return <span className="text-sm font-normal text-[#7a7a83]">-</span>;
  }

  return (
    <div className="flex items-start pr-[6px]">
      {investors.map((inv, i) => (
        <div
          key={i}
          className="shrink-0 size-5 rounded-full overflow-hidden border border-[#0a0a0b] -mr-1.5"
          style={{ zIndex: investors.length - i }}
        >
          <img src={inv.image} alt="" className="size-full object-cover" />
        </div>
      ))}
      {extra > 0 && (
        <div className="shrink-0 w-9 h-5 rounded-lg bg-[#1b1b1c] border border-[#0a0a0b] flex items-center justify-center -mr-1.5 z-0">
          <span className="text-[10px] font-medium leading-3 text-[#f9f9fa]">+{extra}</span>
        </div>
      )}
    </div>
  );
}

function NarrativeBadges({ narratives }: { narratives: string[] }) {
  if (narratives.length === 0) {
    return <span className="text-sm font-normal text-[#7a7a83]">-</span>;
  }

  return (
    <div className="flex items-start gap-1 flex-wrap">
      {narratives.map((tag, i) => (
        <span
          key={i}
          className="inline-flex items-center justify-center rounded-full bg-[#1b1b1c] px-2 py-1 text-[10px] font-medium uppercase leading-3 text-[#7a7a83]"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

/* ───── Ended-specific cells ───── */

function EndedSettleCell({ time }: { time: string }) {
  const { date, time: t } = formatUTCDate(time);
  return (
    <div className="flex flex-col items-end gap-1">
      <span className="text-sm font-normal text-[#f9f9fa] tabular-nums">{date}</span>
      <span className="text-xs font-normal text-[#7a7a83] tabular-nums">{t}</span>
    </div>
  );
}

/* ───── Pagination ───── */

function Pagination({ currentPage, totalPages, onPageChange }: { currentPage: number; totalPages: number; onPageChange: (page: number) => void }) {
  if (totalPages <= 1) return null;

  const getPageNumbers = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('ellipsis');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('ellipsis');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-1 mt-4">
      {/* Prev */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center justify-center size-8 rounded-lg border border-[#2e2e34] text-[#7a7a83] hover:text-[#f9f9fa] hover:border-[#3a3a3d] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M8.5 3.5L5.5 7L8.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>

      {/* Page Numbers */}
      {getPageNumbers().map((page, i) =>
        page === 'ellipsis' ? (
          <span key={`e-${i}`} className="flex items-center justify-center size-8 text-xs text-[#7a7a83]">…</span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`flex items-center justify-center size-8 rounded-lg text-xs font-medium transition-colors ${
              page === currentPage
                ? 'bg-[#16c284] text-[#0a0a0b]'
                : 'text-[#7a7a83] hover:text-[#f9f9fa] hover:bg-[#1b1b1c]'
            }`}
          >
            {page}
          </button>
        ),
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center justify-center size-8 rounded-lg border border-[#2e2e34] text-[#7a7a83] hover:text-[#f9f9fa] hover:border-[#3a3a3d] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5.5 3.5L8.5 7L5.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
    </div>
  );
}

/* ───── Search Input ───── */

function SearchInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a7a83]" width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search"
        className="w-[256px] h-9 pl-9 pr-3 rounded-lg border border-[#1f1f23] bg-transparent text-sm text-[#f9f9fa] placeholder-[#7a7a83] outline-none focus:border-[#2e2e34] transition-colors"
      />
    </div>
  );
}

/* ───── Network Filter ───── */

type NetworkFilter = 'all' | 'solana' | 'ethereum' | 'sui';
const NETWORKS: { key: NetworkFilter; label: string }[] = [
  { key: 'all', label: 'All Networks' },
  { key: 'solana', label: 'Solana' },
  { key: 'ethereum', label: 'Ethereum' },
  { key: 'sui', label: 'Sui' },
];

function NetworkDropdown({ value, onChange }: { value: NetworkFilter; onChange: (v: NetworkFilter) => void }) {
  const [open, setOpen] = useState(false);
  const activeLabel = NETWORKS.find((n) => n.key === value)?.label ?? 'Network';

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 h-9 px-4 rounded-lg bg-[#1b1b1c] text-sm text-[#f9f9fa] hover:bg-[#252527] transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke="#7a7a83" strokeWidth="1.5" />
          <path d="M3 8H13" stroke="#7a7a83" strokeWidth="1" />
          <path d="M8 2C9.5 3.5 10 5.5 10 8C10 10.5 9.5 12.5 8 14" stroke="#7a7a83" strokeWidth="1" />
          <path d="M8 2C6.5 3.5 6 5.5 6 8C6 10.5 6.5 12.5 8 14" stroke="#7a7a83" strokeWidth="1" />
        </svg>
        {activeLabel}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={`transition-transform ${open ? 'rotate-180' : ''}`}>
          <path d="M3 5L6 8L9 5" stroke="#7a7a83" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 w-[180px] rounded-lg border border-[#2e2e34] bg-[#131315] py-1 shadow-lg">
            {NETWORKS.map((n) => (
              <button
                key={n.key}
                onClick={() => { onChange(n.key); setOpen(false); }}
                className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                  value === n.key ? 'text-[#16c284]' : 'text-[#f9f9fa] hover:bg-[#1b1b1c]'
                }`}
              >
                {n.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════ */
/* ───────────── Main Component ──────────────── */
/* ═══════════════════════════════════════════════ */

export default function LiveMarketTable() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<MarketTab>('live');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: null, direction: null });

  // Ended-tab state
  const [endedPage, setEndedPage] = useState(1);
  const [endedSearch, setEndedSearch] = useState('');
  const [endedNetwork, setEndedNetwork] = useState<NetworkFilter>('all');

  // Live-updating markets (only for live tab)
  const liveData = useMarketLiveUpdates(liveMarkets);

  const tabs: { key: MarketTab; label: string; count: number }[] = [
    { key: 'live', label: 'Live Market', count: marketTabCounts.live },
    { key: 'upcoming', label: 'Upcoming', count: marketTabCounts.upcoming },
    { key: 'ended', label: 'Ended', count: marketTabCounts.ended },
  ];

  const handleSort = (field: SortField | UpcomingSortField | EndedSortField) => {
    setSortConfig((prev) => {
      if (prev.field === field) {
        if (prev.direction === 'asc') return { field, direction: 'desc' };
        if (prev.direction === 'desc') return { field: null, direction: null };
      }
      return { field, direction: 'asc' };
    });
  };

  const handleTabChange = (tab: MarketTab) => {
    setActiveTab(tab);
    if (tab === 'upcoming') {
      setSortConfig({ field: 'watchers', direction: 'desc' });
    } else if (tab === 'ended') {
      setSortConfig({ field: 'totalVolume', direction: 'desc' });
      setEndedPage(1);
      setEndedSearch('');
      setEndedNetwork('all');
    } else {
      setSortConfig({ field: null, direction: null });
    }
  };

  /* ─── Live tab data ─── */
  const getLiveMarkets = (): LiveMarket[] => {
    const data = [...liveData];
    if (sortConfig.field && sortConfig.direction) {
      const field = sortConfig.field as SortField;
      data.sort((a, b) => {
        const aVal = a[field] as number;
        const bVal = b[field] as number;
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
        }
        return 0;
      });
    }
    return data;
  };

  /* ─── Upcoming tab data ─── */
  const getUpcomingMarkets = (): UpcomingMarket[] => {
    const data = [...upcomingMarkets];
    if (sortConfig.field && sortConfig.direction) {
      const field = sortConfig.field as UpcomingSortField;
      if (field === 'watchers' || field === 'moniScore') {
        data.sort((a, b) => {
          const aVal = a[field];
          const bVal = b[field];
          return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
        });
      }
    }
    return data;
  };

  /* ─── Ended tab data (filtered + sorted + paginated) ─── */
  const filteredEndedMarkets = useMemo((): EndedMarket[] => {
    let data = [...endedMarkets];

    // Search filter
    if (endedSearch.trim()) {
      const q = endedSearch.toLowerCase().trim();
      data = data.filter(
        (m) => m.tokenSymbol.toLowerCase().includes(q) || m.tokenName.toLowerCase().includes(q),
      );
    }

    // Network filter
    if (endedNetwork !== 'all') {
      data = data.filter((m) => m.chain === endedNetwork);
    }

    // Sort
    if (sortConfig.field && sortConfig.direction) {
      const field = sortConfig.field as EndedSortField;
      if (field === 'lastPrice' || field === 'totalVolume') {
        data.sort((a, b) => {
          return sortConfig.direction === 'asc' ? a[field] - b[field] : b[field] - a[field];
        });
      }
    }

    return data;
  }, [endedSearch, endedNetwork, sortConfig]);

  const endedTotalPages = Math.max(1, Math.ceil(filteredEndedMarkets.length / ENDED_PAGE_SIZE));
  const pagedEndedMarkets = filteredEndedMarkets.slice(
    (endedPage - 1) * ENDED_PAGE_SIZE,
    endedPage * ENDED_PAGE_SIZE,
  );

  // Reset page when filters change
  useEffect(() => {
    setEndedPage(1);
  }, [endedSearch, endedNetwork]);

  const liveSortableHeaders: { label: string; field: SortField; width: string }[] = [
    { label: 'Last Price ($)', field: 'lastPrice', width: 'w-[180px]' },
    { label: '24h Vol. ($)', field: 'volume24h', width: 'w-[180px]' },
    { label: 'Total Vol. ($)', field: 'totalVolume', width: 'w-[180px]' },
    { label: 'Implied FDV ($)', field: 'impliedFdv', width: 'w-[180px]' },
  ];

  const isUpcoming = activeTab === 'upcoming';
  const isEnded = activeTab === 'ended';

  return (
    <div>
      {/* Tab Filters + Search/Network — fixed height to prevent layout jank */}
      <div className="flex items-center justify-between mb-2 h-10">
        <div className="flex items-center gap-6">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className="flex items-center gap-2 transition-colors"
              >
                <span className={`text-xl font-medium leading-7 ${isActive ? 'text-[#f9f9fa]' : 'text-[#7a7a83] hover:text-[#f9f9fa]'}`}>
                  {tab.label}
                </span>
                <span
                  className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium leading-4 ${
                    isActive
                      ? 'bg-[rgba(22,194,132,0.15)] text-[#5bd197]'
                      : 'bg-[#252527] text-[#7a7a83]'
                  }`}
                >
                  {tab.key === 'ended' ? filteredEndedMarkets.length : tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search + Network filter (Ended only) */}
        {isEnded && (
          <div className="flex items-center gap-3">
            <SearchInput value={endedSearch} onChange={setEndedSearch} />
            <NetworkDropdown value={endedNetwork} onChange={setEndedNetwork} />
          </div>
        )}
      </div>

      {/* Table */}
      <div className="w-full">
        {isUpcoming ? (
          /* ════════════ UPCOMING TABLE ════════════ */
          <>
            <div className="flex items-center border-b border-[#1b1b1c] h-9 px-2">
              <div className="flex-1 min-w-0">
                <span className="text-xs font-normal text-[#7a7a83]">Token</span>
              </div>
              <div className="w-[192px] shrink-0">
                <button
                  onClick={() => handleSort('watchers')}
                  className="inline-flex items-center gap-0.5 text-xs font-normal text-[#7a7a83] hover:text-[#f9f9fa] transition-colors"
                >
                  Watchers
                  <SortIcon active={sortConfig.field === 'watchers'} direction={sortConfig.field === 'watchers' ? sortConfig.direction : null} />
                </button>
              </div>
              <div className="w-[192px] shrink-0">
                <span className="text-xs font-normal text-[#7a7a83] border-b border-dashed border-[#2e2e34]">
                  Investors & Backers
                </span>
              </div>
              <div className="w-[192px] shrink-0">
                <span className="text-xs font-normal text-[#7a7a83]">Narrative</span>
              </div>
              <div className="w-[192px] shrink-0">
                <button
                  onClick={() => handleSort('moniScore')}
                  className="inline-flex items-center gap-0.5 text-xs font-normal text-[#7a7a83] hover:text-[#f9f9fa] transition-colors border-b border-dashed border-[#2e2e34]"
                >
                  Moni Score
                  <SortIcon active={sortConfig.field === 'moniScore'} direction={sortConfig.field === 'moniScore' ? sortConfig.direction : null} />
                </button>
              </div>
            </div>

            {getUpcomingMarkets().map((market) => (
              <div
                key={market.id}
                onClick={() => navigate(`/markets/${market.id}`)}
                className="flex items-center border-b border-[#1b1b1c] h-[76px] px-2 cursor-pointer transition-colors hover:bg-[rgba(255,255,255,0.02)]"
              >
                <div className="flex-1 min-w-0 flex items-center"><UpcomingTokenCell market={market} /></div>
                <div className="w-[192px] shrink-0">
                  <span className="text-sm font-normal text-[#f9f9fa] tabular-nums">{market.watchers.toLocaleString('en-US')}</span>
                </div>
                <div className="w-[192px] shrink-0"><InvestorAvatarsCell investors={market.investors} extra={market.investorExtra} /></div>
                <div className="w-[192px] shrink-0"><NarrativeBadges narratives={market.narratives} /></div>
                <div className="w-[192px] shrink-0"><MoniScoreBar score={market.moniScore} /></div>
              </div>
            ))}
          </>
        ) : isEnded ? (
          /* ════════════ ENDED TABLE ════════════ */
          <>
            {/* Ended Header */}
            <div className="flex items-center border-b border-[#1b1b1c] h-9 px-2">
              <div className="flex-1 min-w-0">
                <span className="text-xs font-normal text-[#7a7a83]">Token</span>
              </div>
              <div className="w-[192px] shrink-0 text-right">
                <button
                  onClick={() => handleSort('lastPrice')}
                  className="inline-flex items-center gap-0.5 text-xs font-normal text-[#7a7a83] hover:text-[#f9f9fa] transition-colors"
                >
                  Last Price ($)
                  <SortIcon active={sortConfig.field === 'lastPrice'} direction={sortConfig.field === 'lastPrice' ? sortConfig.direction : null} />
                </button>
              </div>
              <div className="w-[192px] shrink-0 text-right">
                <button
                  onClick={() => handleSort('totalVolume')}
                  className="inline-flex items-center gap-0.5 text-xs font-normal text-[#7a7a83] hover:text-[#f9f9fa] transition-colors"
                >
                  Total Vol. ($)
                  <SortIcon active={sortConfig.field === 'totalVolume'} direction={sortConfig.field === 'totalVolume' ? sortConfig.direction : null} />
                </button>
              </div>
              <div className="w-[192px] shrink-0 text-right">
                <span className="text-xs font-normal text-[#7a7a83] border-b border-dashed border-[#2e2e34]">
                  Settle Starts (UTC)
                </span>
              </div>
              <div className="w-[192px] shrink-0 text-right">
                <span className="text-xs font-normal text-[#7a7a83] border-b border-dashed border-[#2e2e34]">
                  Settle Ends (UTC)
                </span>
              </div>
            </div>

            {/* Ended Rows — min-height prevents layout jank when filtering */}
            <div className="min-h-[456px]">
            {pagedEndedMarkets.length === 0 ? (
              <div className="flex items-center justify-center h-[76px] text-sm text-[#7a7a83]">
                No results found
              </div>
            ) : (
              pagedEndedMarkets.map((market) => (
                <div
                  key={market.id}
                  onClick={() => navigate(`/markets/${market.id}`)}
                  className="flex items-center border-b border-[#1b1b1c] h-[76px] px-2 cursor-pointer transition-colors hover:bg-[rgba(255,255,255,0.02)]"
                >
                  {/* Token */}
                  <div className="flex-1 min-w-0 flex items-center">
                    <div className="flex items-center gap-3">
                      <TokenIcon symbol={market.tokenSymbol} chain={market.chain} size="md" />
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-[#f9f9fa]">{market.tokenSymbol}</span>
                        <span className="text-xs font-normal text-[#7a7a83]">{market.tokenName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Last Price */}
                  <div className="w-[192px] shrink-0 text-right">
                    <span className="text-sm font-normal text-[#f9f9fa] tabular-nums">
                      ${formatPrice(market.lastPrice)}
                    </span>
                  </div>

                  {/* Total Vol */}
                  <div className="w-[192px] shrink-0 text-right">
                    <span className="text-sm font-normal text-[#f9f9fa] tabular-nums">
                      {formatVolume(market.totalVolume)}
                    </span>
                  </div>

                  {/* Settle Starts */}
                  <div className="w-[192px] shrink-0 text-right">
                    <EndedSettleCell time={market.settleStartTime} />
                  </div>

                  {/* Settle Ends */}
                  <div className="w-[192px] shrink-0 text-right">
                    <EndedSettleCell time={market.settleEndTime} />
                  </div>
                </div>
              ))
            )}
            </div>

            {/* Pagination */}
            <Pagination currentPage={endedPage} totalPages={endedTotalPages} onPageChange={setEndedPage} />
          </>
        ) : (
          /* ════════════ LIVE TABLE ════════════ */
          <>
            <div className="flex items-center border-b border-[#1b1b1c] h-9 px-2">
              <div className="flex-1 min-w-0">
                <span className="text-xs font-normal text-[#7a7a83]">Token</span>
              </div>
              <div className="w-[112px] shrink-0" />
              {liveSortableHeaders.map((header) => (
                <div key={header.field} className={`${header.width} shrink-0 text-right`}>
                  <button
                    onClick={() => handleSort(header.field)}
                    className="inline-flex items-center gap-0.5 text-xs font-normal text-[#7a7a83] hover:text-[#f9f9fa] transition-colors"
                  >
                    {header.label}
                    <SortIcon active={sortConfig.field === header.field} direction={sortConfig.field === header.field ? sortConfig.direction : null} />
                  </button>
                </div>
              ))}
              <div className="w-[180px] shrink-0 text-right">
                <span className="text-xs font-normal text-[#7a7a83] border-b border-dashed border-[#2e2e34]">
                  Settle Time (UTC)
                </span>
              </div>
            </div>

            {getLiveMarkets().map((market) => (
              <div
                key={market.id}
                onClick={() => navigate(`/markets/${market.id}`)}
                className="flex items-center border-b border-[#1b1b1c] h-[76px] px-2 cursor-pointer transition-colors hover:bg-[rgba(255,255,255,0.02)]"
              >
                <div className="flex-1 min-w-0 flex items-center"><LiveTokenCell market={market} /></div>
                <div className="w-[112px] shrink-0 flex items-center pr-4"><MiniChart data={market.chartData} color={market.chartColor} /></div>
                <div className="w-[180px] shrink-0"><PriceCell price={market.lastPrice} change={market.priceChange24h} flash={market.flash} /></div>
                <div className="w-[180px] shrink-0"><VolumeCell volume={market.volume24h} change={market.volumeChange24h} flash={market.flash} /></div>
                <div className="w-[180px] shrink-0"><VolumeCell volume={market.totalVolume} change={market.totalVolumeChange} flash={null} /></div>
                <div className="w-[180px] shrink-0 text-right"><span className="text-sm font-medium text-[#f9f9fa] tabular-nums">{market.impliedFdv}</span></div>
                <div className="w-[180px] shrink-0"><SettlementCell market={market} /></div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
