import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { MarketTab, SortConfig, SortField, UpcomingSortField, UpcomingMarket, InvestorAvatar } from '../types';
import { liveMarkets, upcomingMarkets, endedMarkets, marketTabCounts } from '../mock-data/markets';
import { formatPrice, formatVolume, formatPercent } from '../utils/formatNumber';
import MiniChart from './MiniChart';
import MoniScoreBar from './MoniScoreBar';
import TokenIcon from './TokenIcon';
import { useMarketLiveUpdates, type FlashDirection, type LiveMarket } from '../hooks/useMarketLiveUpdates';

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
    const isCountdown = market.settlementStatus === 'in-progress' || market.settlementStatus === 'upcoming';
    if (!isCountdown) return;

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

  // Show date in UTC
  const date = new Date(market.settleTime);
  const formatted = `${String(date.getUTCDate()).padStart(2, '0')}/${String(date.getUTCMonth() + 1).padStart(2, '0')}/${date.getUTCFullYear()}`;
  const hours = date.getUTCHours();
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 || 12;
  const time = `${String(h12).padStart(2, '0')}:${minutes} ${ampm}`;

  return (
    <div className="flex flex-col items-end gap-1">
      <span className="text-sm font-normal text-[#f9f9fa]">{formatted}</span>
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

function InvestorAvatarsCell({ investors, extra }: { investors: InvestorAvatar[]; extra: number }) {
  if (investors.length === 0) {
    return <span className="text-sm font-normal text-[#7a7a83]">-</span>;
  }

  return (
    <div className="flex items-start pr-[6px]">
      {investors.map((inv, i) => (
        <div
          key={i}
          className="shrink-0 size-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white border border-[#0a0a0b] -mr-1.5"
          style={{ backgroundColor: inv.color, zIndex: investors.length - i }}
        >
          {inv.label}
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

/* ───── Main Component ───── */

export default function LiveMarketTable() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<MarketTab>('live');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: null, direction: null });

  // Live-updating markets (only for live tab)
  const liveData = useMarketLiveUpdates(liveMarkets);

  const tabs: { key: MarketTab; label: string; count: number }[] = [
    { key: 'live', label: 'Live Market', count: marketTabCounts.live },
    { key: 'upcoming', label: 'Upcoming', count: marketTabCounts.upcoming },
    { key: 'ended', label: 'Ended', count: marketTabCounts.ended },
  ];

  const handleSort = (field: SortField | UpcomingSortField) => {
    setSortConfig((prev) => {
      if (prev.field === field) {
        if (prev.direction === 'asc') return { field, direction: 'desc' };
        if (prev.direction === 'desc') return { field: null, direction: null };
      }
      return { field, direction: 'asc' };
    });
  };

  /* ─── Live / Ended tab data ─── */
  const getLiveEndedMarkets = (): LiveMarket[] => {
    const staticToLive = (arr: readonly { id: string; tokenSymbol: string; tokenName: string; tokenIcon: string; chain: 'solana' | 'ethereum' | 'sui'; lastPrice: number; priceChange24h: number; volume24h: number; volumeChange24h: number; totalVolume: number; totalVolumeChange: number; impliedFdv: string; settleTime: string | null; status: string; settlementStatus?: string; chartData: number[]; chartColor: 'green' | 'red' }[]): LiveMarket[] =>
      arr.map((m) => ({ ...m, status: m.status as 'live' | 'upcoming' | 'ended', settlementStatus: m.settlementStatus as 'in-progress' | 'upcoming' | 'new-market' | undefined, flash: null as FlashDirection }));

    const data = activeTab === 'live' ? [...liveData] : [...staticToLive(endedMarkets)];

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

  const sortableHeaders: { label: string; field: SortField; width: string }[] = [
    { label: 'Last Price ($)', field: 'lastPrice', width: 'w-[180px]' },
    { label: '24h Vol. ($)', field: 'volume24h', width: 'w-[180px]' },
    { label: 'Total Vol. ($)', field: 'totalVolume', width: 'w-[180px]' },
    { label: 'Implied FDV ($)', field: 'impliedFdv', width: 'w-[180px]' },
  ];

  const isUpcoming = activeTab === 'upcoming';

  return (
    <div>
      {/* Tab Filters */}
      <div className="flex items-center gap-6 mb-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setSortConfig({ field: null, direction: null }); }}
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
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="w-full">
        {isUpcoming ? (
          /* ════════════ UPCOMING TABLE ════════════ */
          <>
            {/* Upcoming Header */}
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
                  <SortIcon
                    active={sortConfig.field === 'watchers'}
                    direction={sortConfig.field === 'watchers' ? sortConfig.direction : null}
                  />
                </button>
              </div>
              <div className="w-[192px] shrink-0">
                <span className="text-xs font-normal text-[#7a7a83] border-b border-dashed border-[#2e2e34]">
                  Investors & Backers
                </span>
              </div>
              <div className="w-[192px] shrink-0">
                <span className="text-xs font-normal text-[#7a7a83]">
                  Narrative
                </span>
              </div>
              <div className="w-[192px] shrink-0">
                <button
                  onClick={() => handleSort('moniScore')}
                  className="inline-flex items-center gap-0.5 text-xs font-normal text-[#7a7a83] hover:text-[#f9f9fa] transition-colors border-b border-dashed border-[#2e2e34]"
                >
                  Moni Score
                  <SortIcon
                    active={sortConfig.field === 'moniScore'}
                    direction={sortConfig.field === 'moniScore' ? sortConfig.direction : null}
                  />
                </button>
              </div>
            </div>

            {/* Upcoming Rows */}
            {getUpcomingMarkets().map((market) => (
              <div
                key={market.id}
                onClick={() => navigate(`/markets/${market.id}`)}
                className="flex items-center border-b border-[#1b1b1c] h-[76px] px-2 cursor-pointer transition-colors hover:bg-[rgba(255,255,255,0.02)]"
              >
                {/* Token */}
                <div className="flex-1 min-w-0 flex items-center">
                  <UpcomingTokenCell market={market} />
                </div>

                {/* Watchers */}
                <div className="w-[192px] shrink-0">
                  <span className="text-sm font-normal text-[#f9f9fa] tabular-nums">
                    {market.watchers.toLocaleString('en-US')}
                  </span>
                </div>

                {/* Investors & Backers */}
                <div className="w-[192px] shrink-0">
                  <InvestorAvatarsCell investors={market.investors} extra={market.investorExtra} />
                </div>

                {/* Narrative */}
                <div className="w-[192px] shrink-0">
                  <NarrativeBadges narratives={market.narratives} />
                </div>

                {/* Moni Score */}
                <div className="w-[192px] shrink-0">
                  <MoniScoreBar score={market.moniScore} />
                </div>
              </div>
            ))}
          </>
        ) : (
          /* ════════════ LIVE / ENDED TABLE ════════════ */
          <>
            {/* Header */}
            <div className="flex items-center border-b border-[#1b1b1c] h-9 px-2">
              <div className="flex-1 min-w-0">
                <span className="text-xs font-normal text-[#7a7a83]">Token</span>
              </div>
              <div className="w-[112px] shrink-0" />
              {sortableHeaders.map((header) => (
                <div key={header.field} className={`${header.width} shrink-0 text-right`}>
                  <button
                    onClick={() => handleSort(header.field)}
                    className="inline-flex items-center gap-0.5 text-xs font-normal text-[#7a7a83] hover:text-[#f9f9fa] transition-colors"
                  >
                    {header.label}
                    <SortIcon
                      active={sortConfig.field === header.field}
                      direction={sortConfig.field === header.field ? sortConfig.direction : null}
                    />
                  </button>
                </div>
              ))}
              <div className="w-[180px] shrink-0 text-right">
                <span className="text-xs font-normal text-[#7a7a83] border-b border-dashed border-[#2e2e34]">
                  Settle Time (UTC)
                </span>
              </div>
            </div>

            {/* Rows */}
            {getLiveEndedMarkets().map((market) => (
              <div
                key={market.id}
                onClick={() => navigate(`/markets/${market.id}`)}
                className="flex items-center border-b border-[#1b1b1c] h-[76px] px-2 cursor-pointer transition-colors hover:bg-[rgba(255,255,255,0.02)]"
              >
                {/* Token */}
                <div className="flex-1 min-w-0 flex items-center">
                  <LiveTokenCell market={market} />
                </div>

                {/* Chart */}
                <div className="w-[112px] shrink-0 flex items-center pr-4">
                  <MiniChart data={market.chartData} color={market.chartColor} />
                </div>

                {/* Last Price */}
                <div className="w-[180px] shrink-0">
                  <PriceCell price={market.lastPrice} change={market.priceChange24h} flash={market.flash} />
                </div>

                {/* 24h Vol */}
                <div className="w-[180px] shrink-0">
                  <VolumeCell volume={market.volume24h} change={market.volumeChange24h} flash={market.flash} />
                </div>

                {/* Total Vol */}
                <div className="w-[180px] shrink-0">
                  <VolumeCell volume={market.totalVolume} change={market.totalVolumeChange} flash={null} />
                </div>

                {/* Implied FDV */}
                <div className="w-[180px] shrink-0 text-right">
                  <span className="text-sm font-medium text-[#f9f9fa] tabular-nums">{market.impliedFdv}</span>
                </div>

                {/* Settle Time */}
                <div className="w-[180px] shrink-0">
                  <SettlementCell market={market} />
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
