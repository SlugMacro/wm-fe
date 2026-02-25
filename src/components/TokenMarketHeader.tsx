import { useState, useEffect, useCallback } from 'react';
import type { TokenDetail } from '../types';
import TokenIcon from './TokenIcon';

function ArrowRightUpIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M3.5 8.5L8.5 3.5M8.5 3.5H4.5M8.5 3.5V7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M3.5 5.5L7 9L10.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function formatSettleTime(settleTime: string | null): string {
  if (!settleTime) return 'TBA';
  const date = new Date(settleTime);
  const day = String(date.getUTCDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  return `${day} ${month} ${year} ${hours}:${minutes}`;
}

function formatVol(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `$${value.toFixed(2)}`;
}

function useSettleCountdown(settleTime: string | null, settlementStatus?: string) {
  const isCountdown = settlementStatus === 'in-progress' || settlementStatus === 'upcoming';

  const calculateCountdown = useCallback(() => {
    if (!settleTime) return '';
    const diff = new Date(settleTime).getTime() - Date.now();
    if (diff <= 0) return '0h:00m:00s';
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return `${h}h:${String(m).padStart(2, '0')}m:${String(s).padStart(2, '0')}s`;
  }, [settleTime]);

  const [countdown, setCountdown] = useState(isCountdown ? calculateCountdown() : '');

  useEffect(() => {
    if (!settleTime || !isCountdown) return;
    setCountdown(calculateCountdown());
    const timer = setInterval(() => setCountdown(calculateCountdown()), 1000);
    return () => clearInterval(timer);
  }, [settleTime, isCountdown, calculateCountdown]);

  return { countdown, isCountdown };
}

export default function TokenMarketHeader({ token }: { token: TokenDetail }) {
  const [aboutOpen, setAboutOpen] = useState(false);
  const isPositive = token.priceChange >= 0;
  const { countdown, isCountdown } = useSettleCountdown(token.settleTime, token.settlementStatus);

  const settleTimeValue = isCountdown ? countdown : formatSettleTime(token.settleTime);
  const settleTimeColor = token.settlementStatus === 'in-progress'
    ? 'text-[#fb923c]'
    : token.settlementStatus === 'upcoming'
      ? 'text-[#5bd197]'
      : undefined;

  const stats = [
    {
      label: '24h Vol.',
      value: formatVol(token.volume24h),
      change: token.volumeChange24h !== 0 ? `${token.volumeChange24h >= 0 ? '+' : ''}${token.volumeChange24h.toFixed(2)}%` : undefined,
      changeColor: token.volumeChange24h >= 0 ? 'text-[#5bd197]' : 'text-[#fd5e67]',
    },
    {
      label: 'Total Vol.',
      value: formatVol(token.totalVolume),
      change: token.totalVolumeChange !== 0 ? `${token.totalVolumeChange >= 0 ? '+' : ''}${token.totalVolumeChange.toFixed(2)}%` : undefined,
      changeColor: token.totalVolumeChange >= 0 ? 'text-[#5bd197]' : 'text-[#fd5e67]',
    },
    {
      label: 'Implied FDV',
      value: token.impliedFdv,
      dashed: true,
      tooltip: 'Fully Diluted Valuation — the theoretical market cap if all tokens were in circulation, calculated from the current pre-market price.',
    },
    {
      label: 'Settle Time (UTC)',
      value: settleTimeValue,
      valueColor: settleTimeColor,
      badge: token.settlementStatus === 'in-progress'
        ? { label: 'In Progress', color: 'text-[#fb923c]', bg: 'bg-[rgba(249,115,22,0.1)]' }
        : token.settlementStatus === 'upcoming'
          ? { label: 'Upcoming', color: 'text-[#5bd197]', bg: 'bg-[rgba(22,194,132,0.1)]' }
          : undefined,
      dashed: true,
      tooltip: 'The date and time (UTC) when the pre-market contracts will settle and tokens will be distributed to buyers.',
    },
  ];

  return (
    <div className="flex items-center justify-between border-b-[4px] border-[#1b1b1c] py-4">
      {/* Left: Token info + stats */}
      <div className="flex flex-1 items-end gap-8 overflow-visible">
        {/* Token icon + name */}
        <div className="flex items-center gap-2 shrink-0">
          <TokenIcon symbol={token.tokenSymbol} chain={token.chain} size="md" />
          <div className="flex flex-col">
            <span className="text-lg font-medium leading-7 text-[#f9f9fa]">{token.tokenSymbol}</span>
            <span className="text-xs leading-4 font-normal text-[#7a7a83]">{token.tokenName}</span>
          </div>
        </div>

        {/* Price */}
        <div className="flex flex-col shrink-0">
          <span className="text-lg font-medium leading-7 text-[#f9f9fa] tabular-nums">
            ${token.price.toFixed(4)}
          </span>
          <span className={`text-xs leading-4 font-normal tabular-nums ${isPositive ? 'text-[#5bd197]' : 'text-[#fd5e67]'}`}>
            {isPositive ? '+' : ''}{token.priceChange.toFixed(2)}%
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col gap-1.5 shrink-0">
              {stat.tooltip ? (
                <span className="relative group cursor-help inline-flex self-start">
                  <span className={`text-xs leading-4 font-normal text-[#7a7a83] ${stat.dashed ? 'border-b border-dashed border-[#2e2e34]' : ''}`}>
                    {stat.label}
                  </span>
                  {/* Tooltip */}
                  <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 rounded-md border border-[#252527] bg-[#141415] px-3 py-2 text-left text-[11px] leading-4 font-normal text-[#b4b4ba] shadow-lg opacity-0 pointer-events-none transition-opacity duration-200 group-hover:opacity-100 group-hover:pointer-events-auto z-[150]">
                    {stat.tooltip}
                  </span>
                </span>
              ) : (
                <span className={`text-xs leading-4 font-normal text-[#7a7a83] ${stat.dashed ? 'border-b border-dashed border-[#2e2e34]' : ''}`}>
                  {stat.label}
                </span>
              )}
              <div className="flex items-center gap-1">
                <span className={`text-xs leading-4 font-normal tabular-nums ${stat.valueColor ?? 'text-[#f9f9fa]'}`}>{stat.value}</span>
                {stat.change && (
                  <span className={`text-xs leading-4 font-normal tabular-nums ${stat.changeColor}`}>{stat.change}</span>
                )}
                {stat.badge && (
                  <span className={`inline-flex items-center rounded-full ${stat.badge.bg} px-1.5 py-0.5 text-[10px] font-medium uppercase leading-3 ${stat.badge.color}`}>
                    {stat.badge.label}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Buttons */}
      <div className="flex items-center gap-3 shrink-0">
        {/* About token button group */}
        <div className="flex items-stretch overflow-hidden rounded-lg border border-[#252527]">
          <button
            onClick={() => setAboutOpen(!aboutOpen)}
            className="flex items-center gap-1.5 border-r border-[#252527] pl-4 pr-2 py-2 text-sm font-medium leading-5 text-[#f9f9fa] transition-colors hover:bg-[#252527]/50"
          >
            About {token.tokenSymbol}
            <ArrowRightUpIcon />
          </button>
          <button
            className="flex items-center justify-center p-2 text-[#f9f9fa] transition-colors hover:bg-[#252527]/50"
          >
            <ChevronDownIcon />
          </button>
        </div>

        {/* Divider */}
        <div className="h-[18px] w-px bg-[#252527]" />

        {/* Create Order */}
        <button className="flex items-center justify-center rounded-lg bg-[#f9f9fa] px-4 py-2 text-sm font-medium leading-5 text-[#0a0a0b] transition-opacity hover:opacity-90">
          Create Order
        </button>
      </div>
    </div>
  );
}
